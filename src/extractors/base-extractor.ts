/**
 * Base Extractor
 * Common utilities shared across all extractors
 */

import {
    SyntaxNode,
    findDecorators,
    getDecoratorName,
    getDecoratorArguments,
    getClassName,
    findDescendantsByType,
} from '../parser/ts-parser';

/**
 * Check if a class has a specific decorator
 */
export function hasDecorator(classNode: SyntaxNode, decoratorName: string): boolean {
    const decorators = findDecorators(classNode);
    return decorators.some((d) => getDecoratorName(d) === decoratorName);
}

/**
 * Get a specific decorator from a class
 */
export function getDecorator(
    classNode: SyntaxNode,
    decoratorName: string
): SyntaxNode | null {
    const decorators = findDecorators(classNode);
    return decorators.find((d) => getDecoratorName(d) === decoratorName) || null;
}

/**
 * Extract string value from a decorator argument
 * e.g., @Controller('users') -> 'users'
 */
export function extractStringFromDecorator(decoratorNode: SyntaxNode): string | null {
    const args = getDecoratorArguments(decoratorNode);
    if (args.length > 0) {
        // Remove quotes from string literal
        const arg = args[0];
        if (
            (arg.startsWith("'") && arg.endsWith("'")) ||
            (arg.startsWith('"') && arg.endsWith('"'))
        ) {
            return arg.slice(1, -1);
        }
        return arg;
    }
    return null;
}

/**
 * Extract array of identifiers from a decorator argument
 * e.g., @Module({ controllers: [UsersController] }) -> ['UsersController']
 */
export function extractArrayFromObjectProperty(
    decoratorNode: SyntaxNode,
    propertyName: string
): string[] {
    const args = getDecoratorArguments(decoratorNode);
    if (args.length === 0) return [];

    // Find the object literal in arguments
    const objectNodes = findDescendantsByType(decoratorNode, 'object');
    if (objectNodes.length === 0) return [];

    const objectNode = objectNodes[0];
    const results: string[] = [];

    // Find property assignment matching propertyName
    for (const child of objectNode.children) {
        if (child.type === 'pair' || child.type === 'property_assignment') {
            const keyNode = child.children[0];
            if (keyNode && keyNode.text === propertyName) {
                // Find array in this pair
                const arrayNode = findDescendantsByType(child, 'array')[0];
                if (arrayNode) {
                    for (const elem of arrayNode.children) {
                        if (elem.type === 'identifier') {
                            results.push(elem.text);
                        }
                    }
                }
            }
        }
    }

    return results;
}

/**
 * Normalize a route path
 */
export function normalizePath(path: string | null): string {
    if (!path) return '/';
    // Remove leading/trailing slashes and add single leading slash
    const cleaned = path.replace(/^\/+|\/+$/g, '');
    return cleaned ? `/${cleaned}` : '/';
}

/**
 * Get the file name without extension
 */
export function getBaseName(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.ts$/, '');
}
