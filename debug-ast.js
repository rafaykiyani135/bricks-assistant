
const Parser = require('tree-sitter');
const TS = require('tree-sitter-typescript').typescript;

const parser = new Parser();
parser.setLanguage(TS);

const code = `
$apollo.query({
  query: GetCustomersDocument,
  variables: { id: 1 }
});
`;

const tree = parser.parse(code);
const root = tree.rootNode;

function traverse(node, depth = 0) {
    const ws = ' '.repeat(depth * 2);
    console.log(`${ws}${node.type} [${node.text}]`);
    for (const child of node.children) {
        traverse(child, depth + 1);
    }
}

// Find object literal
const object = SimpleFind(root, 'object');
if (object) {
    console.log('\n--- Object Children ---');
    traverse(object);
}

function SimpleFind(node, type) {
    if (node.type === type) return node;
    for (const child of node.children) {
        const found = SimpleFind(child, type);
        if (found) return found;
    }
    return null;
}
