const fs = require('fs');
const execSync = require('child_process').execSync;
const oldCode = execSync('git show ee75917:income.html').toString();
const idx = oldCode.indexOf('SheetJS Table Export');
console.log(oldCode.substring(idx - 50, idx + 100));
