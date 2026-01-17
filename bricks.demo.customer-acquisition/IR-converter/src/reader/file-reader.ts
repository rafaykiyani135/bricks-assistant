/**
 * File Reader Module
 * Recursively scans directories for TypeScript and Vue files
 */

import * as fs from 'fs';
import * as path from 'path';
import { ParsedFile } from '../types/ir.types';

const IGNORED_DIRS = new Set([
    'node_modules',
    'dist',
    '.git',
    'test',
    '__tests__',
    'coverage',
    '.next',
    '.nuxt',
    '.output',
    '__generated__', // Skip generated GraphQL types
]);

const IGNORED_FILE_PATTERNS = [
    /\.spec\.ts$/,
    /\.test\.ts$/,
    /\.e2e-spec\.ts$/,
    /\.d\.ts$/,
];

/**
 * Recursively finds all TypeScript files in a directory
 */
export function findTypeScriptFiles(
    directory: string,
    baseDir?: string
): ParsedFile[] {
    const results: ParsedFile[] = [];
    const root = baseDir ?? directory;

    if (!fs.existsSync(directory)) {
        console.error(`Directory does not exist: ${directory}`);
        return results;
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            // Skip ignored directories
            if (IGNORED_DIRS.has(entry.name)) {
                continue;
            }
            // Recurse into subdirectory
            results.push(...findTypeScriptFiles(fullPath, root));
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            // Check if file matches any ignored patterns
            const shouldIgnore = IGNORED_FILE_PATTERNS.some((pattern) =>
                pattern.test(entry.name)
            );

            if (!shouldIgnore) {
                const relativePath = path.relative(root, fullPath);
                const content = fs.readFileSync(fullPath, 'utf-8');

                results.push({
                    filePath: fullPath,
                    relativePath: relativePath.replace(/\\/g, '/'), // Normalize to forward slashes
                    content,
                });
            }
        }
    }

    return results;
}

/**
 * Recursively finds all Vue files in a directory
 */
export function findVueFiles(
    directory: string,
    baseDir?: string
): ParsedFile[] {
    const results: ParsedFile[] = [];
    const root = baseDir ?? directory;

    if (!fs.existsSync(directory)) {
        console.error(`Directory does not exist: ${directory}`);
        return results;
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            // Skip ignored directories
            if (IGNORED_DIRS.has(entry.name)) {
                continue;
            }
            // Recurse into subdirectory
            results.push(...findVueFiles(fullPath, root));
        } else if (entry.isFile() && entry.name.endsWith('.vue')) {
            const relativePath = path.relative(root, fullPath);
            const content = fs.readFileSync(fullPath, 'utf-8');

            results.push({
                filePath: fullPath,
                relativePath: relativePath.replace(/\\/g, '/'),
                content,
            });
        }
    }

    return results;
}

/**
 * Find all frontend files (Vue + TypeScript in stores/composables)
 */
export function findFrontendFiles(directory: string): {
    vueFiles: ParsedFile[];
    storeFiles: ParsedFile[];
    composableFiles: ParsedFile[];
} {
    const vueFiles = findVueFiles(directory);
    const tsFiles = findTypeScriptFiles(directory);

    const storeFiles: ParsedFile[] = [];
    const composableFiles: ParsedFile[] = [];

    for (const f of tsFiles) {
        const path = f.relativePath.replace(/\\/g, '/');
        const content = f.content;
        
        // Debug logging
        // console.log(`Checking TS file: ${path}`);
        
        // 1. Check for Stores (Pinia/Vuex)
        // Heuristic: defines a store or resides in a 'stores' directory
        if (
            path.includes('/stores/') || 
            path.startsWith('stores/') || 
            content.includes('defineStore') || 
            content.includes('createStore')
        ) {
            storeFiles.push(f);
            continue;
        }

        // 2. Check for Composables / Logic
        // Heuristic: resides in 'composables', starts with 'use', or exports functions
        // We want to be generous here to capture utils and api clients too
        if (
            path.includes('/composables/') || 
            path.startsWith('composables/') ||
            path.includes('/utils/') ||
            path.includes('/api/') ||
            path.includes('/middleware/') || 
            path.startsWith('middleware/') ||
            path.includes('/plugins/') || 
            path.startsWith('plugins/') ||
            getFileName(path).startsWith('use') ||
            (content.includes('export function') || content.includes('export const') || content.includes('export default'))
        ) {
            composableFiles.push(f);
            continue;
        }
    }

    return { vueFiles, storeFiles, composableFiles };
}

/**
 * Gets just the filename from a path
 */
export function getFileName(filePath: string): string {
    return path.basename(filePath);
}

/**
 * Determines the type of NestJS file based on naming convention
 */
export function classifyFile(
    filePath: string
): 'controller' | 'service' | 'module' | 'dto' | 'resolver' | 'guard' | 'pipe' | 'interceptor' | 'model' | 'loader' | 'unknown' {
    const fileName = path.basename(filePath).toLowerCase();

    if (fileName.includes('.controller.')) return 'controller';
    if (fileName.includes('.resolver.')) return 'resolver';
    if (fileName.includes('.service.')) return 'service';
    if (fileName.includes('.module.')) return 'module';
    if (fileName.includes('.dto.') || fileName.includes('.input.')) return 'dto';
    if (fileName.includes('.guard.')) return 'guard';
    if (fileName.includes('.pipe.')) return 'pipe';
    if (fileName.includes('.interceptor.')) return 'interceptor';
    if (fileName.includes('.model.') || fileName.includes('.entity.')) return 'model';
    if (fileName.includes('.loader.')) return 'loader';

    return 'unknown';
}

/**
 * Classify frontend file type
 */
export function classifyFrontendFile(
    filePath: string
): 'page' | 'component' | 'store' | 'composable' | 'layout' | 'plugin' | 'middleware' | 'unknown' {
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    const fileName = getFileName(filePath).toLowerCase();

    // Specific folder checks (Strong signals)
    if (normalizedPath.includes('/pages/') || normalizedPath.includes('/views/')) return 'page';
    if (normalizedPath.includes('/layouts/')) return 'layout';
    if (normalizedPath.includes('/plugins/')) return 'plugin';
    if (normalizedPath.includes('/middleware/')) return 'middleware';
    
    // Stores
    if (normalizedPath.includes('/stores/') || fileName.includes('.store.')) return 'store';

    // Composables
    if (normalizedPath.includes('/composables/') || fileName.startsWith('use')) return 'composable';

    // Fallbacks based on extension
    if (fileName.endsWith('.vue')) {
        // If it's a Vue file and not a page/layout, it's a component
        return 'component';
    }

    if (fileName.endsWith('.ts')) {
         // Default generic TS files in frontend to composable (logic containers)
         return 'composable';
    }

    return 'unknown';
}
