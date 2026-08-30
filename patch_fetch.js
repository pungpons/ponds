const fs = require('fs');

const interceptor = `
<script>
// POND AI: Global API Interceptor for Auto-Logout
(function() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);
        if (response.status === 401 && args[0] && (typeof args[0] === 'string') && args[0].includes('googleapis.com')) {
            localStorage.removeItem('pond_ai_token');
            localStorage.removeItem('pond_ai_token_time');
            window.location.href = 'index.html?expired=1';
        }
        return response;
    };
})();
</script>
`;

const files = ['income.html', 'uob.html', 'dollar.html', 'duty.html', 'asset.html', 'pharmadash.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if already injected
    if (content.includes('Global API Interceptor for Auto-Logout')) {
        console.log(`Already patched ${file}`);
        continue;
    }
    
    // Inject right after <head> or at the top of the file
    if (content.includes('<head>')) {
        content = content.replace('<head>', '<head>\n' + interceptor);
    } else {
        content = interceptor + '\n' + content;
    }
    
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
}
