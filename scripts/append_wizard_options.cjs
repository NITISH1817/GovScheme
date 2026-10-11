const fs = require('fs');
const path = require('path');
const dict = require('./wizard_options_translations.cjs');

const syncScriptPath = path.join(__dirname, 'sync_screenshots_translations.cjs');
let syncScript = fs.readFileSync(syncScriptPath, 'utf8');

const anchor = '  "googleLoginFailed": {';
const insertIndex = syncScript.indexOf(anchor);

if (insertIndex !== -1) {
  let snippet = '';
  for (const [k, v] of Object.entries(dict)) {
    snippet += '  ' + JSON.stringify(k) + ': {\n' +
      '    en: ' + JSON.stringify(v.en) + ',\n' +
      '    hi: ' + JSON.stringify(v.hi) + ',\n' +
      '    ta: ' + JSON.stringify(v.ta) + ',\n' +
      '    te: ' + JSON.stringify(v.te) + ',\n' +
      '    ml: ' + JSON.stringify(v.ml) + ',\n' +
      '    mr: ' + JSON.stringify(v.mr) + ',\n' +
      '    gu: ' + JSON.stringify(v.gu) + '\n' +
      '  },\n';
  }
  syncScript = syncScript.slice(0, insertIndex) + snippet + syncScript.slice(insertIndex);
  fs.writeFileSync(syncScriptPath, syncScript, 'utf8');
  console.log('Appended wizard options to sync_screenshots_translations.cjs');
}
