const fs = require('fs');
let c = fs.readFileSync('src/data/translations.ts', 'utf8');
const linesToRemove = [
  '  "Central Scheme open across India": string;',
  '  "Occupation matches": string;',
  '  "Farmer": string;',
  '  "Student": string;',
  '  "Age Requirement Met": string;',
  '  "Gender requirement met": string;',
  '  "Resident of": string;',
  '  "Income": string;',
  '  "Male": string;',
  '  "Female": string;',
  '  "All": string;'
];
linesToRemove.forEach(line => {
  c = c.replace(line + '\n', '');
});
fs.writeFileSync('src/data/translations.ts', c);
