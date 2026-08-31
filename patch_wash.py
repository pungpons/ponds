import re

with open('app.js', 'r') as f:
    content = f.read()

# Replace the hardcoded wash color with dynamic targetBg
pattern = r"background: \${isDark \? '#0f172a' : '#ffffff'};"

def replacer(match):
    return """
                background: ${(() => {
                    let target = isDark ? '#020617' : '#f8fafc';
                    if (app.url === 'uob.html') target = '#0f172a';
                    else if (app.url === 'pharmadash.html') target = '#f1f5f9';
                    return target;
                })()};"""

new_content = re.sub(pattern, replacer, content)

with open('app.js', 'w') as f:
    f.write(new_content)
print("Wash color patched successfully")
