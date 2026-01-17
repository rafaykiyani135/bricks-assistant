/**
 * Vue Component Extractor
 * Extracts component metadata from .vue files
 */

import {
    ComponentIR,
    ApiCallIR,
    ComponentFunctionIR,
    PropIR,
    UILabelIR,
    UIActionIR,
    FormFieldIR,
    DisabledStateIR,
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
    extractUILabels,
    extractUIActions,
    extractFormFields,
    extractDisabledStates,
    extractConstants,
    extractComputedMetadata,
    extractDataFlows,
    extractUIStates,
    extractEntities,
    extractBusinessRules,
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
        type: f.type,
        codeSnippet: f.codeSnippet,
    }));

    // Extract UI elements from template
    const rawLabels = extractUILabels(vueFile.templateContent);
    const labels: UILabelIR[] = rawLabels.map((l) => ({
        text: l.text,
        source: l.source as UILabelIR['source'],
        element: l.element,
    }));

    const rawActions = extractUIActions(vueFile.templateContent);
    const actions: UIActionIR[] = rawActions.map((a) => ({
        event: a.event as UIActionIR['event'],
        handler: a.handler,
        element: a.element,
        label: a.label,
    }));

    const rawFormFields = extractFormFields(vueFile.templateContent);
    const formFields: FormFieldIR[] = rawFormFields.map((f) => ({
        name: f.name,
        element: f.element,
        placeholder: f.placeholder,
        required: f.required,
        disabled: f.disabled,
    }));

    const rawDisabledStates = extractDisabledStates(vueFile.templateContent);
    const disabledStates: DisabledStateIR[] = rawDisabledStates.map((d) => ({
        element: d.element,
        condition: d.condition,
    }));

    // Extract constants (new)
    const constants = extractConstants(vueFile.scriptContent);

    // Advanced structural sections
    const computed = extractComputedMetadata(vueFile.scriptContent);
    const dataFlow = extractDataFlows(vueFile.scriptContent);
    const uiStates = extractUIStates(vueFile.scriptContent);
    const entities = extractEntities(vueFile.scriptContent);
    const rules = extractBusinessRules(vueFile.scriptContent);

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
        labels,
        actions,
        formFields,
        disabledStates,
        constants,
        computed,
        dataFlow,
        uiStates,
        entities,
        rules,
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
