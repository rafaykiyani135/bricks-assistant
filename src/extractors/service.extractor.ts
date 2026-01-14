/**
 * Service Extractor
 * Extracts service definitions from @Injectable() classes
 */

import { ServiceIR, MethodIR, MethodParamIR, ExtractionResult } from '../types/ir.types';
import {
    parseTypeScript,
    getRootNode,
    findClassDeclarations,
    getClassName,
    findMethods,
    getMethodName,
    getMethodParameters,
    isAsyncMethod,
    findCallExpressions,
    getCalledMethodName,
    getConstructorInjections,
    findDescendantsByType,
    getNodeText,
} from '../parser/ts-parser';
import { hasDecorator } from './base-extractor';

/**
 * Extract services from a TypeScript file
 */
export function extractServices(
    content: string,
    filePath: string
): ExtractionResult<ServiceIR> {
    const tree = parseTypeScript(content);
    const rootNode = getRootNode(tree);
    const classNodes = findClassDeclarations(rootNode);
    const services: ServiceIR[] = [];

    for (const classNode of classNodes) {
        const className = getClassName(classNode);
        if (!className) continue;

        // Check for @Injectable decorator
        if (!hasDecorator(classNode, 'Injectable')) continue;

        // Extract constructor injections
        const injectedDependencies = getConstructorInjections(classNode);

        // Extract methods
        const methods = extractServiceMethods(classNode);

        services.push({
            name: className,
            file: filePath,
            methods,
            injectedDependencies,
        });
    }

    return { items: services, filePath };
}

/**
 * Extract methods from a service class
 */
function extractServiceMethods(classNode: any): MethodIR[] {
    const methods: MethodIR[] = [];
    const methodNodes = findMethods(classNode);

    for (const methodNode of methodNodes) {
        const methodName = getMethodName(methodNode);
        if (!methodName || methodName === 'constructor') continue;

        // Check if method is public (no 'private' or 'protected' keyword)
        const isPrivate = methodNode.children.some(
            (c: any) => c.type === 'private' || c.text === 'private'
        );
        const isProtected = methodNode.children.some(
            (c: any) => c.type === 'protected' || c.text === 'protected'
        );

        // Skip private/protected methods
        if (isPrivate || isProtected) continue;

        // Extract parameters
        const rawParams = getMethodParameters(methodNode);
        const params: MethodParamIR[] = rawParams.map((p) => ({
            name: p.name,
            type: p.type,
        }));

        // Check if async
        const isAsync = isAsyncMethod(methodNode);

        // Extract method calls
        const calls = extractMethodCalls(methodNode);

        // Extract return type
        const returnType = extractReturnType(methodNode);

        methods.push({
            name: methodName,
            params,
            calls,
            returnType,
            isAsync,
        });
    }

    return methods;
}

/**
 * Extract method calls from a method body
 */
function extractMethodCalls(methodNode: any): string[] {
    const calls: string[] = [];
    const callExpressions = findCallExpressions(methodNode);

    for (const callExpr of callExpressions) {
        const calledMethod = getCalledMethodName(callExpr);
        if (calledMethod) {
            // Filter out common utility calls
            if (
                !calledMethod.startsWith('console.') &&
                !calledMethod.startsWith('Math.') &&
                !calledMethod.startsWith('JSON.') &&
                !calledMethod.startsWith('Object.') &&
                !calledMethod.startsWith('Array.') &&
                !calledMethod.startsWith('Promise.')
            ) {
                calls.push(calledMethod);
            }
        }
    }

    // Deduplicate
    return [...new Set(calls)];
}

/**
 * Extract return type from method
 */
function extractReturnType(methodNode: any): string | undefined {
    // Look for type annotation after parameters
    for (const child of methodNode.children) {
        if (child.type === 'type_annotation') {
            const typeNode = child.children.find((c: any) => c.type !== ':');
            if (typeNode) {
                return getNodeText(typeNode).trim();
            }
        }
    }
    return undefined;
}
