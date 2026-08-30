const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the block of script
    const regex = /<script>\s*\/\/\ POND AI: Global API Interceptor for Auto-Logout[\s\S]*?<\/script>/;
    if (regex.test(content)) {
        content = content.replace(regex, '');
        fs.writeFileSync(file, content);
        console.log('Removed old interceptor from', file);
    }
}
