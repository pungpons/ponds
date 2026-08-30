const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('gas_backend.js')) continue;

    // Inject before first script, or at the end of head
    if (content.includes('<head>')) {
        content = content.replace('</head>', '    <script src="gas_backend.js"></script>\n</head>');
        fs.writeFileSync(file, content);
        console.log('Injected gas_backend.js into', file);
    }
}
