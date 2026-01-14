/**
 * Relationship Analyzer
 * Builds dependency graphs between controllers, services, and modules
 */

import {
    ControllerIR,
    ServiceIR,
    ModuleIR,
    RelationshipsIR,
    ControllerServiceRelation,
    ServiceServiceRelation,
    ModuleBindingRelation,
} from '../types/ir.types';

/**
 * Analyze relationships between all extracted entities
 */
export function analyzeRelationships(
    controllers: ControllerIR[],
    services: ServiceIR[],
    modules: ModuleIR[]
): RelationshipsIR {
    return {
        controllerToService: analyzeControllerToService(controllers, services),
        serviceToService: analyzeServiceToService(services),
        moduleBindings: analyzeModuleBindings(modules),
    };
}

/**
 * Analyze controller to service dependencies
 */
function analyzeControllerToService(
    controllers: ControllerIR[],
    services: ServiceIR[]
): ControllerServiceRelation[] {
    const relations: ControllerServiceRelation[] = [];
    const serviceNames = new Set(services.map((s) => s.name));

    for (const controller of controllers) {
        // Check constructor injections
        for (const injected of controller.injectedServices) {
            // Clean up type (e.g., "private readonly authService: AuthService" -> "AuthService")
            const serviceName = extractTypeName(injected);
            if (serviceNames.has(serviceName)) {
                relations.push({
                    controller: controller.name,
                    service: serviceName,
                });
            }
        }

        // Also analyze route calls for additional relationships
        for (const route of controller.routes) {
            for (const call of route.calls) {
                // Extract service name from call (e.g., "authService.login" -> "AuthService")
                const parts = call.split('.');
                if (parts.length >= 2) {
                    const possibleService = capitalizeFirst(parts[0]);
                    if (serviceNames.has(possibleService)) {
                        const existing = relations.find(
                            (r) =>
                                r.controller === controller.name && r.service === possibleService
                        );
                        if (!existing) {
                            relations.push({
                                controller: controller.name,
                                service: possibleService,
                            });
                        }
                    }
                }
            }
        }
    }

    return relations;
}

/**
 * Analyze service to service dependencies
 */
function analyzeServiceToService(services: ServiceIR[]): ServiceServiceRelation[] {
    const relations: ServiceServiceRelation[] = [];
    const serviceNames = new Set(services.map((s) => s.name));

    for (const service of services) {
        // Check constructor injections
        for (const injected of service.injectedDependencies) {
            const depName = extractTypeName(injected);
            if (serviceNames.has(depName) && depName !== service.name) {
                relations.push({
                    fromService: service.name,
                    toService: depName,
                });
            }
        }

        // Analyze method calls
        for (const method of service.methods) {
            for (const call of method.calls) {
                const parts = call.split('.');
                if (parts.length >= 2) {
                    const possibleService = capitalizeFirst(parts[0]);
                    if (serviceNames.has(possibleService) && possibleService !== service.name) {
                        const existing = relations.find(
                            (r) =>
                                r.fromService === service.name && r.toService === possibleService
                        );
                        if (!existing) {
                            relations.push({
                                fromService: service.name,
                                toService: possibleService,
                                method: parts[1],
                            });
                        }
                    }
                }
            }
        }
    }

    return relations;
}

/**
 * Analyze module bindings
 */
function analyzeModuleBindings(modules: ModuleIR[]): ModuleBindingRelation[] {
    return modules.map((module) => ({
        module: module.name,
        controllers: module.controllers,
        providers: module.providers,
    }));
}

/**
 * Extract type name from a type annotation string
 * e.g., "Repository<Customer>" -> "Repository"
 */
function extractTypeName(typeString: string): string {
    // Remove generics
    const withoutGenerics = typeString.replace(/<[^>]+>/g, '');
    // Get the last part (in case of namespaced types)
    const parts = withoutGenerics.split('.');
    return parts[parts.length - 1].trim();
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
