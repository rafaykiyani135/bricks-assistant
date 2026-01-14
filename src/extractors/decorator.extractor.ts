/**
 * Decorator Extractor
 * Extracts Guards, Pipes, and Interceptors definitions
 */

import { ExtractionResult } from '../types/ir.types';
import {
    parseTypeScript,
    getRootNode,
    findClassDeclarations,
    getClassName,
} from '../parser/ts-parser';
import { hasDecorator } from './base-extractor';

export interface GuardIR {
    name: string;
    file: string;
}

export interface PipeIR {
    name: string;
    file: string;
}

export interface InterceptorIR {
    name: string;
    file: string;
}

/**
 * Extract Guards from a TypeScript file
 */
export function extractGuards(
    content: string,
    filePath: string
): ExtractionResult<GuardIR> {
    const tree = parseTypeScript(content);
    const rootNode = getRootNode(tree);
    const classNodes = findClassDeclarations(rootNode);
    const guards: GuardIR[] = [];

    for (const classNode of classNodes) {
        const className = getClassName(classNode);
        if (!className) continue;

        // Check for guard-like classes (implements CanActivate or has Guard in name)
        const isGuard =
            className.includes('Guard') ||
            hasDecorator(classNode, 'Injectable') && filePath.includes('.guard.');

        if (isGuard) {
            guards.push({
                name: className,
                file: filePath,
            });
        }
    }

    return { items: guards, filePath };
}

/**
 * Extract Pipes from a TypeScript file
 */
export function extractPipes(
    content: string,
    filePath: string
): ExtractionResult<PipeIR> {
    const tree = parseTypeScript(content);
    const rootNode = getRootNode(tree);
    const classNodes = findClassDeclarations(rootNode);
    const pipes: PipeIR[] = [];

    for (const classNode of classNodes) {
        const className = getClassName(classNode);
        if (!className) continue;

        // Check for pipe-like classes
        const isPipe =
            className.includes('Pipe') ||
            hasDecorator(classNode, 'Injectable') && filePath.includes('.pipe.');

        if (isPipe) {
            pipes.push({
                name: className,
                file: filePath,
            });
        }
    }

    return { items: pipes, filePath };
}

/**
 * Extract Interceptors from a TypeScript file
 */
export function extractInterceptors(
    content: string,
    filePath: string
): ExtractionResult<InterceptorIR> {
    const tree = parseTypeScript(content);
    const rootNode = getRootNode(tree);
    const classNodes = findClassDeclarations(rootNode);
    const interceptors: InterceptorIR[] = [];

    for (const classNode of classNodes) {
        const className = getClassName(classNode);
        if (!className) continue;

        // Check for interceptor-like classes
        const isInterceptor =
            className.includes('Interceptor') ||
            hasDecorator(classNode, 'Injectable') && filePath.includes('.interceptor.');

        if (isInterceptor) {
            interceptors.push({
                name: className,
                file: filePath,
            });
        }
    }

    return { items: interceptors, filePath };
}
