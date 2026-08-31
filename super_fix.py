import re

files = ['income.html', 'asset.html', 'dollar.html', 'duty.html']
script_snippet = '<script id="ultimate-theme-fix">try{if(localStorage.theme==="dark"||(!("theme" in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}}catch(e){}</script>'

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Remove old theme-flash-fix if any
    content = re.sub(r'<script id="theme-flash-fix">.*?</script>', '', content)
    
    # Avoid double inserting
    if 'ultimate-theme-fix' not in content:
        # Insert after <head>
        content = content.replace('<head>', f'<head>\n{script_snippet}')
        
    # Fix the CSS
    old_css = '@media (prefers-color-scheme: dark) { html { background: #020617; } }'
    new_css = 'html.dark { background: #020617; }\n@media (prefers-color-scheme: dark) { html:not(.light) { background: #020617; } }'
    
    if old_css in content:
        content = content.replace(old_css, new_css)
        
    with open(f, 'w') as file:
        file.write(content)

print("Ultimate fix applied successfully")
