import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { schemesData } from '../src/data/schemes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Total schemes in schemesData:', schemesData.length);

const allSteps: Array<{ schemeId: string; schemeName: string; stepIndex: number; stepKey: string; text: string }> = [];
const uniqueSteps = new Set<string>();

const departments = new Set<string>();
const ministries = new Set<string>();
const categories = new Set<string>();
const requiredDocs = new Set<string>();

schemesData.forEach(s => {
  if (s.department) departments.add(s.department);
  if (s.ministry) ministries.add(s.ministry);
  if (s.category) categories.add(s.category);

  if (s.requiredDocuments) {
    s.requiredDocuments.forEach(d => requiredDocs.add(d));
  }

  if (s.applicationSteps && s.applicationSteps.length > 0) {
    s.applicationSteps.forEach((st, idx) => {
      uniqueSteps.add(st);
      allSteps.push({
        schemeId: s.id,
        schemeName: s.name,
        stepIndex: idx + 1,
        stepKey: `${s.id}_step_${idx + 1}`,
        text: st
      });
    });
  }
});

console.log('Schemes with steps count:', schemesData.filter(s => s.applicationSteps && s.applicationSteps.length > 0).length);
console.log('Total application steps instances:', allSteps.length);
console.log('Unique step strings:', uniqueSteps.size);
console.log('Unique departments:', departments.size);
console.log('Unique ministries:', ministries.size);
console.log('Unique categories:', categories.size);
console.log('Unique required docs:', requiredDocs.size);

const scratchDir = path.join(__dirname, '../scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

fs.writeFileSync(
  path.join(scratchDir, 'all_scheme_steps.json'),
  JSON.stringify(allSteps, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(scratchDir, 'unique_scheme_steps.json'),
  JSON.stringify(Array.from(uniqueSteps), null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(scratchDir, 'scheme_metadata.json'),
  JSON.stringify({
    departments: Array.from(departments),
    ministries: Array.from(ministries),
    categories: Array.from(categories),
    requiredDocs: Array.from(requiredDocs)
  }, null, 2),
  'utf8'
);

console.log('Saved step and metadata files to scratch/ successfully.');
