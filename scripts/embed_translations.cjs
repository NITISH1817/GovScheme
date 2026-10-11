const fs = require('fs');
const path = require('path');
const dict = require('./mr_gu_translations.cjs');

const syncScriptPath = path.join(__dirname, 'sync_screenshots_translations.cjs');
let syncScript = fs.readFileSync(syncScriptPath, 'utf8');

const anchor = '  "googleLoginFailed": {';
const insertIndex = syncScript.indexOf(anchor);

if (insertIndex !== -1) {
  const hi = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/hi/translation.json'), 'utf8'));
  const ta = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/ta/translation.json'), 'utf8'));
  const te = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/te/translation.json'), 'utf8'));
  const ml = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/ml/translation.json'), 'utf8'));

  let snippet = '';
  for (const [k, v] of Object.entries(dict)) {
    snippet += '  ' + JSON.stringify(k) + ': {\n' +
      '    en: ' + JSON.stringify(k) + ',\n' +
      '    hi: ' + JSON.stringify(hi[k] || '') + ',\n' +
      '    ta: ' + JSON.stringify(ta[k] || '') + ',\n' +
      '    te: ' + JSON.stringify(te[k] || '') + ',\n' +
      '    ml: ' + JSON.stringify(ml[k] || '') + ',\n' +
      '    mr: ' + JSON.stringify(v.mr) + ',\n' +
      '    gu: ' + JSON.stringify(v.gu) + '\n' +
      '  },\n';
  }

  syncScript = syncScript.slice(0, insertIndex) + snippet + syncScript.slice(insertIndex);
  fs.writeFileSync(syncScriptPath, syncScript, 'utf8');
  console.log('Successfully embedded 221 entries into sync_screenshots_translations.cjs');
} else {
  console.error('Could not find anchor in sync script');
}
