import React, { useEffect, useState } from 'react';
import { pulseApi } from '../utils/api';
import { Card, SectionHeader, Toast } from '../components/common/UI';
import { Zap, RefreshCw, AlertTriangle } from 'lucide-react';

export default function PulsePage() {
  const [signals, setSignals] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = () => {
    return Promise.all([pulseApi.signals(), pulseApi.earlyWarnings()])
      .then(([s, w]) => { setSignals(s.data); setWarnings(w.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      await pulseApi.trigger();
      await fetchData();
      setToast({ msg: 'Community Pulse scan complete — new signals detected', type: 'success' });
    } finally {
      setScanning(false);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const diff = Math.round((Date.now() - d) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.round(diff / 60)}h ago`;
  };

  const scoreColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 50) return 'text-orange-500';
    return 'text-gray-500';
  };

  const scoreBarColor = (score) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-400';
    return 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <SectionHeader
        title="Community Pulse"
        sub="Automated early warning detection from public signals"
        action={
          <button onClick={handleScan} disabled={scanning}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Scanning...' : 'Run Scan'}
          </button>
        }
      />

      {/* How it works */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-teal-600" />
          </div>
          <div>
            <div className="text-gray-900 font-semibold mb-1">How Community Pulse Works</div>
            <div className="text-gray-500 text-sm leading-relaxed">
              Runs automatically every 6 hours. Scans public grievance portals, NDMA RSS feeds, and social media signals.
              Computes an Early Warning Score per zone: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-teal-700 text-xs font-mono">signal_count × recency_weight × severity_baseline</code>.
              Draft needs are created and sent to the NGO Review Queue — a human must approve before any allocation fires.
            </div>
          </div>
        </div>
      </Card>

      {/* Early Warnings */}
      {warnings.length > 0 && (
        <Card className="p-5">
          <h2 className="text-gray-900 font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            Active Early Warnings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {warnings.map((w, i) => (
              <div key={i} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-red-700 font-bold text-2xl mb-0.5">{w.score}<span className="text-sm font-normal text-red-400">/100</span></div>
                <div className="text-red-800 font-semibold text-sm">{w.zone}</div>
                <div className="text-red-500 text-xs capitalize mt-0.5">{w.category} emergency</div>
                <div className="bg-red-100 rounded-full h-1.5 mt-3">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${w.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Signal feed */}
      <Card className="p-5">
        <h2 className="text-gray-900 font-semibold mb-4">Live Signal Feed</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📡</div>
            <div className="text-gray-500 text-sm">No signals detected yet. Run a scan to start.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {signals.map(sig => (
              <div key={sig.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all
                ${sig.threshold_crossed
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}
              >
                <div className="shrink-0 mt-0.5 text-xl">
                  {sig.threshold_crossed ? '🚨' : '📡'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-gray-900 font-semibold text-sm">{sig.zone}</span>
                    <span className="text-xs bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full capitalize font-medium">
                      {sig.category}
                    </span>
                    <span className="text-gray-400 text-xs capitalize">{sig.source_type?.replace(/_/g, ' ')}</span>
                    {sig.threshold_crossed && (
                      <span className="text-xs bg-red-50 border border-red-200 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                        ⚠️ Threshold Crossed — Draft Need Created
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600 text-sm">{sig.description}</div>
                  <div className="text-gray-400 text-xs mt-1">{formatTime(sig.detected_at)}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`text-xl font-bold ${scoreColor(sig.warning_score)}`}>
                    {sig.warning_score}
                  </div>
                  <div className="text-gray-400 text-xs">score</div>
                  <div className="bg-gray-200 rounded-full h-1 w-16 mt-1.5">
                    <div className={`h-full rounded-full ${scoreBarColor(sig.warning_score)}`}
                      style={{ width: `${sig.warning_score}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
