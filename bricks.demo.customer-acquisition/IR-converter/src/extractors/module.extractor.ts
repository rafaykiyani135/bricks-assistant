/**
 * Module Extractor
 * Extracts module definitions from @Module() decorators
 */

import { ModuleIR, ExtractionResult } from '../types/ir.types';
import {
    parseTypeScript,
    getRootNode,
    findClassDeclarations,
    getClassName,
    findDecorators,
    getDecoratorName,
    findDescendantsByType,
    getNodeText,
} from '../parser/ts-parser';
import { hasDecorator, getDecorator } from './base-extractor';

/**
 * Extract modules from a TypeScript file
 */
export function extractModules(
    content: string,
    filePath: string
): ExtractionResult<ModuleIR> {
    const tree = parseTypeScript(content);
    const rootNode = getRootNode(tree);
    const classNodes = findClassDeclarations(rootNode);
    const modules: ModuleIR[] = [];

    for (const classNode of classNodes) {
        const className = getClassName(classNode);
        if (!className) continue;

        // Check for @Module decorator
        if (!hasDecorator(classNode, 'Module')) continue;

        const moduleDecorator = getDecorator(classNode, 'Module');
        if (!moduleDecorator) continue;

        // Extract module metadata from decorator arguments
        const controllers = extractModuleProperty(moduleDecorator, 'controllers');
        const providers = extractModuleProperty(moduleDecorator, 'providers');
        const imports = extractModuleProperty(moduleDecorator, 'imports');
        const exports = extractModuleProperty(moduleDecorator, 'exports');

        modules.push({
            name: className,
            file: filePath,
            controllers,
            providers,
            imports,
            exports,
        });
    }

    return { items: modules, filePath };
}

/**
 * Extract a property array from @Module decorator
 * e.g., @Module({ controllers: [UsersController, AuthController] })
 */
function extractModuleProperty(
    decoratorNode: any,
    propertyName: string
): string[] {
    const results: string[] = [];

    // Find the object literal in the decorator
    const objectNodes = findDescendantsByType(decoratorNode, 'object');
    if (objectNodes.length === 0) return results;

    const objectNode = objectNodes[0];

    // Find property assignments
    for (const child of objectNode.children) {
        // Handle property assignment (pair in tree-sitter)
        if (child.type === 'pair') {
            const keyNode = child.children[0];
            if (!keyNode) continue;

            const keyText = getNodeText(keyNode).replace(/['"]/g, '');
            if (keyText !== propertyName) continue;

            // Find array value
            const arrayNode = findDescendantsByType(child, 'array')[0];
            if (arrayNode) {
                for (const elem of arrayNode.children) {
                    if (elem.type === 'identifier') {
                        results.push(getNodeText(elem));
                    } else if (elem.type === 'call_expression') {
                        // Handle forRoot(), forFeature(), etc.
                        const callText = getNodeText(elem);
                        // Extract the module name (e.g., TypeOrmModule from TypeOrmModule.forRoot())
                        const match = callText.match(/^(\w+)\./);
                        if (match) {
                            results.push(match[1]);
                        }
                    }
                }
            }
        }

        // Handle shorthand property (e.g., { controllers } without value)
        if (child.type === 'shorthand_property_identifier') {
            const text = getNodeText(child);
            if (text === propertyName) {
                // The value is the same as the key - this is unusual but possible
                results.push(text);
            }
        }
    }

    return results;
}
