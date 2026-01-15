
const fs = require('fs');
const path = require('path');
const { parseTypeScript, getRootNode, findDescendantsByType, findDecorators, getDecoratorName, getDecoratorArguments } = require('./dist/parser/ts-parser');

async function main() {
    const filePath = path.resolve('../server/src/auth/auth.controller.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    const tree = parseTypeScript(content);
    const root = getRootNode(tree);
    
    // Find AuthController class
    const classNode = findDescendantsByType(root, 'class_declaration').find(c => {
        const id = c.children.find(ch => ch.type === 'type_identifier');
        return id && id.text === 'AuthController';
    });
    
    if (!classNode) {
        console.log('AuthController not found');
        return;
    }
    
    console.log('Found AuthController');
    console.log(`Class parent type: ${classNode.parent ? classNode.parent.type : 'none'}`);
    
    // Check class previous siblings
    let sibling = classNode.previousSibling;
    while(sibling) {
        console.log(`Class sibling: ${sibling.type}`);
        sibling = sibling.previousSibling;
    }
    
    const classDecorators = findDecorators(classNode);
    console.log(`Class decorators found: ${classDecorators.length}`);
    classDecorators.forEach(d => console.log(` - ${d.text}`));

    // Find methods
    const methods = findDescendantsByType(classNode, 'method_definition');
    console.log(`Found ${methods.length} methods`);
    
    for (const method of methods) {
        const nameNode = findDescendantsByType(method, 'property_identifier')[0];
        const name = nameNode ? nameNode.text : 'unknown';
        console.log(`\nMethod: ${name}`);
        
        // Use findDecorators
        const decorators = findDecorators(method);
        console.log(`findDecorators found ${decorators.length} decorators`);
        
        for (const d of decorators) {
            console.log(`  - ${d.text}`);
        }
    }
}

main();
