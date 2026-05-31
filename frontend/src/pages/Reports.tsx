import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Table, FileSpreadsheet, Download, RefreshCw, CheckCircle2, History, AlertCircle } from 'lucide-react';

interface ReportLog {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  file_path: string;
  created_at: string;
}

const Reports: React.FC = () => {
  const [history, setHistory] = useState<ReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/reports/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGeneratePdf = async () => {
    setPdfLoading(true);
    setMsg('');
    setError('');
    try {
      const res = await api.post('/reports/generate/pdf');
      setMsg('PDF Report compiled successfully!');
      await fetchHistory();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError('Failed to generate PDF report.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    setMsg('');
    setError('');
    try {
      const res = await api.post('/reports/generate/excel');
      setMsg('Excel Spreadsheet generated successfully!');
      await fetchHistory();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError('Failed to generate Excel sheet.');
    } finally {
      setExcelLoading(false);
    }
  };

  const handleDownload = (id: number, filename: string) => {
    // Open standard file download directly in a new window or trigger download via iframe/blob
    const token = localStorage.getItem('token');
    const downloadUrl = `http://localhost:8000/api/reports/download/${id}?token=${token}`;
    
    // We can also fetch the file as a blob and download it to prevent CORS or Auth token parsing failures in window.open
    api({
      url: `/reports/download/${id}`,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      const href = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    }).catch(err => {
      console.error(err);
      alert('Could not download file.');
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="h-5 w-5 text-pink-500" />
          Financial Reports & Exports
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-semibold">Generate comprehensive summaries of monthly income, category splits, and full transaction listings.</p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 text-sm font-semibold flex items-center shadow-sm">
          <CheckCircle2 className="h-4.5 w-4.5 mr-2" />
          <span>{msg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-600 text-sm font-semibold flex items-center shadow-sm">
          <AlertCircle className="h-4.5 w-4.5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Triggers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Generator Card */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl flex flex-col justify-between h-56 hover:border-pink-200/80 transition-all duration-300 bg-white/80">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5 text-pink-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider">Monthly PDF Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">Includes budget summaries, total categories breakdowns, AI recommendations, and financial score diagnostics formatted in a clean layout.</p>
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={pdfLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-550 hover:from-pink-500 hover:to-pink-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {pdfLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : <Download className="h-4 w-4" />}
            Compile PDF Report
          </button>
        </div>

        {/* Excel Generator Card */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl flex flex-col justify-between h-56 hover:border-pink-200/80 transition-all duration-300 bg-white/80">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider">Transaction Logs spreadsheet</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">Generates a detailed spreadsheet with every expense log, confidence value, category tag, and date, formatted for Excel analysis.</p>
          </div>

          <button
            onClick={handleGenerateExcel}
            disabled={excelLoading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {excelLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : <Download className="h-4 w-4" />}
            Generate Excel Sheet
          </button>
        </div>
      </div>

      {/* History table */}
      <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl overflow-hidden bg-white/80 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 mb-6">
          <History className="h-4.5 w-4.5 text-pink-500" />
          <h2 className="text-base font-bold text-slate-850 uppercase tracking-wider">Generated Reports History</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-550 font-semibold">No reports generated yet. Compile one above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pink-100 text-slate-450 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Generated Date</th>
                  <th className="py-3 px-4">Report Type</th>
                  <th className="py-3 px-4">File Format</th>
                  <th className="py-3 px-4">Scope Period</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {history.map((h) => {
                  const isPdf = h.file_path.endsWith('.pdf');
                  const filename = h.file_path.split('\\').pop() || h.file_path.split('/').pop() || 'report';
                  
                  return (
                    <tr key={h.id} className="text-slate-655 text-sm hover:bg-pink-50/15 transition-all">
                      <td className="py-4 px-4 font-semibold text-slate-600">{new Date(h.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                      <td className="py-4 px-4 capitalize font-bold text-slate-800">{h.type} Summary</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${isPdf ? 'bg-rose-50 border border-rose-100 text-rose-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'}`}>
                          {isPdf ? 'PDF' : 'XLSX (Excel)'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-semibold">
                        {new Date(h.start_date).toLocaleDateString()} to {new Date(h.end_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDownload(h.id, filename)}
                          className="px-3.5 py-2 bg-pink-50 hover:bg-pink-100 border border-pink-200/50 text-pink-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
