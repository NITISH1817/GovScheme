const fs = require('fs');

const mr = JSON.parse(fs.readFileSync('./public/locales/mr/translation.json', 'utf8'));
const gu = JSON.parse(fs.readFileSync('./public/locales/gu/translation.json', 'utf8'));

const batch3 = {
  notificationDesc: { mr: "योजना मंजुरी आणि आवश्यक कृतींवर थेट अद्यतने मिळवा.", gu: "યોજના મંજૂરી અને જરૂરી પગલાં પર રીઅલ-ટાઇમ અપડેટ્સ મેળવો." },
  searchByVoice: { mr: "व्हॉइसद्वारे शोधा", gu: "વોઇસ દ્વારા શોધો" },
  ekycDeadline: { mr: "ई-केवायसी अंतिम मुदत ५ दिवसांत", gu: "e-KYC સમયમર્યાદા ૫ દિવસમાં" },
  completeNow: { mr: "आता पूर्ण करा", gu: "હમણાં પૂર્ણ કરો" },
  browseByCategory: { mr: "वर्गानुसार ब्राउझ करा", gu: "શ્રેણી મુજબ બ્રાઉઝ કરો" },
  lifeEventMode: { mr: "जीवन प्रसंग मोड", gu: "જીવન પ્રસંગ મોડ" },
  whatCanIGet: { mr: "\"मला काय मिळू शकते?\"", gu: "\"મને શું મળી શકે?\"" },
  aiGreeting: {
    mr: "नमस्कार नागरिक. मी तुमचा अधिकृत AI योजना सहाय्यक आहे. तुमच्या प्रोफाइलवर आधारित, मी तुम्हाला कल्याणकारी योजना शोधण्यात, पात्रता तपासण्यात आणि अधिकृत अर्जासाठी मदत करू शकतो. मी आज तुम्हाला कशी मदत करू?",
    gu: "નમસ્તે નાગરિક. હું તમારો અધિકૃત AI યોજના સહાયક છું. તમારી પ્રોફાઇલના આધારે, હું તમને કલ્યાણકારી યોજનાઓ શોધવામાં, પાત્રતા તપાસવામાં અને સત્તાવાર અરજી માટે મદદ કરી શકું છું. હું આજે તમને કેવી રીતે મદદ કરી શકું?"
  },
  qRelevantToStudents: { mr: "विद्यार्थ्यांसाठी कोणत्या योजना उपयुक्त आहेत?", gu: "વિદ્યાર્થીઓ માટે કઈ યોજનાઓ સુસંગત છે?" },
  qSchemesForFarmers: { mr: "शेतकरी कोणत्या योजनांसाठी अर्ज करू शकतात?", gu: "ખેડૂતો કઈ યોજનાઓ માટે અરજી કરી શકે છે?" },
  qWhyRecommended: { mr: "योजना का सुचवली गेली?", gu: "યોજનાની ભલામણ કેમ કરવામાં આવી?" },
  qWhatDocs: { mr: "मला कोणती कागदपत्रे लागतील?", gu: "મને કયા દસ્તાવેજોની જરૂર પડશે?" }
};

for (const [k, v] of Object.entries(batch3)) {
  mr[k] = v.mr;
  gu[k] = v.gu;
}

fs.writeFileSync('./public/locales/mr/translation.json', JSON.stringify(mr, null, 2), 'utf8');
fs.writeFileSync('./public/locales/gu/translation.json', JSON.stringify(gu, null, 2), 'utf8');

console.log('Batch 3 applied successfully!');
