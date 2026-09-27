const fs = require('fs');
let content = fs.readFileSync('src/data/translations.ts', 'utf8');

// Update TranslationDict interface
content = content.replace(
  'incomeFilter5L: string;',
  'incomeFilter5L: string;\n  "Central Scheme open across India"?: string;\n  "Occupation matches"?: string;\n  "Farmer"?: string;\n  "Student"?: string;\n  "Age Requirement Met"?: string;\n  "Gender requirement met"?: string;\n  "Resident of"?: string;\n  "Income"?: string;\n  "Male"?: string;\n  "Female"?: string;\n  "All"?: string;'
);

const additions = {
  en: `    "Central Scheme open across India": "Central Scheme open across India",
    "Occupation matches": "Occupation matches",
    "Farmer": "Farmer",
    "Student": "Student",
    "Age Requirement Met": "Age Requirement Met",
    "Gender requirement met": "Gender requirement met",
    "Resident of": "Resident of",
    "Income": "Income",
    "Male": "Male",
    "Female": "Female",
    "All": "All",`,
  hi: `    "Central Scheme open across India": "पूरे भारत में केंद्रीय योजना खुली है",
    "Occupation matches": "पेशा मेल खाता है",
    "Farmer": "किसान",
    "Student": "छात्र",
    "Age Requirement Met": "आयु सीमा पूरी हुई",
    "Gender requirement met": "लिंग की आवश्यकता पूरी हुई",
    "Resident of": "निवासी",
    "Income": "आय",
    "Male": "पुरुष",
    "Female": "महिला",
    "All": "सभी",`,
  ta: `    "Central Scheme open across India": "இந்தியா முழுவதும் திறக்கப்பட்ட மத்திய திட்டம்",
    "Occupation matches": "தொழில் பொருந்துகிறது",
    "Farmer": "விவசாயி",
    "Student": "மாணவர்",
    "Age Requirement Met": "வயது வரம்பு பொருந்துகிறது",
    "Gender requirement met": "பாலினம் பொருந்துகிறது",
    "Resident of": "குடியிருப்பு",
    "Income": "வருமானம்",
    "Male": "ஆண்",
    "Female": "பெண்",
    "All": "அனைவரும்",`,
  te: `    "Central Scheme open across India": "భారతదేశమంతటా కేంద్ర పథకం",
    "Occupation matches": "వృత్తి సరిపోలుతుంది",
    "Farmer": "రైతు",
    "Student": "విద్యార్థి",
    "Age Requirement Met": "వయస్సు అర్హత",
    "Gender requirement met": "లింగ అర్హత",
    "Resident of": "నివాసి",
    "Income": "ఆదాయం",
    "Male": "పురుషుడు",
    "Female": "స్త్రీ",
    "All": "అందరూ",`,
  kn: `    "Central Scheme open across India": "ಭಾರತದಾದ್ಯಂತ ಕೇಂದ್ರ ಯೋಜನೆ",
    "Occupation matches": "ವೃತ್ತಿ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ",
    "Farmer": "ರೈತ",
    "Student": "ವಿದ್ಯಾರ್ಥಿ",
    "Age Requirement Met": "ವಯಸ್ಸಿನ ಅರ್ಹತೆ",
    "Gender requirement met": "ಲಿಂಗ ಅರ್ಹತೆ",
    "Resident of": "ನಿವಾಸಿ",
    "Income": "ಆದಾಯ",
    "Male": "ಪುರುಷ",
    "Female": "ಮಹಿಳೆ",
    "All": "ಎಲ್ಲರೂ",`,
  ml: `    "Central Scheme open across India": "ഇന്ത്യയിലുടനീളം കേന്ദ്ര പദ്ധതി",
    "Occupation matches": "തൊഴിൽ പൊരുത്തപ്പെടുന്നു",
    "Farmer": "കർഷകൻ",
    "Student": "വിദ്യാർത്ഥി",
    "Age Requirement Met": "പ്രായപരിധി",
    "Gender requirement met": "ലിംഗ അർഹത",
    "Resident of": "താമസക്കാരൻ",
    "Income": "വരുമാനം",
    "Male": "പുരുഷൻ",
    "Female": "സ്ത്രീ",
    "All": "എല്ലാവരും",`
};

for (const lang of ['en', 'hi', 'ta', 'te', 'kn', 'ml']) {
  const marker = new RegExp(`(\\b${lang}: \\{[\\s\\S]*?incomeFilter5L:[^\\n]+\\n)`);
  content = content.replace(marker, `$1${additions[lang]}\n`);
}

fs.writeFileSync('src/data/translations.ts', content);
