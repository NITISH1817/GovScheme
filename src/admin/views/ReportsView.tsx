import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, 
  FileSpreadsheet, Table, AlertCircle
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function ReportsView() {
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/reports', { period });
        if (res.success) {
          setReportData(res.report);
        }
      } catch (error) {
        console.error('Failed to fetch report', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [period]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Metric', 'Value'];
    const rows = reportData.map(d => [d.id, d.date, d.metric, d.value]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    downloadFile(csvContent, `report-${period}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportExcel = () => {
    // Basic fallback: exporting CSV with an Excel-compatible name
    const headers = ['ID', 'Date', 'Metric', 'Value'];
    const rows = reportData.map(d => [d.id, d.date, d.metric, d.value]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    downloadFile(csvContent, `report-${period}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportPDF = () => {
    window.print();
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Generate Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Download comprehensive platform analytics and logs.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center print:hidden">
        <div className="flex items-center gap-2">
          <Calendar className="text-slate-400" size={18} />
          <span className="text-sm font-medium text-slate-700">Report Period:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg ml-2">
            {(['daily', 'weekly', 'monthly', 'yearly'] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isGenerating || loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <FileText size={16} className="text-red-500" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isGenerating || loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet size={16} className="text-emerald-500" />
            Excel
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isGenerating || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50"
          >
            <Download size={16} />
            {isGenerating ? 'Generating...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <Table size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Report Preview ({period} data)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Metric</th>
                <th className="px-6 py-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading data...</td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 flex flex-col items-center">
                    <AlertCircle className="mb-2 opacity-50" size={24} />
                    No data found for this period.
                  </td>
                </tr>
              ) : reportData.map((row) => (
                <motion.tr 
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-3 text-slate-500">#{row.id}</td>
                  <td className="px-6 py-3 text-slate-700">{row.date}</td>
                  <td className="px-6 py-3 text-slate-800 font-medium">{row.metric}</td>
                  <td className="px-6 py-3 text-slate-700">{row.value.toLocaleString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
