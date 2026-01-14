/**
 * Vue Component Extractor
 * Extracts component metadata from .vue files
 */

import {
    ComponentIR,
    ApiCallIR,
    ComponentFunctionIR,
    PropIR,
    ExtractionResult,
    ParsedVueFile,
} from '../types/ir.types';
import {
    parseVueFile,
    getComponentName,
    classifyVueFile,
    deriveRouteFromPath,
    extractDefineProps,
    extractDefineEmits,
    extractComposableUsages,
    extractComponentUsages,
    extractApiCalls,
    extractFunctions,
} from '../parser/vue-parser';
import { ParsedFile } from '../types/ir.types';

/**
 * Extract component IR from a Vue file
 */
export function extractComponent(file: ParsedFile): ExtractionResult<ComponentIR> {
    const vueFile = parseVueFile(file);
    const components: ComponentIR[] = [];

    // Skip files with no script content
    if (!vueFile.scriptContent) {
        return { items: [], filePath: file.relativePath };
    }

    const name = getComponentName(file.relativePath);
    const type = classifyVueFile(file.relativePath);
    const route = type === 'page' ? deriveRouteFromPath(file.relativePath) : undefined;

    // Extract props
    const rawProps = extractDefineProps(vueFile.scriptContent);
    const props: PropIR[] = rawProps.map((p) => ({
        name: p.name,
        type: p.type,
        required: p.required,
    }));

    // Extract emits
    const emits = extractDefineEmits(vueFile.scriptContent);

    // Extract slots from template
    const slots = extractSlots(vueFile.templateContent);

    // Extract component usages from template
    const componentsUsed = extractComponentUsages(vueFile.templateContent);

    // Extract composable usages
    const composablesUsed = extractComposableUsages(vueFile.scriptContent);

    // Extract API calls
    const apiCalls: ApiCallIR[] = extractApiCalls(vueFile.scriptContent);

    // Extract functions
    const rawFunctions = extractFunctions(vueFile.scriptContent);
    const functions: ComponentFunctionIR[] = rawFunctions.map((f) => ({
        name: f.name,
        isAsync: f.isAsync,
        calls: f.calls,
    }));

    components.push({
        name,
        file: file.relativePath,
        type,
        route,
        props,
        emits,
        slots,
        componentsUsed,
        composablesUsed,
        apiCalls,
        functions,
    });

    return { items: components, filePath: file.relativePath };
}

/**
 * Extract slot definitions from template
 */
function extractSlots(templateContent: string): string[] {
    const slots: string[] = [];

    // Match <slot> or <slot name="...">
    const slotRegex = /<slot(?:\s+name=["']([^"']+)["'])?/g;

    let match;
    while ((match = slotRegex.exec(templateContent)) !== null) {
        const slotName = match[1] || 'default';
        if (!slots.includes(slotName)) {
            slots.push(slotName);
        }
    }

    return slots;
}

/**
 * Extract components from multiple Vue files
 */
export function extractComponents(files: ParsedFile[]): {
    pages: ComponentIR[];
    components: ComponentIR[];
} {
    const pages: ComponentIR[] = [];
    const components: ComponentIR[] = [];

    for (const file of files) {
        const result = extractComponent(file);
        for (const component of result.items) {
            if (component.type === 'page') {
                pages.push(component);
            } else {
                components.push(component);
            }
        }
    }

    return { pages, components };
}
