/**
 * Vue SFC Parser (Hybrid: Regex extraction + Tree-sitter analysis)
 * Extracts script and template content using Regex, then analyzes script with Tree-sitter
 */

import { ParsedVueFile, ParsedFile } from '../types/ir.types';
import {
    parseTypeScript,
    findDescendantsByType,
    getNodeText,
    findFirstChildByType,
    SyntaxNode,
} from './ts-parser';

/**
 * Regex patterns for extracting Vue SFC blocks
 * We use regex for the "shell" because it's robust enough for top-level tags
 * and avoids native binding issues with tree-sitter-vue
 */
const SCRIPT_SETUP_REGEX = /<script\s+setup[^>]*(?:\s+lang=["']ts["'][^>]*)?>([\s\S]*?)<\/script>/i;
const SCRIPT_REGEX = /<script[^>]*(?:\s+lang=["']ts["'][^>]*)?>([\s\S]*?)<\/script>/i;
const TEMPLATE_REGEX = /<template[^>]*>([\s\S]*?)<\/template>/i;

/**
 * Check if a file is a Vue file
 */
export function isVueFile(filePath: string): boolean {
    return filePath.endsWith('.vue');
}

/**
 * Parse a Vue SFC file and extract its parts
 */
export function parseVueFile(file: ParsedFile): ParsedVueFile {
    const content = file.content;

    // Try to extract <script setup> first (preferred in Vue 3)
    let scriptMatch = content.match(SCRIPT_SETUP_REGEX);
    let isScriptSetup = !!scriptMatch;

    // Fall back to regular <script>
    if (!scriptMatch) {
        scriptMatch = content.match(SCRIPT_REGEX);
        isScriptSetup = false;
    }

    // Extract template
    const templateMatch = content.match(TEMPLATE_REGEX);

    return {
        ...file,
        scriptContent: scriptMatch ? scriptMatch[1].trim() : '',
        templateContent: templateMatch ? templateMatch[1].trim() : '',
        isScriptSetup,
    };
}

/**
 * Extract component name from file path
 */
export function getComponentName(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    const fileName = parts[parts.length - 1];
    return fileName.replace('.vue', '');
}

/**
 * Derive route from page file path (Nuxt file-system routing)
 */
export function deriveRouteFromPath(filePath: string): string {
    const pagesIndex = filePath.indexOf('pages');
    if (pagesIndex === -1) return '/';

    let routePath = filePath.substring(pagesIndex + 6);
    routePath = routePath.replace('.vue', '');
    routePath = routePath.replace(/\/index$/, '');
    if (routePath === 'index') routePath = '';

    // Convert [param] to :param
    routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1');
    routePath = routePath.replace(/\\/g, '/');

    return '/' + routePath;
}

/**
 * Classify a Vue file based on its path
 */
export function classifyVueFile(filePath: string): 'page' | 'component' | 'layout' {
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

    if (normalizedPath.includes('/pages/') || normalizedPath.startsWith('pages/')) {
        return 'page';
    }
    if (normalizedPath.includes('/layouts/') || normalizedPath.startsWith('layouts/')) {
        return 'layout';
    }
    return 'component';
}

/**
 * Extract imports from script content (VST based)
 */
export function extractImports(scriptContent: string): string[] {
    const tree = parseTypeScript(scriptContent);
    const imports: string[] = [];

    const importStatements = findDescendantsByType(tree.rootNode, 'import_statement');

    for (const stmt of importStatements) {
        const source = findFirstChildByType(stmt, 'string');
        if (source) {
            imports.push(getNodeText(source).replace(/['"]/g, ''));
        }
    }

    return imports;
}

/**
 * Extract defineProps from script setup using AST
 */
export function extractDefineProps(scriptContent: string): { name: string; type?: string; required: boolean }[] {
    const tree = parseTypeScript(scriptContent);
    const props: { name: string; type?: string; required: boolean }[] = [];

    const callExpressions = findDescendantsByType(tree.rootNode, 'call_expression');

    for (const call of callExpressions) {
        const identifier = findFirstChildByType(call, 'identifier');
        if (identifier && getNodeText(identifier) === 'defineProps') {

            // 1. Generic Arguments: defineProps<{ foo: string }>()
            const typeArgs = findFirstChildByType(call, 'type_arguments');
            if (typeArgs) {
                const objectType = findDescendantsByType(typeArgs, 'property_signature');
                for (const prop of objectType) {
                    const nameNode = findFirstChildByType(prop, 'property_identifier');
                    const typeNode = findFirstChildByType(prop, 'type_annotation');

                    if (nameNode) {
                        const name = getNodeText(nameNode);
                        const isOptional = prop.text.includes('?'); // Quick check for optional flag

                        let typeStr = 'any';
                        if (typeNode) {
                            // Strip ': ' prefix
                            typeStr = getNodeText(typeNode).replace(/^:\s*/, '');
                        }

                        props.push({
                            name,
                            type: typeStr,
                            required: !isOptional
                        });
                    }
                }
            }

            // 2. Runtime Arguments: defineProps({ foo: String })
            // (Skipped for now as TS generic syntax is more common in this codebase)
        }
    }

    return props;
}

/**
 * Extract defineEmits from script setup using AST
 */
export function extractDefineEmits(scriptContent: string): string[] {
    const tree = parseTypeScript(scriptContent);
    const emits: string[] = [];

    const callExpressions = findDescendantsByType(tree.rootNode, 'call_expression');

    for (const call of callExpressions) {
        const identifier = findFirstChildByType(call, 'identifier');
        if (identifier && getNodeText(identifier) === 'defineEmits') {

            // 1. Array Syntax: defineEmits(['foo', 'bar'])
            const args = findFirstChildByType(call, 'arguments');
            if (args) {
                const array = findFirstChildByType(args, 'array');
                if (array) {
                    const strings = findDescendantsByType(array, 'string');
                    strings.forEach(s => emits.push(getNodeText(s).replace(/['"]/g, '')));
                }
            }

            // 2. Type Syntax: defineEmits<{ (e: 'foo'): void }>()
            const typeArgs = findFirstChildByType(call, 'type_arguments');
            if (typeArgs) {
                const callSigs = findDescendantsByType(typeArgs, 'call_signature');
                for (const sig of callSigs) {
                    const params = findFirstChildByType(sig, 'formal_parameters');
                    if (params) {
                        const param = params.children.find(c => c.type === 'required_parameter');
                        if (param) {
                            const literalType = findDescendantsByType(param, 'string_literal_type')[0] || findDescendantsByType(param, 'literal_type')[0];
                            if (literalType) {
                                // Extract 'foo' from 'foo' or "foo"
                                emits.push(getNodeText(literalType).replace(/['"]/g, ''));
                            }
                        }
                    }
                }
            }
        }
    }
    return emits;
}

/**
 * Extract composable usages (functions starting with 'use')
 */
export function extractComposableUsages(scriptContent: string): string[] {
    const tree = parseTypeScript(scriptContent);
    const composables = new Set<string>();

    const callExpressions = findDescendantsByType(tree.rootNode, 'call_expression');

    for (const call of callExpressions) {
        const identifier = findFirstChildByType(call, 'identifier');
        if (identifier) {
            const name = getNodeText(identifier);
            if (name.startsWith('use') && name.length > 3) {
                composables.add(name);
            }
        }
    }

    return Array.from(composables);
}

/**
 * Extract component usages from template
 */
export function extractComponentUsages(templateContent: string): string[] {
    // Regex is actually surprisingly effective for template parsing if we assume
    // standard PascalCase usage, but we can do a quick tag scan
    const components = new Set<string>();
    const pascalRegex = /<([A-Z][a-zA-Z0-9]+)/g;

    let match;
    while ((match = pascalRegex.exec(templateContent)) !== null) {
        components.add(match[1]);
    }

    return Array.from(components);
}

/**
 * Extract GraphQL/Apollo API calls using AST
 */
export function extractApiCalls(scriptContent: string): { operationName: string; type: 'query' | 'mutation'; document?: string; hook?: string }[] {
    const tree = parseTypeScript(scriptContent);
    const apiCalls: { operationName: string; type: 'query' | 'mutation'; document?: string; hook?: string }[] = [];

    const callExpressions = findDescendantsByType(tree.rootNode, 'call_expression');

    for (const call of callExpressions) {
        const identifier = findFirstChildByType(call, 'identifier');

        // Match generated hooks: useCreateCustomerMutation()
        if (identifier) {
            const name = getNodeText(identifier);
            if (name.match(/^use.*(Query|Mutation)$/)) {
                const type = name.endsWith('Mutation') ? 'mutation' : 'query';
                const operationName = name.replace(/^use/, '').replace(/(Query|Mutation)$/, '');

                apiCalls.push({
                    operationName,
                    type,
                    hook: name
                });
            }
        }

        // Match standard hooks: useQuery(Document)
        if (identifier && (['useQuery', 'useMutation', 'useLazyQuery'].includes(getNodeText(identifier)))) {
            const args = findFirstChildByType(call, 'arguments');
            if (args) {
                const firstArg = args.children[1]; // First real argument (skip parenthesis)
                if (firstArg) {
                    const docName = getNodeText(firstArg);
                    if (docName.endsWith('Document')) {
                        const operationName = docName.replace('Document', '');
                        const type = getNodeText(identifier).toLowerCase().includes('mutation') ? 'mutation' : 'query';

                        apiCalls.push({
                            operationName,
                            type,
                            document: docName
                        });
                    }
                }
            }
        }

        // Match $apollo.query/mutate
        const memberExpr = findFirstChildByType(call, 'member_expression');
        if (memberExpr) {
            const prop = findFirstChildByType(memberExpr, 'property_identifier');
            const obj = findFirstChildByType(memberExpr, 'member_expression') || findFirstChildByType(memberExpr, 'identifier');

            if (prop && obj && getNodeText(obj).includes('$apollo') && ['query', 'mutate'].includes(getNodeText(prop))) {
                const args = findFirstChildByType(call, 'arguments');
                if (args) {
                    const objectArg = findFirstChildByType(args, 'object');
                    if (objectArg) {
                        const properties = findDescendantsByType(objectArg, 'pair');
                        for (const pair of properties) {
                            const key = findFirstChildByType(pair, 'property_identifier');
                            if (key && (getNodeText(key) === 'query' || getNodeText(key) === 'mutation')) {
                                const value = pair.namedChildren[1]; // 0 is key, 1 is value
                                if (value) {
                                    const docName = getNodeText(value);
                                    if (docName.endsWith('Document')) {
                                        apiCalls.push({
                                            operationName: docName.replace('Document', ''),
                                            type: getNodeText(prop) === 'mutate' ? 'mutation' : 'query',
                                            document: docName
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }


    return apiCalls;
}

/**
 * Extract function definitions and their internal calls using AST
 */
export function extractFunctions(scriptContent: string): { name: string; isAsync: boolean; calls: string[] }[] {
    const tree = parseTypeScript(scriptContent);
    const functions: { name: string; isAsync: boolean; calls: string[] }[] = [];

    // 1. Variable Declarations (const foo = () => {})
    const varDecls = findDescendantsByType(tree.rootNode, 'variable_declarator');
    for (const decl of varDecls) {
        const nameNode = findFirstChildByType(decl, 'identifier');
        const arrowFunc = findFirstChildByType(decl, 'arrow_function');

        if (nameNode && arrowFunc) {
            const name = getNodeText(nameNode);
            const isAsync = arrowFunc.text.startsWith('async');

            // Extract body calls
            const body = findFirstChildByType(arrowFunc, 'statement_block') || arrowFunc; // block or direct return
            const calls = extractInternalCalls(body);

            functions.push({ name, isAsync, calls });
        }
    }

    // 2. Function Declarations (function foo() {})
    const funcDecls = findDescendantsByType(tree.rootNode, 'function_declaration');
    for (const decl of funcDecls) {
        const nameNode = findFirstChildByType(decl, 'identifier');
        if (nameNode) {
            const name = getNodeText(nameNode);
            const isAsync = decl.text.startsWith('async');

            const body = findFirstChildByType(decl, 'statement_block');
            const calls = body ? extractInternalCalls(body) : [];

            functions.push({ name, isAsync, calls });
        }
    }

    return functions;
}

/**
 * Helper: Extract function calls inside a syntax node
 */
function extractInternalCalls(node: SyntaxNode): string[] {
    const calls: string[] = [];
    const callExprs = findDescendantsByType(node, 'call_expression');

    for (const expr of callExprs) {
        const identifier = findFirstChildByType(expr, 'identifier');
        const memberExpr = findFirstChildByType(expr, 'member_expression');

        if (identifier) {
            calls.push(getNodeText(identifier));
        } else if (memberExpr) {
            // Extract 'foo.bar' from member expression
            const text = getNodeText(memberExpr);
            // Clean up newlines/spaces
            calls.push(text.replace(/\s+/g, ''));
        }
    }

    return [...new Set(calls)]; // Unique calls
}
