/**
 * NestJS + Vue/Nuxt Code-to-IR Converter
 * Main entry point for Full-Stack IR generation
 *
 * Usage:
 *   npm run convert -- --backend ../server/src --frontend ../client/app
 *   npm run convert -- --backend ../server/src
 *   npm run convert -- --frontend ../client/app
 */

import * as path from 'path';
import { findTypeScriptFiles, findFrontendFiles, classifyFile, getFileName } from './reader/file-reader';
import { extractControllers } from './extractors/controller.extractor';
import { extractServices } from './extractors/service.extractor';
import { extractModules } from './extractors/module.extractor';
import { extractDtos } from './extractors/dto.extractor';
import { extractComponents } from './extractors/vue-component.extractor';
import { extractStores } from './extractors/pinia-store.extractor';
import { analyzeRelationships } from './analyzers/relationship-analyzer';
import {
    buildBackendIR,
    buildFrontendIR,
    buildIR,
    writeIR,
    generateStats,
} from './builders/ir-builder';
import {
    ControllerIR,
    ServiceIR,
    ModuleIR,
    DtoIR,
    BackendIR,
    FrontendIR,
    StoreIR,
    ComposableIR,
} from './types/ir.types';

interface CLIArgs {
    backend?: string;
    frontend?: string;
}

function parseArgs(args: string[]): CLIArgs {
    const result: CLIArgs = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--backend' && args[i + 1]) {
            result.backend = path.resolve(args[i + 1]);
            i++;
        } else if (args[i] === '--frontend' && args[i + 1]) {
            result.frontend = path.resolve(args[i + 1]);
            i++;
        }
    }

    // Backward compatibility: if no flags, treat first arg as backend
    if (!result.backend && !result.frontend && args.length > 0 && !args[0].startsWith('--')) {
        result.backend = path.resolve(args[0]);
    }

    return result;
}

function processBackend(directory: string): BackendIR | undefined {
    console.log(`\n📦 Processing Backend: ${directory}\n`);

    const files = findTypeScriptFiles(directory);
    console.log(`Found ${files.length} TypeScript files\n`);

    const allControllers: ControllerIR[] = [];
    const allServices: ServiceIR[] = [];
    const allModules: ModuleIR[] = [];
    const allDtos: DtoIR[] = [];

    for (const file of files) {
        const fileType = classifyFile(file.relativePath);

        try {
            switch (fileType) {
                case 'controller':
                case 'resolver': {
                    const result = extractControllers(file.content, file.relativePath);
                    allControllers.push(...result.items);
                    if (result.items.length > 0) {
                        console.log(`  📋 ${getFileName(file.relativePath)}: ${result.items.length} controller(s)`);
                    }
                    break;
                }

                case 'service': {
                    const result = extractServices(file.content, file.relativePath);
                    allServices.push(...result.items);
                    if (result.items.length > 0) {
                        console.log(`  ⚙️  ${getFileName(file.relativePath)}: ${result.items.length} service(s)`);
                    }
                    break;
                }

                case 'module': {
                    const result = extractModules(file.content, file.relativePath);
                    allModules.push(...result.items);
                    if (result.items.length > 0) {
                        console.log(`  📦 ${getFileName(file.relativePath)}: ${result.items.length} module(s)`);
                    }
                    break;
                }

                case 'dto': {
                    const result = extractDtos(file.content, file.relativePath);
                    allDtos.push(...result.items);
                    if (result.items.length > 0) {
                        console.log(`  📝 ${getFileName(file.relativePath)}: ${result.items.length} DTO(s)`);
                    }
                    break;
                }

                default: {
                    // For unknown files, try all extractors
                    const controllers = extractControllers(file.content, file.relativePath);
                    const services = extractServices(file.content, file.relativePath);
                    const modules = extractModules(file.content, file.relativePath);
                    const dtos = extractDtos(file.content, file.relativePath);

                    allControllers.push(...controllers.items);
                    allServices.push(...services.items);
                    allModules.push(...modules.items);
                    allDtos.push(...dtos.items);
                    break;
                }
            }
        } catch (error) {
            console.error(`  ❌ Error processing ${file.relativePath}:`, error);
        }
    }

    console.log('\n🔗 Analyzing backend relationships...');
    const relationships = analyzeRelationships(allControllers, allServices, allModules);

    return buildBackendIR(allControllers, allServices, allModules, allDtos, relationships);
}

function processFrontend(directory: string): FrontendIR | undefined {
    console.log(`\n🖼️  Processing Frontend: ${directory}\n`);

    const { vueFiles, storeFiles, composableFiles } = findFrontendFiles(directory);
    console.log(`Found ${vueFiles.length} Vue files, ${storeFiles.length} store files, ${composableFiles.length} composable files\n`);

    // Extract components from Vue files
    const { pages, components } = extractComponents(vueFiles);

    for (const page of pages) {
        console.log(`  📄 ${page.name}: page (${page.route})`);
    }
    for (const component of components) {
        console.log(`  🧩 ${component.name}: component`);
    }

    // Extract stores
    const allStores: StoreIR[] = [];
    for (const file of storeFiles) {
        try {
            const result = extractStores(file.content, file.relativePath);
            allStores.push(...result.items);
            if (result.items.length > 0) {
                console.log(`  🗄️  ${getFileName(file.relativePath)}: ${result.items.length} store(s)`);
            }
        } catch (error) {
            console.error(`  ❌ Error processing ${file.relativePath}:`, error);
        }
    }

    // Extract composables (simplified - just identify them)
    const allComposables: ComposableIR[] = [];
    for (const file of composableFiles) {
        const name = getFileName(file.relativePath).replace('.ts', '');
        allComposables.push({
            name,
            file: file.relativePath,
            returns: [],
            apiCalls: [],
        });
        console.log(`  🪝 ${name}: composable`);
    }

    console.log('\n🔗 Building frontend relationships...');

    return buildFrontendIR(pages, components, allStores, allComposables);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const outputDir = path.resolve(__dirname, '../output');

    if (!args.backend && !args.frontend) {
        console.error('Usage: npm run convert -- --backend <path> --frontend <path>');
        console.error('Example: npm run convert -- --backend ../server/src --frontend ../client/app');
        process.exit(1);
    }

    let backend: BackendIR | undefined;
    let frontend: FrontendIR | undefined;

    if (args.backend) {
        backend = processBackend(args.backend);
    }

    if (args.frontend) {
        frontend = processFrontend(args.frontend);
    }

    // Build and write separate IRs
    console.log('\n🏗️  Building IR files...');

    if (backend) {
        const backendIR = {
            metadata: {
                generatedAt: new Date().toISOString(),
                backendDirectory: args.backend,
                version: '2.0.0',
            },
            backend,
        };
        writeIR(backendIR as any, path.join(outputDir, 'backend-ir.json'));
    }

    if (frontend) {
        const frontendIR = {
            metadata: {
                generatedAt: new Date().toISOString(),
                frontendDirectory: args.frontend,
                version: '2.0.0',
            },
            frontend,
        };
        writeIR(frontendIR as any, path.join(outputDir, 'frontend-ir.json'));
    }

    // Print summary
    const combinedIR = buildIR(args.backend, args.frontend, backend, frontend);
    generateStats(combinedIR);

    console.log('✅ IR generation complete!\n');
}

// Run main
main();
