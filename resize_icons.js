const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /className = 'w-16 h-16 rounded-\[22%\]/g,
    "className = 'w-[72px] h-[72px] rounded-[22%] app-icon-3d"
);

// wait, did I already have app-icon-3d in the class?
// let's check what the string is exactly.
