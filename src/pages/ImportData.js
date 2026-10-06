import React, { useState } from 'react';
import { importApi } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Card, SectionHeader, Toast } from '../components/common/UI';
import { Upload, FileText, Table, CheckCircle, FolderOpen } from 'lucide-react';

function DropZone({ accept, label, icon, onFile, file }) {
  const ref = React.useRef();
  return (
    <div
      onClick={() => ref.current.click()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
        ${file
          ? 'border-emerald-400 bg-emerald-50'
          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 bg-gray-50'
        }`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => onFile(e.target.files[0])} />
      <div className="text-4xl mb-3">{icon}</div>
      {file
        ? <div className="text-emerald-700 font-semibold text-sm flex items-center justify-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            {file.name}
          </div>
        : <div>
            <div className="text-gray-600 text-sm font-medium">{label}</div>
            <div className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1">
              <FolderOpen size={12} /> Click to browse files
            </div>
          </div>
      }
    </div>
  );
}

export default function ImportData() {
  const { user } = useAuth();
  const [tab, setTab] = useState('csv');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const ngoId = user?.ngo_id || '';

  const handlePreview = async () => {
    if (!file || !ngoId) { setToast({ msg: 'Please select a file', type: 'error' }); return; }
    setLoading(true);
    try {
      let res;
      if (tab === 'csv') res = await importApi.csvPreview(file, ngoId);
      else res = await importApi.pdf(file, ngoId);
      setPreview(res.data);
    } catch (e) {
      setToast({ msg: `Preview failed: ${e.response?.data?.detail || e.message}`, type: 'error' });
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await importApi.csvConfirm(file, ngoId);
      setResult(res.data);
      setToast({ msg: `${res.data.created} needs added to review queue!`, type: 'success' });
      setPreview(null);
      setFile(null);
    } catch (e) {
      setToast({ msg: 'Import failed', type: 'error' });
    }
    setLoading(false);
  };

  const TABS = [
    { id: 'csv',   label: 'CSV / Sheets', icon: <Table size={14} /> },
    { id: 'pdf',   label: 'PDF Report',   icon: <FileText size={14} /> },
    { id: 'excel', label: 'Excel',         icon: <Table size={14} /> },
  ];

  const infoText = {
    csv:   { title: 'Column Auto-Detection', body: 'ImpactSphere automatically detects columns containing: description, location, affected count, severity. NLP classifier will infer categories from description text where missing.' },
    pdf:   { title: 'PDF Extraction', body: 'Text is extracted section by section. Low-confidence extractions (below 60%) are flagged for manual review before entering the queue.' },
    excel: { title: 'Excel Support', body: 'Supports .xlsx and .xls. Auto-detects common NGO column patterns. Same workflow as CSV.' },
  };

  return (
    <div className="max-w-3xl space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <SectionHeader title="Import Data" sub="Upload needs from CSV, PDF reports, or Excel files. Preview before confirming." />

      {result && (
        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-emerald-800 font-semibold">Import Successful</div>
            <div className="text-emerald-600 text-sm">{result.created} needs added to the NGO Review Queue for approval.</div>
          </div>
        </div>
      )}

      <Card className="p-6">
        {/* File type tabs */}
        <div className="flex gap-1.5 mb-6 bg-gray-50 border border-gray-200 p-1 rounded-xl">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setFile(null); setPreview(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === t.id
                  ? 'bg-white shadow-sm text-gray-900 border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
                }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <DropZone
          accept={tab === 'csv' ? '.csv' : tab === 'pdf' ? '.pdf' : '.xlsx,.xls'}
          label={tab === 'csv' ? 'Drop a CSV file here' : tab === 'pdf' ? 'Drop a PDF field report here' : 'Drop an Excel file here'}
          icon={tab === 'csv' ? '📊' : tab === 'pdf' ? '📄' : '📈'}
          onFile={setFile}
          file={file}
        />

        {/* Info box */}
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="text-blue-800 text-sm font-semibold mb-1">{infoText[tab].title}</div>
          <div className="text-blue-600 text-xs leading-relaxed">{infoText[tab].body}</div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={handlePreview} disabled={!file || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Upload size={14} />
            {loading && !preview ? 'Analyzing...' : 'Preview Import'}
          </button>
          {preview && tab === 'csv' && (
            <button onClick={handleConfirm} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors shadow-sm">
              <CheckCircle size={14} />
              {loading ? 'Importing...' : `Confirm Import (${preview.total_rows} rows)`}
            </button>
          )}
        </div>
      </Card>

      {/* Preview table */}
      {preview && (
        <Card className="p-6">
          <h3 className="text-gray-900 font-semibold mb-4">
            Preview — <span className="text-emerald-600">{preview.total_rows || preview.extracted?.length || 0} records detected</span>
          </h3>
          {preview.preview && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">Description</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">Category</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">Confidence</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">Affected</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-700 max-w-xs truncate">{row.description}</td>
                      <td className="py-3 pr-4 text-gray-600 capitalize font-medium">{row.category}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                          row.confidence < 0.6
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {(row.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{row.affected_count}</td>
                      <td className="py-3">
                        <span className={`text-sm font-bold ${
                          row.urgency_score >= 80 ? 'text-red-600'
                          : row.urgency_score >= 60 ? 'text-orange-500'
                          : 'text-yellow-600'
                        }`}>
                          {row.urgency_score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {preview.extracted && (
            <div className="space-y-2">
              {preview.extracted.map((item, i) => (
                <div key={i} className={`p-3.5 rounded-xl border text-sm transition-colors ${
                  item.flag_review
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-100 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-800 capitalize font-semibold">{item.category}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      item.confidence < 0.6
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {(item.confidence * 100).toFixed(0)}% confidence
                    </span>
                    {item.flag_review && <span className="text-yellow-600 text-xs font-medium">⚠️ Manual review needed</span>}
                  </div>
                  <div className="text-gray-500 text-xs">{item.text}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
