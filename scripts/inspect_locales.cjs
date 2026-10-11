const fs = require('fs');

const languages = ['en', 'hi', 'ml', 'ta', 'te', 'mr', 'gu'];
const data = {};
languages.forEach(lng => {
  data[lng] = JSON.parse(fs.readFileSync(`./public/locales/${lng}/translation.json`, 'utf8'));
});

console.log('--- Checking untranslated or missing keys ---');

const testKeys = [
  'viewMyRecommendations',
  'verifiedGovDataset',
  'guaranteedDisclaimer',
  'footerRights',
  'nationalPortal',
  'Central Scheme open across India',
  'Age Requirement Met',
  'Central Government',
  'Aadhaar Card',
  'Ration Card / SECC Family Identity Card',
  'Mobile Number',
  'Income',
  'Welcome Back',
  'Email Address',
  'Password',
  'Remember me',
  'Forgot password?',
  'Login',
  'Sign Up',
  'Education',
  'Agriculture',
  'Healthcare',
  'Employment',
  'Housing',
  'Business',
  'Food',
  'Needs more information',
  'Tamil Nadu',
  'Maharashtra',
  'Gujarat'
];

testKeys.forEach(k => {
  const row = {};
  languages.forEach(lng => {
    row[lng] = data[lng][k] || 'MISSING';
  });
  console.log(`KEY: "${k}"`);
  console.log('   mr:', row['mr']);
  console.log('   gu:', row['gu']);
  console.log('   hi:', row['hi']);
  console.log('   ta:', row['ta']);
});
