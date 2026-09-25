const fs = require('fs');
const file = 'src/data/translations.ts';
let content = fs.readFileSync(file, 'utf8');

// Fix English keys
content = content.replace(/"pm-awas-yojana_name"/g, '"pmay-g_name"');
content = content.replace(/"pm-awas-yojana_desc"/g, '"pmay-g_desc"');
content = content.replace(/"ayushman-bharat_name"/g, '"pmjay-ayushman_name"');
content = content.replace(/"ayushman-bharat_desc"/g, '"pmjay-ayushman_desc"');

const taIndex = content.indexOf('  ta: {');
if (taIndex !== -1) {
  const insertIndex = content.indexOf('  },', taIndex);
  
  const translations = `
    "pm-kisan_name": "பிரதான் மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)",
    "pm-kisan_desc": "இந்தியா முழுவதும் உள்ள அனைத்து விவசாயக் குடும்பங்களுக்கும் மூன்று சம தவணைகளில் ஆண்டுக்கு ₹6,000 வருமான ஆதரவு.",
    "pmay-g_name": "பிரதான் மந்திரி ஆவாஸ் யோஜனா - ஊரகம் (PMAY-G)",
    "pmay-g_desc": "வீடற்றவர்கள் மற்றும் குடிசை வீடுகளில் வசிப்பவர்களுக்கு அடிப்படை வசதிகளுடன் கூடிய கான்கிரீட் வீடுகளைக் கட்ட நிதியுதவி.",
    "pmjay-ayushman_name": "ஆயுஷ்மான் பாரத் - பிரதம மந்திரி ஜன ஆரோக்கிய யோஜனா (PM-JAY)",
    "pmjay-ayushman_desc": "இரண்டாம் மற்றும் மூன்றாம் நிலை மருத்துவமனை சிகிச்சைகளுக்கு ஒரு குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வழங்கும் உலகின் மிகப்பெரிய மருத்துவக் காப்பீட்டுத் திட்டம்.",
`;
  content = content.slice(0, insertIndex) + translations + content.slice(insertIndex);
  fs.writeFileSync(file, content);
  console.log('Translations injected successfully.');
} else {
  console.log('Could not find ta: block.');
}
