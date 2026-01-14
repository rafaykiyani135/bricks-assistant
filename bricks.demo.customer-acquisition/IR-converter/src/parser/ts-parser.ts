/**
 * Tree-sitter Parser Wrapper
 * Provides TypeScript AST parsing capabilities
 */

import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';

// Initialize parser with TypeScript grammar
const parser = new Parser();
parser.setLanguage(TypeScript.typescript);

export type SyntaxNode = Parser.SyntaxNode;
export type Tree = Parser.Tree;

/**
 * Parse TypeScript source code into an AST
 */
export function parseTypeScript(sourceCode: string): Tree {
    return parser.parse(sourceCode);
}

/**
 * Get the root node of a parsed tree
 */
export function getRootNode(tree: Tree): SyntaxNode {
    return tree.rootNode;
}

/**
 * Find all children of a node matching a specific type
 */
export function findChildrenByType(
    node: SyntaxNode,
    type: string
): SyntaxNode[] {
    const results: SyntaxNode[] = [];

    for (const child of node.children) {
        if (child.type === type) {
            results.push(child);
        }
    }

    return results;
}

/**
 * Recursively find all descendants matching a specific type
 */
export function findDescendantsByType(
    node: SyntaxNode,
    type: string
): SyntaxNode[] {
    const results: SyntaxNode[] = [];

    function traverse(n: SyntaxNode) {
        if (n.type === type) {
            results.push(n);
        }
        for (const child of n.children) {
            traverse(child);
        }
    }

    traverse(node);
    return results;
}

/**
 * Find first child matching a specific type
 */
export function findFirstChildByType(
    node: SyntaxNode,
    type: string
): SyntaxNode | null {
    for (const child of node.children) {
        if (child.type === type) {
            return child;
        }
    }
    return null;
}

/**
 * Find first descendant matching a specific type
 */
export function findFirstDescendantByType(
    node: SyntaxNode,
    type: string
): SyntaxNode | null {
    for (const child of node.children) {
        if (child.type === type) {
            return child;
        }
        const found = findFirstDescendantByType(child, type);
        if (found) {
            return found;
        }
    }
    return null;
}

/**
 * Get the text content of a node
 */
export function getNodeText(node: SyntaxNode): string {
    return node.text;
}

/**
 * Check if a node has a specific child type
 */
export function hasChildOfType(node: SyntaxNode, type: string): boolean {
    return node.children.some((child) => child.type === type);
}

/**
 * Find all class declarations in a tree
 */
export function findClassDeclarations(rootNode: SyntaxNode): SyntaxNode[] {
    return findDescendantsByType(rootNode, 'class_declaration');
}

/**
 * Find all decorators attached to a node
 * Decorators are typically in a 'decorator' node preceding the class/method
 */
export function findDecorators(node: SyntaxNode): SyntaxNode[] {
    // Check parent for export_statement that might contain decorators
    const parent = node.parent;
    const decorators: SyntaxNode[] = [];

    if (parent) {
        // Find all decorator nodes that are siblings before this node
        let sibling = node.previousSibling;
        while (sibling) {
            if (sibling.type === 'decorator') {
                decorators.unshift(sibling); // Add to front to maintain order
            }
            sibling = sibling.previousSibling;
        }

        // Also check parent's previous siblings if parent is export_statement
        if (parent.type === 'export_statement') {
            let parentSibling = parent.previousSibling;
            while (parentSibling) {
                if (parentSibling.type === 'decorator') {
                    decorators.unshift(parentSibling);
                }
                parentSibling = parentSibling.previousSibling;
            }
        }
    }

    return decorators;
}

/**
 * Extract decorator name from a decorator node
 * e.g., @Controller() -> 'Controller'
 */
export function getDecoratorName(decoratorNode: SyntaxNode): string | null {
    // Decorator structure: decorator -> call_expression -> identifier
    const callExpr = findFirstChildByType(decoratorNode, 'call_expression');
    if (callExpr) {
        const identifier = findFirstChildByType(callExpr, 'identifier');
        if (identifier) {
            return getNodeText(identifier);
        }
        // Could also be member_expression like @nestjs.Controller
        const memberExpr = findFirstChildByType(callExpr, 'member_expression');
        if (memberExpr) {
            const prop = findFirstChildByType(memberExpr, 'property_identifier');
            if (prop) {
                return getNodeText(prop);
            }
        }
    }

    // Could be decorator without parentheses: @Injectable
    const identifier = findFirstChildByType(decoratorNode, 'identifier');
    if (identifier) {
        return getNodeText(identifier);
    }

    return null;
}

/**
 * Extract arguments from a decorator
 * e.g., @Controller('users') -> ['users']
 */
export function getDecoratorArguments(decoratorNode: SyntaxNode): string[] {
    const args: string[] = [];
    const callExpr = findFirstChildByType(decoratorNode, 'call_expression');

    if (callExpr) {
        const argsNode = findFirstChildByType(callExpr, 'arguments');
        if (argsNode) {
            for (const child of argsNode.children) {
                // Skip parentheses and commas
                if (child.type !== '(' && child.type !== ')' && child.type !== ',') {
                    args.push(getNodeText(child));
                }
            }
        }
    }

    return args;
}

/**
 * Get the name of a class declaration
 */
export function getClassName(classNode: SyntaxNode): string | null {
    const nameNode = findFirstChildByType(classNode, 'type_identifier');
    return nameNode ? getNodeText(nameNode) : null;
}

/**
 * Find all method definitions in a class
 */
export function findMethods(classNode: SyntaxNode): SyntaxNode[] {
    const classBody = findFirstChildByType(classNode, 'class_body');
    if (!classBody) return [];

    return findChildrenByType(classBody, 'method_definition');
}

/**
 * Get method name from a method definition
 */
export function getMethodName(methodNode: SyntaxNode): string | null {
    const nameNode = findFirstChildByType(methodNode, 'property_identifier');
    return nameNode ? getNodeText(nameNode) : null;
}

/**
 * Check if a method is async
 */
export function isAsyncMethod(methodNode: SyntaxNode): boolean {
    return methodNode.children.some((child) => child.type === 'async');
}

/**
 * Get method parameters
 */
export function getMethodParameters(
    methodNode: SyntaxNode
): { name: string; type?: string }[] {
    const params: { name: string; type?: string }[] = [];
    const formalParams = findFirstChildByType(methodNode, 'formal_parameters');

    if (formalParams) {
        for (const child of formalParams.children) {
            if (
                child.type === 'required_parameter' ||
                child.type === 'optional_parameter'
            ) {
                const pattern = findFirstChildByType(child, 'identifier');
                const typeAnnotation = findFirstChildByType(child, 'type_annotation');

                if (pattern) {
                    const param: { name: string; type?: string } = {
                        name: getNodeText(pattern),
                    };

                    if (typeAnnotation) {
                        // Get the type, skipping the ':'
                        const typeNode = typeAnnotation.children.find(
                            (c) => c.type !== ':'
                        );
                        if (typeNode) {
                            param.type = getNodeText(typeNode);
                        }
                    }

                    params.push(param);
                }
            }
        }
    }

    return params;
}

/**
 * Find constructor in a class
 */
export function findConstructor(classNode: SyntaxNode): SyntaxNode | null {
    const classBody = findFirstChildByType(classNode, 'class_body');
    if (!classBody) return null;

    for (const child of classBody.children) {
        if (child.type === 'method_definition') {
            const nameNode = findFirstChildByType(child, 'property_identifier');
            if (nameNode && getNodeText(nameNode) === 'constructor') {
                return child;
            }
        }
    }

    return null;
}

/**
 * Extract constructor parameter names (typically injected services)
 */
export function getConstructorInjections(classNode: SyntaxNode): string[] {
    const constructor = findConstructor(classNode);
    if (!constructor) return [];

    const injections: string[] = [];
    const formalParams = findFirstChildByType(constructor, 'formal_parameters');

    if (formalParams) {
        for (const child of formalParams.children) {
            if (
                child.type === 'required_parameter' ||
                child.type === 'optional_parameter'
            ) {
                const typeAnnotation = findFirstChildByType(child, 'type_annotation');
                if (typeAnnotation) {
                    const typeNode = typeAnnotation.children.find((c) => c.type !== ':');
                    if (typeNode) {
                        injections.push(getNodeText(typeNode).trim());
                    }
                }
            }
        }
    }

    return injections;
}

/**
 * Find all call expressions within a node (method calls like this.service.method())
 */
export function findCallExpressions(node: SyntaxNode): SyntaxNode[] {
    return findDescendantsByType(node, 'call_expression');
}

/**
 * Extract the called method name from a call expression
 * e.g., this.authService.login() -> 'authService.login'
 */
export function getCalledMethodName(callExpr: SyntaxNode): string | null {
    const memberExpr = findFirstChildByType(callExpr, 'member_expression');
    if (!memberExpr) return null;

    // Try to build the full call path
    const parts: string[] = [];

    function extractParts(node: SyntaxNode) {
        if (node.type === 'member_expression') {
            const object = node.children[0];
            const property = findFirstChildByType(node, 'property_identifier');

            if (object) {
                extractParts(object);
            }
            if (property) {
                parts.push(getNodeText(property));
            }
        } else if (node.type === 'this') {
            // Skip 'this'
        } else if (
            node.type === 'identifier' ||
            node.type === 'property_identifier'
        ) {
            parts.push(getNodeText(node));
        }
    }

    extractParts(memberExpr);

    return parts.length > 0 ? parts.join('.') : null;
}
