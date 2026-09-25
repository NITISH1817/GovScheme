const fs = require('fs');

const taPath = 'public/locales/ta/translation.json';
const taJSON = JSON.parse(fs.readFileSync(taPath, 'utf8'));

const newKeys = {
  "reasonEligible": "மிகவும் பரிந்துரைக்கப்படுகிறது ({{score}}% பொருத்தம்). {{state}} மாநிலத்தில் வசிக்கும் {{occupation}} என்ற முறையில் நீங்கள் அனைத்து சட்ட அளவுகோல்களையும் பூர்த்தி செய்கிறீர்கள். விண்ணப்பித்தவுடன் ₹{{benefit}} நிதியுதவி கிடைக்கும்.",
  "reasonConditional": "வலுவான பரிந்துரை ({{score}}% பொருத்தம்). உங்கள் சுயவிவரம் அளவுகோல்களை பூர்த்தி செய்கிறது, ஆனால் அதிகாரப்பூர்வ போர்ட்டலில் சமர்ப்பிக்கும் முன் சரிபார்ப்பை முடிக்க நீங்கள் {{docs}} பதிவேற்ற வேண்டும்.",
  "reasonNotEligible": "குறைந்த பொருத்த மதிப்பெண் ({{score}}%). முக்கிய தேவைகளை பூர்த்தி செய்யவில்லை: {{criteria}}.",
  "Farmer": "விவசாயி"
};

Object.assign(taJSON, newKeys);
fs.writeFileSync(taPath, JSON.stringify(taJSON, null, 2), 'utf8');

console.log("Translation JSON files updated successfully.");
