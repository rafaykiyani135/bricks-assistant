/**
 * IR Builder
 * Consolidates all extracted data into the final IR structure
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    IR,
    BackendIR,
    FrontendIR,
    ControllerIR,
    ServiceIR,
    ModuleIR,
    DtoIR,
    RelationshipsIR,
    ComponentIR,
    StoreIR,
    ComposableIR,
    FrontendRelationshipsIR,
    FullStackLinkIR,
} from '../types/ir.types';

const IR_VERSION = '2.0.0';

/**
 * Build backend IR from extracted data
 */
export function buildBackendIR(
    controllers: ControllerIR[],
    services: ServiceIR[],
    modules: ModuleIR[],
    dtos: DtoIR[],
    relationships: RelationshipsIR
): BackendIR {
    return {
        modules,
        controllers,
        services,
        dtos,
        relationships,
    };
}

/**
 * Build frontend IR from extracted data
 */
export function buildFrontendIR(
    pages: ComponentIR[],
    components: ComponentIR[],
    stores: StoreIR[],
    composables: ComposableIR[]
): FrontendIR {
    // Build frontend relationships
    const relationships = buildFrontendRelationships(pages, components, stores);

    return {
        pages,
        components,
        stores,
        composables,
        relationships,
    };
}

/**
 * Build frontend relationships
 */
function buildFrontendRelationships(
    pages: ComponentIR[],
    components: ComponentIR[],
    stores: StoreIR[]
): FrontendRelationshipsIR {
    const pageToComponent: { page: string; components: string[] }[] = [];
    const componentToStore: { component: string; stores: string[] }[] = [];
    const componentToApi: { component: string; operations: string[] }[] = [];

    const storeNames = new Set(stores.map((s) => s.exportName));

    // Analyze pages
    for (const page of pages) {
        if (page.componentsUsed.length > 0) {
            pageToComponent.push({
                page: page.name,
                components: page.componentsUsed,
            });
        }

        // Check for store usage
        const usedStores = page.composablesUsed.filter((c) => storeNames.has(c));
        if (usedStores.length > 0) {
            componentToStore.push({
                component: page.name,
                stores: usedStores,
            });
        }

        // Check for API usage
        if (page.apiCalls.length > 0) {
            componentToApi.push({
                component: page.name,
                operations: page.apiCalls.map((a) => a.operationName),
            });
        }
    }

    // Analyze components
    for (const component of components) {
        const usedStores = component.composablesUsed.filter((c) =>
            storeNames.has(c)
        );
        if (usedStores.length > 0) {
            componentToStore.push({
                component: component.name,
                stores: usedStores,
            });
        }

        if (component.apiCalls.length > 0) {
            componentToApi.push({
                component: component.name,
                operations: component.apiCalls.map((a) => a.operationName),
            });
        }
    }

    return { pageToComponent, componentToStore, componentToApi };
}

/**
 * Build full-stack links between frontend and backend
 */
export function buildFullStackLinks(
    frontend: FrontendIR | undefined,
    backend: BackendIR | undefined
): FullStackLinkIR[] {
    const links: FullStackLinkIR[] = [];

    if (!frontend || !backend) return links;

    // Build a map of backend operations
    const backendOps = new Map<string, string>();
    for (const controller of backend.controllers) {
        for (const route of controller.routes) {
            // Use handler name as operation identifier
            const operationKey = route.handler;
            const operationKeyAlt = route.path.replace(/^\//, '');
            backendOps.set(operationKey.toLowerCase(), `${controller.name}.${route.handler}`);
            backendOps.set(operationKeyAlt.toLowerCase(), `${controller.name}.${route.handler}`);
        }
    }

    // Match frontend API calls to backend handlers
    const allComponents = [...frontend.pages, ...frontend.components];
    for (const component of allComponents) {
        for (const apiCall of component.apiCalls) {
            const opName = apiCall.operationName.toLowerCase();
            const backendHandler = backendOps.get(opName);

            if (backendHandler) {
                links.push({
                    frontendComponent: component.name,
                    apiOperation: apiCall.operationName,
                    backendHandler,
                });
            }
        }
    }

    return links;
}

/**
 * Build the complete IR from extracted data
 */
export function buildIR(
    backendDirectory: string | undefined,
    frontendDirectory: string | undefined,
    backend: BackendIR | undefined,
    frontend: FrontendIR | undefined
): IR {
    const fullStackLinks = buildFullStackLinks(frontend, backend);

    return {
        metadata: {
            generatedAt: new Date().toISOString(),
            backendDirectory: backendDirectory ? path.resolve(backendDirectory) : undefined,
            frontendDirectory: frontendDirectory ? path.resolve(frontendDirectory) : undefined,
            version: IR_VERSION,
        },
        backend,
        frontend,
        fullStackLinks,
    };
}

/**
 * Write IR to a JSON file
 */
export function writeIR(ir: IR, outputPath: string): void {
    const outputDir = path.dirname(outputPath);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON with pretty formatting
    fs.writeFileSync(outputPath, JSON.stringify(ir, null, 2), 'utf-8');

    console.log(`IR written to: ${outputPath}`);
}

/**
 * Generate summary statistics
 */
export function generateStats(ir: IR): void {
    console.log('\n=== IR Generation Summary ===');

    if (ir.backend) {
        console.log('\n📦 Backend:');
        console.log(`  Modules:      ${ir.backend.modules.length}`);
        console.log(`  Controllers:  ${ir.backend.controllers.length}`);
        console.log(`  Services:     ${ir.backend.services.length}`);
        console.log(`  DTOs:         ${ir.backend.dtos.length}`);
        console.log(`  Relationships:`);
        console.log(`    Controller → Service: ${ir.backend.relationships.controllerToService.length}`);
        console.log(`    Service → Service:    ${ir.backend.relationships.serviceToService.length}`);
    }

    if (ir.frontend) {
        console.log('\n🖼️  Frontend:');
        console.log(`  Pages:        ${ir.frontend.pages.length}`);
        console.log(`  Components:   ${ir.frontend.components.length}`);
        console.log(`  Stores:       ${ir.frontend.stores.length}`);
        console.log(`  Composables:  ${ir.frontend.composables.length}`);
        console.log(`  Relationships:`);
        console.log(`    Page → Component: ${ir.frontend.relationships.pageToComponent.length}`);
        console.log(`    Component → Store: ${ir.frontend.relationships.componentToStore.length}`);
        console.log(`    Component → API:   ${ir.frontend.relationships.componentToApi.length}`);
    }

    if (ir.fullStackLinks.length > 0) {
        console.log(`\n🔗 Full-Stack Links: ${ir.fullStackLinks.length}`);
    }

    console.log('\n=============================\n');
}
