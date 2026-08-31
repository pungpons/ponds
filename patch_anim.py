import re

with open('app_old.js', 'r') as f:
    old_content = f.read()

start_marker = '// 1. Icon bounce feedback'
end_marker = '// Navigate while overlay is fully covering screen'
start_old = old_content.find(start_marker)
end_old = old_content.find(end_marker)

if start_old != -1 and end_old != -1:
    old_anim = old_content[start_old:end_old]

    with open('app.js', 'r') as f:
        current_content = f.read()

    start_new = current_content.find('// 1. Icon press feedback (Smooth iOS style)')
    end_new = current_content.find('// Navigate while overlay is fully covering screen')

    if start_new != -1 and end_new != -1:
        new_content = current_content[:start_new] + old_anim + current_content[end_new:]
        with open('app.js', 'w') as f:
            f.write(new_content)
        print("Restored exact old animation successfully")
    else:
        print("Could not find boundaries in current app.js")
else:
    print("Could not find boundaries in app_old.js")
