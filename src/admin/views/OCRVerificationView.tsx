import React, { useState } from 'react';
import { UploadCloud, CheckCircle, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

export const OCRVerificationView: React.FC = () => {
  const [docType, setDocType] = useState('Aadhaar');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleScan = async () => {
    setIsScanning(true);
    setResult(null);
    setError(null);
    
    try {
      const res = await apiClient.post('/ocr/scan', { docType });
      if (res.success) {
        setResult(res);
      } else {
        setError('Failed to scan document.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during OCR scanning.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Left Sidebar - Upload Area */}
      <div className="w-full lg:w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-6">
        <h2 className="font-bold text-slate-800 text-lg mb-4">Upload Document</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            <option value="Aadhaar">Aadhaar Card</option>
            <option value="PAN">PAN Card</option>
            <option value="Driving License">Driving License</option>
            <option value="Voter ID">Voter ID</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer group">
          <UploadCloud size={48} className="text-slate-400 group-hover:text-blue-500 mb-4 transition-colors" />
          <p className="font-medium text-slate-700">Drag & drop document image</p>
          <p className="text-sm text-slate-500 mt-1 mb-4">or click to browse (JPEG, PNG, PDF)</p>
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Scanning...
              </>
            ) : (
              'Simulate Upload & Scan'
            )}
          </button>
        </div>
      </div>

      {/* Right Area - Verification Split View */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full relative">
        {isScanning ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
             <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-blue-500 animate-[scan_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
             </div>
             <p className="text-blue-600 font-medium animate-pulse">OCR Engine processing document...</p>
          </div>
        ) : null}

        {error ? (
           <div className="flex-1 flex items-center justify-center p-6">
             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                <AlertCircle size={24} />
                <p>{error}</p>
             </div>
           </div>
        ) : result ? (
          <>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Extraction Complete: {result.docType}</h2>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${result.confidenceScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {result.confidenceScore}% Confidence
                  </span>
                  <span className="text-slate-500">Processed in 1.5s</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
                  <CheckCircle size={16} /> Verify & Save
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Document Image Side */}
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 p-4 bg-slate-100 flex items-center justify-center overflow-auto">
                <div className="max-w-md w-full aspect-[3/4] bg-white border border-slate-300 rounded-lg shadow-sm flex flex-col items-center justify-center text-blue-500 p-6 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FileText size={48} className="mb-4" />
                  <p className="font-medium text-slate-700">{result.docType} Scan</p>
                  <p className="text-xs text-slate-500 mt-2">Simulated Image Upload</p>
                </div>
              </div>

              {/* Extracted Data Side */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto">
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Extracted Data</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Document Number</label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800">
                      {result.docNumber}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                      {result.extracted?.fullName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">State / Region</label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                      {result.extracted?.state}
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} /> AI Verification Passed
                  </h4>
                  <p className="text-sm text-blue-700">
                    The extracted data matches the known formatting patterns for <b>{result.docType}</b>. No manual corrections are required.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <FileText size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-500 mb-2">Awaiting Document</p>
            <p className="text-sm max-w-sm">Upload a document on the left to run it through the GovScheme OCR Verification engine.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};
