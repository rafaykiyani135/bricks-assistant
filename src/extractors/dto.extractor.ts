/**
 * DTO Extractor
 * Extracts DTO/Input class definitions with validation decorators
 */

import { DtoIR, DtoFieldIR, ExtractionResult } from '../types/ir.types';
import {
    parseTypeScript,
    getRootNode,
    findClassDeclarations,
    getClassName,
    findDecorators,
    getDecoratorName,
    findDescendantsByType,
    getNodeText,
    findFirstChildByType,
} from '../parser/ts-parser';
import { hasDecorator } from './base-extractor';

// Common validation decorators from class-validator
const VALIDATION_DECORATORS = new Set([
    'IsString',
    'IsNumber',
    'IsInt',
    'IsBoolean',
    'IsEmail',
    'IsUrl',
    'IsUUID',
    'IsDate',
    'IsArray',
    'IsOptional',
    'IsNotEmpty',
    'IsEmpty',
    'MinLength',
    'MaxLength',
    'Min',
    'Max',
    'Matches',
    'IsEnum',
    'ValidateNested',
    'Type',
    'IsPositive',
    'IsNegative',
    'ArrayMinSize',
    'ArrayMaxSize',
]);

// GraphQL decorators from @nestjs/graphql
const GRAPHQL_FIELD_DECORATORS = new Set([
    'Field',
    'InputType',
    'ObjectType',
    'ArgsType',
]);

/**
 * Determine if a class is a DTO based on naming or decorators
 */
function isDtoClass(classNode: any, fileName: string): boolean {
    // Check file naming convention
    if (
        fileName.includes('.dto.') ||
        fileName.includes('.input.') ||
        fileName.includes('Input') ||
        fileName.includes('Dto')
    ) {
        return true;
    }

    // Check for GraphQL input decorators
    if (
        hasDecorator(classNode, 'InputType') ||
        hasDecorator(classNode, 'ArgsType')
    ) {
        return true;
    }

    // Check if class has validation decorators on fields
    const classBody = findDescendantsByType(classNode, 'class_body')[0];
    if (classBody) {
        for (const child of classBody.children) {
            if (child.type === 'public_field_definition') {
                const decorators = findDecorators(child);
                for (const dec of decorators) {
                    const name = getDecoratorName(dec);
                    if (name && VALIDATION_DECORATORS.has(name)) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

/**
 * Extract DTOs from a TypeScript file
 */
export function extractDtos(
    content: string,
    filePath: string
): ExtractionResult<DtoIR> {
    const tree = parseTypeScript(content);
    const rootNode = getRootNode(tree);
    const classNodes = findClassDeclarations(rootNode);
    const dtos: DtoIR[] = [];

    const fileName = filePath.split(/[/\\]/).pop() || '';

    for (const classNode of classNodes) {
        const className = getClassName(classNode);
        if (!className) continue;

        // Check if this is a DTO class
        if (!isDtoClass(classNode, fileName)) continue;

        // Extract fields
        const fields = extractDtoFields(classNode);

        // Check for class extension
        const extendsClause = findDescendantsByType(classNode, 'extends_clause')[0];
        let extendsClass: string | undefined;
        if (extendsClause) {
            const typeNode = findDescendantsByType(extendsClause, 'type_identifier')[0];
            if (typeNode) {
                extendsClass = getNodeText(typeNode);
            }
        }

        dtos.push({
            name: className,
            file: filePath,
            fields,
            extendsClass,
        });
    }

    return { items: dtos, filePath };
}

/**
 * Extract fields from a DTO class
 */
function extractDtoFields(classNode: any): DtoFieldIR[] {
    const fields: DtoFieldIR[] = [];
    const classBody = findDescendantsByType(classNode, 'class_body')[0];

    if (!classBody) return fields;

    for (const child of classBody.children) {
        // Handle class properties
        if (
            child.type === 'public_field_definition' ||
            child.type === 'property_declaration'
        ) {
            const field = extractField(child);
            if (field) {
                fields.push(field);
            }
        }
    }

    return fields;
}

/**
 * Extract a single field definition
 */
function extractField(fieldNode: any): DtoFieldIR | null {
    // Get field name
    const nameNode =
        findFirstChildByType(fieldNode, 'property_identifier') ||
        findFirstChildByType(fieldNode, 'private_property_identifier');

    if (!nameNode) return null;

    const name = getNodeText(nameNode);

    // Check if optional (has ? after name)
    const isOptional = fieldNode.children.some(
        (c: any) => c.type === '?' || getNodeText(c) === '?'
    );

    // Get type annotation
    let type: string | undefined;
    const typeAnnotation = findDescendantsByType(fieldNode, 'type_annotation')[0];
    if (typeAnnotation) {
        const typeNode = typeAnnotation.children.find((c: any) => c.type !== ':');
        if (typeNode) {
            type = getNodeText(typeNode).trim();
        }
    }

    // Get decorators
    const decorators = findDecorators(fieldNode);
    const decoratorNames: string[] = [];

    for (const dec of decorators) {
        const decName = getDecoratorName(dec);
        if (decName && VALIDATION_DECORATORS.has(decName)) {
            decoratorNames.push(decName);
        }
    }

    return {
        name,
        type,
        isOptional,
        decorators: decoratorNames,
    };
}
