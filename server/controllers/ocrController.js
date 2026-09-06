export const processOCR = async (req, res) => {
  try {
    const { docType, imageUrl } = req.body;
    
    // In a real production system, we would:
    // 1. Download the image from Cloudinary (imageUrl)
    // 2. Pass it to a Cloud Vision API or tesseract.js
    // 3. Extract the text and enhance the image
    // 4. Calculate a confidence score
    
    // Since this is a demo environment, we'll mock the extraction process 
    // with realistic data based on docType
    
    let extracted = { verified: true };
    let confidenceScore = 95;
    let docNumber = '';

    if (docType === 'Aadhaar') {
      extracted.fullName = req.user.fullName || 'Ramesh Kumar';
      extracted.state = req.user.profile?.state || 'Tamil Nadu';
      docNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString().match(/.{1,4}/g).join(' ');
    } else if (docType === 'PAN') {
      extracted.fullName = req.user.fullName || 'Ramesh Kumar';
      docNumber = 'ABCDE1234F';
      confidenceScore = 98;
    } else if (docType === 'Income Certificate') {
      extracted.fullName = req.user.fullName || 'Ramesh Kumar';
      extracted.annualIncome = 120000;
      docNumber = 'INC/2026/982341';
    } else {
      docNumber = 'DOC-' + Date.now();
      confidenceScore = 85;
    }

    // Simulate delay for OCR processing
    setTimeout(() => {
      res.json({
        success: true,
        docType: docType || 'Aadhaar',
        docNumber,
        confidenceScore,
        extracted
      });
    }, 1500);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
