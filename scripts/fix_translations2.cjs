const fs = require('fs');

const enPath = 'public/locales/en/translation.json';
const taPath = 'public/locales/ta/translation.json';

const taJSON = JSON.parse(fs.readFileSync(taPath, 'utf8'));

// Keys we want to ensure exist in Tamil for the cards:
const newKeys = {
  "Central Scheme open across India": "இந்தியா முழுவதும் திறக்கப்பட்டுள்ள மத்திய திட்டம்",
  "Occupation matches (Farmer)": "தொழில் பொருந்துகிறது (விவசாயி)",
  "Social Category requirement met (General)": "சமூக வகை தேவை பூர்த்தி செய்யப்பட்டது (பொது)",
  "Eligible based on profile criteria, but missing 4 document(s) in Document Vault (Aadhaar Card, Land Record / Khasra Khatauni, Bank Account Passbook, Sowing Certificate from Patwari). Upload before applying on official portal.": "சுயவிவர அளவுகோல்களின் அடிப்படையில் தகுதியுடையவர், ஆனால் ஆவண பெட்டகத்தில் 4 ஆவணங்கள் இல்லை (ஆதார் அட்டை, நில ஆவணம் / கஸ்ரா கதௌனி, வங்கி கணக்கு புத்தகம், பட்வாரியிடமிருந்து விதைப்பு சான்றிதழ்). அதிகாரப்பூர்வ போர்ட்டலில் விண்ணப்பிக்கும் முன் பதிவேற்றவும்.",
  "Conditionally Eligible": "நிபந்தனையுடன் தகுதியுடையவர்",
  "Eligible": "தகுதியுடையவர்",
  "Not Eligible": "தகுதியற்றவர்",
  "Aadhaar Card": "ஆதார் அட்டை",
  "Land Record / Khasra Khatauni": "நில ஆவணம் / கஸ்ரா கதௌனி",
  "Bank Account Passbook": "வங்கி கணக்கு புத்தகம்",
  "Sowing Certificate from Patwari": "பட்வாரியிடமிருந்து விதைப்பு சான்றிதழ்",
  "pm-kisan_name": "பிரதான் மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)",
  "pm-kisan_desc": "இந்தியா முழுவதும் உள்ள அனைத்து விவசாயக் குடும்பங்களுக்கும் மூன்று சம தவணைகளில் ஆண்டுக்கு ₹6,000 வருமான ஆதரவு.",
  "pmay-g_name": "பிரதான் மந்திரி ஆவாஸ் யோஜனா - ஊரகம் (PMAY-G)",
  "pmay-g_desc": "வீடற்றவர்கள் மற்றும் குடிசை வீடுகளில் வசிப்பவர்களுக்கு அடிப்படை வசதிகளுடன் கூடிய கான்கிரீட் வீடுகளைக் கட்ட நிதியுதவி.",
  "pmjay-ayushman_name": "ஆயுஷ்மான் பாரத் - பிரதம மந்திரி ஜன ஆரோக்கிய யோஜனா (PM-JAY)",
  "pmjay-ayushman_desc": "இரண்டாம் மற்றும் மூன்றாம் நிலை மருத்துவமனை சிகிச்சைகளுக்கு ஒரு குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வழங்கும் உலகின் மிகப்பெரிய மருத்துவக் காப்பீட்டுத் திட்டம்.",
  "pm-fasal-bima_name": "பிரதான் மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY)",
  "pm-fasal-bima_desc": "இயற்கை பேரிடர்களால் ஏற்படும் பயிர் இழப்புகளுக்கு நிதியுதவி அளிக்கும் காப்பீட்டுத் திட்டம்."
};

Object.assign(taJSON, newKeys);
fs.writeFileSync(taPath, JSON.stringify(taJSON, null, 2), 'utf8');

// Also update English JSON
const enJSON = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const enNewKeys = {
  "pmay-g_name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
  "pmay-g_desc": "Financial assistance to construct pucca houses with basic amenities for homeless and kutcha house dwellers.",
  "pmjay-ayushman_name": "Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)",
  "pmjay-ayushman_desc": "World's largest health insurance scheme providing ₹5 Lakh per family per year for secondary and tertiary hospitalization.",
  "pm-fasal-bima_name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
  "pm-fasal-bima_desc": "Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss from natural calamities, pests, and diseases.",
  "pm-kisan_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
  "pm-kisan_desc": "Income support of ₹6,000 per year in three equal installments to all landholding farmer families across India."
};

Object.assign(enJSON, enNewKeys);
fs.writeFileSync(enPath, JSON.stringify(enJSON, null, 2), 'utf8');

console.log("Translation JSON files updated successfully.");
