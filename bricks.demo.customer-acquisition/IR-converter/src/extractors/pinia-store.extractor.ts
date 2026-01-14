/**
 * Pinia Store Extractor
 * Extracts store definitions from Pinia stores
 */

import {
    StoreIR,
    StoreStateIR,
    StoreActionIR,
    ExtractionResult,
    ParsedFile,
} from '../types/ir.types';
import {
    parseTypeScript,
    getRootNode,
    findDescendantsByType,
    getNodeText,
} from '../parser/ts-parser';

/**
 * Extract Pinia stores from a TypeScript file
 */
export function extractStores(
    content: string,
    filePath: string
): ExtractionResult<StoreIR> {
    const stores: StoreIR[] = [];

    // Check if file contains defineStore
    if (!content.includes('defineStore')) {
        return { items: [], filePath };
    }

    // Parse with Tree-sitter
    const tree = parseTypeScript(content);
    const rootNode = getRootNode(tree);

    // Find defineStore calls
    const callExpressions = findDescendantsByType(rootNode, 'call_expression');

    for (const callExpr of callExpressions) {
        const calleeText = getNodeText(callExpr.children[0] || callExpr);

        if (!calleeText.includes('defineStore')) continue;

        // Extract store name from first argument
        const args = findDescendantsByType(callExpr, 'arguments')[0];
        if (!args) continue;

        let storeName = '';
        let exportName = '';

        // Find store name (first string argument)
        for (const child of args.children) {
            if (child.type === 'string' || child.type === 'template_string') {
                storeName = getNodeText(child).replace(/['"]/g, '');
                break;
            }
        }

        // Try to find the variable this is assigned to
        // Pattern: export const useAuthStore = defineStore(...)
        const parent = callExpr.parent;
        if (parent && parent.type === 'variable_declarator') {
            const nameNode = parent.children[0];
            if (nameNode) {
                exportName = getNodeText(nameNode);
            }
        }

        if (!storeName && exportName) {
            // Derive store name from export name: useAuthStore -> auth
            storeName = exportName
                .replace(/^use/, '')
                .replace(/Store$/, '')
                .toLowerCase();
        }

        if (!exportName && storeName) {
            // Derive export name from store name: auth -> useAuthStore
            exportName = `use${capitalize(storeName)}Store`;
        }

        // Extract state, getters, actions from the options object
        const { state, getters, actions } = extractStoreOptions(callExpr, content);

        stores.push({
            name: storeName || 'unknown',
            file: filePath,
            exportName: exportName || 'unknown',
            state,
            getters,
            actions,
        });
    }

    return { items: stores, filePath };
}

/**
 * Extract state, getters, and actions from store definition
 */
function extractStoreOptions(
    callExpr: any,
    fullContent: string
): {
    state: StoreStateIR[];
    getters: string[];
    actions: StoreActionIR[];
} {
    const state: StoreStateIR[] = [];
    const getters: string[] = [];
    const actions: StoreActionIR[] = [];

    // Find the options object (second argument to defineStore)
    const argsNode = findDescendantsByType(callExpr, 'arguments')[0];
    if (!argsNode) return { state, getters, actions };

    // Look for object or arrow function
    const objectNode = findDescendantsByType(argsNode, 'object')[0];
    const arrowFunc = findDescendantsByType(argsNode, 'arrow_function')[0];

    if (objectNode) {
        // Options API style: defineStore('name', { state: () => ({}), actions: {} })
        extractFromOptionsObject(objectNode, state, getters, actions);
    } else if (arrowFunc) {
        // Setup style: defineStore('name', () => { const x = ref(); return { x } })
        extractFromSetupFunction(arrowFunc, state, actions, fullContent);
    }

    return { state, getters, actions };
}

/**
 * Extract from Options API style store
 */
function extractFromOptionsObject(
    objectNode: any,
    state: StoreStateIR[],
    getters: string[],
    actions: StoreActionIR[]
): void {
    for (const child of objectNode.children) {
        if (child.type !== 'pair') continue;

        const keyNode = child.children[0];
        if (!keyNode) continue;

        const key = getNodeText(keyNode).replace(/['"]/g, '');

        if (key === 'state') {
            // Extract state properties
            const stateArrow = findDescendantsByType(child, 'arrow_function')[0];
            if (stateArrow) {
                const stateObj = findDescendantsByType(stateArrow, 'object')[0];
                if (stateObj) {
                    extractObjectProperties(stateObj, state);
                }
            }
        } else if (key === 'getters') {
            // Extract getter names
            const gettersObj = findDescendantsByType(child, 'object')[0];
            if (gettersObj) {
                for (const prop of gettersObj.children) {
                    if (prop.type === 'pair' || prop.type === 'method_definition') {
                        const propKey = prop.children[0];
                        if (propKey) {
                            getters.push(getNodeText(propKey).replace(/['"]/g, ''));
                        }
                    }
                }
            }
        } else if (key === 'actions') {
            // Extract action names
            const actionsObj = findDescendantsByType(child, 'object')[0];
            if (actionsObj) {
                for (const prop of actionsObj.children) {
                    if (prop.type === 'pair' || prop.type === 'method_definition') {
                        const propKey = prop.children[0];
                        if (propKey) {
                            const actionName = getNodeText(propKey).replace(/['"]/g, '');
                            const isAsync = getNodeText(prop).includes('async');
                            actions.push({
                                name: actionName,
                                isAsync,
                                calls: [],
                            });
                        }
                    }
                }
            }
        }
    }
}

/**
 * Extract from Setup style store (composition API)
 */
function extractFromSetupFunction(
    arrowFunc: any,
    state: StoreStateIR[],
    actions: StoreActionIR[],
    fullContent: string
): void {
    const funcText = getNodeText(arrowFunc);

    // Find ref() and reactive() calls for state
    const refRegex = /const\s+(\w+)\s*=\s*ref\s*[<(]/g;
    const reactiveRegex = /const\s+(\w+)\s*=\s*reactive\s*[<(]/g;

    let match;
    while ((match = refRegex.exec(funcText)) !== null) {
        state.push({ name: match[1] });
    }
    while ((match = reactiveRegex.exec(funcText)) !== null) {
        state.push({ name: match[1] });
    }

    // Find function declarations as actions
    const funcRegex = /(async\s+)?function\s+(\w+)\s*\(/g;
    const arrowRegex = /const\s+(\w+)\s*=\s*(async\s*)?\([^)]*\)\s*=>/g;

    while ((match = funcRegex.exec(funcText)) !== null) {
        actions.push({
            name: match[2],
            isAsync: !!match[1],
            calls: [],
        });
    }
    while ((match = arrowRegex.exec(funcText)) !== null) {
        actions.push({
            name: match[1],
            isAsync: !!match[2],
            calls: [],
        });
    }
}

/**
 * Extract object properties as state
 */
function extractObjectProperties(objectNode: any, state: StoreStateIR[]): void {
    for (const child of objectNode.children) {
        if (child.type === 'pair') {
            const keyNode = child.children[0];
            const valueNode = child.children[2];
            if (keyNode) {
                const name = getNodeText(keyNode).replace(/['"]/g, '');
                const type = valueNode ? inferType(getNodeText(valueNode)) : undefined;
                state.push({ name, type });
            }
        }
    }
}

/**
 * Infer type from value
 */
function inferType(value: string): string | undefined {
    if (value === 'null') return 'null';
    if (value === 'true' || value === 'false') return 'boolean';
    if (/^\d+$/.test(value)) return 'number';
    if (/^['"]/.test(value)) return 'string';
    if (/^\[/.test(value)) return 'array';
    if (/^\{/.test(value)) return 'object';
    return undefined;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
