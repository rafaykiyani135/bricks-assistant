/**
 * Controller & Resolver Extractor
 * Extracts route handlers from @Controller() and @Resolver() classes
 */

import {
    ControllerIR,
    RouteIR,
    RouteParamIR,
    ExtractionResult,
} from '../types/ir.types';
import {
    SyntaxNode,
    parseTypeScript,
    getRootNode,
    findClassDeclarations,
    findDecorators,
    getDecoratorName,
    getDecoratorArguments,
    getClassName,
    findMethods,
    getMethodName,
    getMethodParameters,
    findCallExpressions,
    getCalledMethodName,
    getConstructorInjections,
    findDescendantsByType,
    getNodeText,
} from '../parser/ts-parser';
import {
    hasDecorator,
    getDecorator,
    extractStringFromDecorator,
    normalizePath,
} from './base-extractor';

const HTTP_METHOD_DECORATORS = new Set([
    'Get',
    'Post',
    'Put',
    'Delete',
    'Patch',
    'Options',
    'Head',
    'All',
]);

const GRAPHQL_DECORATORS = new Set(['Query', 'Mutation', 'Subscription', 'ResolveField']);

const PARAM_DECORATORS = new Set([
    'Body',
    'Param',
    'Query',
    'Headers',
    'Req',
    'Res',
    'Session',
    'UploadedFile',
    'UploadedFiles',
    'Args', // GraphQL
    'Parent', // GraphQL
    'Context', // GraphQL
]);

const GUARD_DECORATORS = new Set(['UseGuards']);
const PIPE_DECORATORS = new Set(['UsePipes']);
const INTERCEPTOR_DECORATORS = new Set(['UseInterceptors']);

/**
 * Extract controllers/resolvers from a TypeScript file
 */
export function extractControllers(
    content: string,
    filePath: string
): ExtractionResult<ControllerIR> {
    const tree = parseTypeScript(content);
    const rootNode = getRootNode(tree);
    const classNodes = findClassDeclarations(rootNode);
    const controllers: ControllerIR[] = [];

    for (const classNode of classNodes) {
        const className = getClassName(classNode);
        if (!className) continue;

        // Check for @Controller or @Resolver decorator
        const isController = hasDecorator(classNode, 'Controller');
        const isResolver = hasDecorator(classNode, 'Resolver');

        if (!isController && !isResolver) continue;

        // Extract base route (for controllers)
        let baseRoute: string | null = null;
        if (isController) {
            const controllerDecorator = getDecorator(classNode, 'Controller');
            if (controllerDecorator) {
                baseRoute = extractStringFromDecorator(controllerDecorator);
            }
        }

        // Extract injected services from constructor
        const injectedServices = getConstructorInjections(classNode);

        // Extract route handlers
        const routes = extractRoutes(classNode, isResolver);

        controllers.push({
            name: className,
            file: filePath,
            baseRoute: baseRoute ? normalizePath(baseRoute) : null,
            routes,
            injectedServices,
        });
    }

    return { items: controllers, filePath };
}

/**
 * Extract routes from a controller/resolver class
 */
function extractRoutes(classNode: SyntaxNode, isResolver: boolean): RouteIR[] {
    const routes: RouteIR[] = [];
    const methods = findMethods(classNode);

    for (const methodNode of methods) {
        const methodName = getMethodName(methodNode);
        if (!methodName || methodName === 'constructor') continue;

        // Get decorators for this method
        const decorators = findDecorators(methodNode);

        // Find HTTP method or GraphQL operation decorator
        let httpMethod: string | null = null;
        let routePath: string | null = null;

        for (const decorator of decorators) {
            const decoratorName = getDecoratorName(decorator);
            if (!decoratorName) continue;

            if (HTTP_METHOD_DECORATORS.has(decoratorName)) {
                httpMethod = decoratorName.toUpperCase();
                routePath = extractStringFromDecorator(decorator);
                break;
            }

            if (GRAPHQL_DECORATORS.has(decoratorName)) {
                httpMethod = decoratorName; // Query, Mutation, etc.
                // For GraphQL, the operation name might be in the decorator args
                const args = getDecoratorArguments(decorator);
                if (args.length > 0) {
                    // Could be @Query(() => Customer, { name: 'customer' })
                    // Try to extract 'name' property
                    const nameMatch = args.join(' ').match(/name:\s*['"]([^'"]+)['"]/);
                    if (nameMatch) {
                        routePath = nameMatch[1];
                    }
                }
                if (!routePath) {
                    routePath = methodName; // Default to method name
                }
                break;
            }
        }

        // Skip methods without route decorators
        if (!httpMethod) continue;

        // Extract parameter decorators
        const params = extractRouteParams(methodNode);

        // Extract guards, pipes, interceptors
        const guards = extractDecoratorValues(decorators, GUARD_DECORATORS);
        const pipes = extractDecoratorValues(decorators, PIPE_DECORATORS);
        const interceptors = extractDecoratorValues(decorators, INTERCEPTOR_DECORATORS);

        // Extract method calls within the handler
        const calls = extractMethodCalls(methodNode);

        // Extract return type
        const returnType = extractReturnType(methodNode);

        routes.push({
            method: httpMethod,
            path: routePath || '/',
            handler: methodName,
            params,
            guards,
            pipes,
            interceptors,
            calls,
            returnType,
        });
    }

    return routes;
}

/**
 * Extract route parameters from method parameters
 */
function extractRouteParams(methodNode: SyntaxNode): RouteParamIR[] {
    const params: RouteParamIR[] = [];
    const formalParams = findDescendantsByType(methodNode, 'formal_parameters')[0];

    if (!formalParams) return params;

    for (const child of formalParams.children) {
        if (
            child.type !== 'required_parameter' &&
            child.type !== 'optional_parameter'
        ) {
            continue;
        }

        // Check for parameter decorators
        const decorators = findDecorators(child);
        let paramType: RouteParamIR['type'] = 'unknown';
        let decoratorName: string | undefined;
        let paramTypeName: string | undefined;

        for (const decorator of decorators) {
            const name = getDecoratorName(decorator);
            if (name && PARAM_DECORATORS.has(name)) {
                decoratorName = `@${name}`;
                switch (name) {
                    case 'Body':
                        paramType = 'body';
                        break;
                    case 'Param':
                        paramType = 'param';
                        break;
                    case 'Query':
                        paramType = 'query';
                        break;
                    case 'Headers':
                        paramType = 'headers';
                        break;
                    case 'Args':
                        paramType = 'body'; // GraphQL args are similar to body
                        break;
                    default:
                        paramType = 'unknown';
                }
                break;
            }
        }

        // Get parameter name
        const identifierNode = findDescendantsByType(child, 'identifier')[0];
        const paramName = identifierNode ? getNodeText(identifierNode) : 'unknown';

        // Get type annotation
        const typeAnnotation = findDescendantsByType(child, 'type_annotation')[0];
        if (typeAnnotation) {
            const typeNode = typeAnnotation.children.find((c) => c.type !== ':');
            if (typeNode) {
                paramTypeName = getNodeText(typeNode).trim();
            }
        }

        // Only add parameters with decorators we care about
        if (decoratorName) {
            params.push({
                name: paramName,
                type: paramType,
                paramType: paramTypeName,
                decorator: decoratorName,
            });
        }
    }

    return params;
}

/**
 * Extract values from guard/pipe/interceptor decorators
 */
function extractDecoratorValues(
    decorators: SyntaxNode[],
    targetDecorators: Set<string>
): string[] {
    const values: string[] = [];

    for (const decorator of decorators) {
        const name = getDecoratorName(decorator);
        if (name && targetDecorators.has(name)) {
            const args = getDecoratorArguments(decorator);
            values.push(...args.map((a) => a.replace(/['"]/g, '')));
        }
    }

    return values;
}

/**
 * Extract method calls from a method body
 */
function extractMethodCalls(methodNode: SyntaxNode): string[] {
    const calls: string[] = [];
    const callExpressions = findCallExpressions(methodNode);

    for (const callExpr of callExpressions) {
        const calledMethod = getCalledMethodName(callExpr);
        if (calledMethod) {
            // Filter out common non-service calls
            if (
                !calledMethod.startsWith('console.') &&
                !calledMethod.startsWith('Math.') &&
                !calledMethod.startsWith('JSON.') &&
                !calledMethod.startsWith('Object.') &&
                !calledMethod.startsWith('Array.')
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
function extractReturnType(methodNode: SyntaxNode): string | undefined {
    const typeAnnotation = findDescendantsByType(methodNode, 'type_annotation')[0];
    if (typeAnnotation) {
        const typeNode = typeAnnotation.children.find((c) => c.type !== ':');
        if (typeNode) {
            return getNodeText(typeNode).trim();
        }
    }
    return undefined;
}
