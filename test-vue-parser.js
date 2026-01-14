
const Parser = require('tree-sitter');
const Vue = require('tree-sitter-vue');

try {
    const parser = new Parser();
    parser.setLanguage(Vue);
    console.log('Vue parser initialized successfully');

    const tree = parser.parse('<template><div></div></template>');
    console.log('Parsed tree root type:', tree.rootNode.type);
} catch (error) {
    console.error('Error initializing Vue parser:', error);
}
