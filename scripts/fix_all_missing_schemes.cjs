const fs = require('fs');

const taPath = 'public/locales/ta/translation.json';
const taJSON = JSON.parse(fs.readFileSync(taPath, 'utf8'));

const newKeys = {
  "pm-ujjwala_name": "பிரதான் மந்திரி உஜ்வாலா யோஜனா 2.0 (PMUY)",
  "pm-ujjwala_desc": "குறைந்த வருமானம் கொண்ட ஊரகப் பெண்களுக்கு இலவச எரிவாயு இணைப்பு மற்றும் அடுப்பு.",
  "sukanya-samriddhi_name": "சுகன்யா சம்ரித்தி யோஜனா (SSY)",
  "sukanya-samriddhi_desc": "பெண் குழந்தைகளின் உயர்கல்வி மற்றும் திருமணத்திற்கான அதிக வட்டி தரும் அரசு சேமிப்புத் திட்டம்.",
  "nsap-old-age-pension_name": "இந்திரா காந்தி தேசிய முதியோர் ஓய்வூதியத் திட்டம் (IGNOAPS)",
  "nsap-old-age-pension_desc": "வறுமைக் கோட்டிற்கு கீழ் உள்ள 60 வயதுக்கு மேற்பட்ட முதியோர்களுக்கு மாதாந்திர ஓய்வூதியம்.",
  "pm-vishwakarma_name": "பி.எம் விஸ்வகர்மா திட்டம்",
  "pm-vishwakarma_desc": "பாரம்பரிய கைவினைஞர்களுக்கு பயிற்சி மற்றும் ₹3 லட்சம் வரை பிணையமற்ற கடன்.",
  "pm-mudra_name": "பிரதான் மந்திரி முத்ரா யோஜனா (PMMY)",
  "pm-mudra_desc": "சிறு தொழில் மற்றும் வியாபாரிகளுக்கு ₹10 லட்சம் வரை பிணையமற்ற கடன்.",
  "pm-svanidhi_name": "பி.எம் ஸ்வநிதி (PM SVANidhi)",
  "pm-svanidhi_desc": "தெருவோர வியாபாரிகளுக்கு மலிவான வட்டி விகிதத்தில் பிணையமற்ற மூலதன கடன்.",
  "mgnrega_name": "மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதி சட்டம் (MGNREGA)",
  "mgnrega_desc": "ஊரகக் குடும்பங்களுக்கு ஒரு நிதியாண்டில் 100 நாட்கள் வேலை உத்தரவாதம்.",
  "post-matric-scholarship_name": "பிற்படுத்தப்பட்டோர்/பட்டியலின மாணவர்களுக்கான கல்வி உதவித்தொகை",
  "post-matric-scholarship_desc": "உயர்கல்வி படிக்கும் SC, ST மற்றும் OBC மாணவர்களுக்கான நிதியுதவி.",
  "tn-pudhumai-penn_name": "புதுமைப் பெண் திட்டம் (தமிழ்நாடு)",
  "tn-pudhumai-penn_desc": "அரசுப் பள்ளிகளில் பயின்று உயர்கல்வி சேரும் மாணவிகளுக்கு மாதம் ₹1,000 நிதியுதவி.",
  "up-kanya-sumangala_name": "கன்னியா சுமங்கலா யோஜனா (உத்தரப் பிரதேசம்)",
  "up-kanya-sumangala_desc": "பெண் குழந்தைகளின் கல்விக்காக கட்டம் கட்டமாக ₹25,000 நிதியுதவி.",
  "telangana-rythu-bandhu_name": "ரயத்து பந்து திட்டம் (தெலுங்கானா)",
  "telangana-rythu-bandhu_desc": "விவசாயிகளுக்கு பயிர் சாகுபடிக்கு ஆண்டுக்கு ஏக்கருக்கு ₹10,000 நிதியுதவி.",
  "karnataka-gruha-lakshmi_name": "கிருஹ லட்சுமி திட்டம் (கர்நாடகா)",
  "karnataka-gruha-lakshmi_desc": "குடும்பத் தலைவிகளுக்கு மாதம் ₹2,000 நிதியுதவி.",
  "igndps-disability-pension_name": "இந்திரா காந்தி தேசிய மாற்றுத்திறனாளிகள் ஓய்வூதியத் திட்டம்",
  "igndps-disability-pension_desc": "80% க்கும் மேல் குறைபாடுள்ள மாற்றுத்திறனாளிகளுக்கு மாதாந்திர ஓய்வூதியம்.",
  "atal-pension-yojana_name": "அடல் பென்ஷன் யோஜனா (APY)",
  "atal-pension-yojana_desc": "அமைப்புசாரா தொழிலாளர்களுக்கு 60 வயதிற்குப் பிறகு நிலையான மாதாந்திர ஓய்வூதியம்.",
  "pm-jan-dhan_name": "பிரதான் மந்திரி ஜன் தன் யோஜனா (PMJDY)",
  "pm-jan-dhan_desc": "அனைவருக்கும் இலவச வங்கி கணக்கு, காப்பீடு மற்றும் கடன் வசதி.",
  "startup-india-seed-fund_name": "ஸ்டார்ட்அப் இந்தியா விதை நிதி திட்டம் (SISFS)",
  "startup-india-seed-fund_desc": "புதிய தொழில்முனைவோருக்கு ₹20 லட்சம் முதல் ₹50 லட்சம் வரை நிதியுதவி.",
  "pm-garib-kalyan-anna_name": "பிரதான் மந்திரி கரிப் கல்யாண் அன்ன யோஜனா (PMGKAY)",
  "pm-garib-kalyan-anna_desc": "81 கோடிக்கும் அதிகமான ஏழை குடும்பங்களுக்கு மாதம் 5 கிலோ இலவச ரேஷன் வழங்கும் திட்டம்.",
  "udid-disability-scheme_name": "தனித்துவமான அடையாள அட்டை (UDID)",
  "udid-disability-scheme_desc": "மாற்றுத்திறனாளிகளுக்கான தேசிய அளவிலான அடையாள அட்டை மற்றும் தரவுத்தளம்."
};

Object.assign(taJSON, newKeys);
fs.writeFileSync(taPath, JSON.stringify(taJSON, null, 2), 'utf8');

console.log("Remaining schemes injected successfully.");
