import React, { useState } from 'react';
import { simulationApi } from '../utils/api';
import { Card, SectionHeader, UrgencyBadge } from '../components/common/UI';
import { FlaskConical, Play, ChevronRight } from 'lucide-react';

const SCENARIOS = [
  { name: 'Flash Flood — Urban District', disaster_type: 'disaster', affected_count: 500, ngos_active: 2, volunteers_available: 20, severity: 10, time_sensitivity: 10, lat: 28.7041, lng: 77.1025 },
  { name: 'Food Shortage — Rural Ward', disaster_type: 'food', affected_count: 200, ngos_active: 1, volunteers_available: 8, severity: 8, time_sensitivity: 8, lat: 28.6280, lng: 77.2190 },
  { name: 'Medical Camp — Underserved Colony', disaster_type: 'health', affected_count: 150, ngos_active: 1, volunteers_available: 15, severity: 7, time_sensitivity: 7, lat: 28.5921, lng: 77.1998 },
];

const TYPE_ICON = { volunteer: '👤', donation: '📦', service: '🏢' };
const TYPE_STYLES = {
  volunteer: 'bg-blue-50 border-blue-200 text-blue-700',
  donation:  'bg-amber-50 border-amber-200 text-amber-700',
  service:   'bg-purple-50 border-purple-200 text-purple-700',
};

export default function SimulationPage() {
  const [params, setParams] = useState({ disaster_type: 'disaster', affected_count: 500, ngos_active: 2, volunteers_available: 20, severity: 8, time_sensitivity: 8, lat: 28.6139, lng: 77.2090 });
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  const set = (k, v) => setParams(p => ({ ...p, [k]: v }));

  const loadScenario = (sc) => {
    setParams({ ...sc });
    setActiveScenario(sc.name);
    setResult(null);
  };

  const runSim = async () => {
    setRunning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1200));
    try {
      const { data } = await simulationApi.run(params);
      setResult(data);
    } finally {
      setRunning(false);
    }
  };

  const urgencyColor = (score) => {
    if (score >= 85) return 'text-red-600';
    if (score >= 65) return 'text-orange-500';
    return 'text-yellow-600';
  };

  const urgencyLevelColor = (level) => {
    if (level === 'CRITICAL') return 'bg-red-50 text-red-700 border-red-200';
    if (level === 'HIGH') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Simulation Mode" sub="Model any scenario and watch the allocation engine respond in real time" />

      {/* Scenario presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {SCENARIOS.map(sc => (
          <button key={sc.name} onClick={() => loadScenario(sc)}
            className={`p-4 rounded-2xl border text-left transition-all shadow-sm
              ${activeScenario === sc.name
                ? 'bg-violet-50 border-violet-300 ring-2 ring-violet-200'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
          >
            <div className="text-2xl mb-2">{sc.disaster_type === 'disaster' ? '🌊' : sc.disaster_type === 'food' ? '🍚' : '🏥'}</div>
            <div className="text-gray-900 font-semibold text-sm">{sc.name}</div>
            <div className="text-gray-400 text-xs mt-1">{sc.affected_count} affected · {sc.volunteers_available} volunteers · {sc.ngos_active} NGOs</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config panel */}
        <Card className="p-6">
          <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2">
            <span className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
              <FlaskConical size={15} className="text-violet-600" />
            </span>
            Scenario Parameters
          </h2>

          <div className="space-y-5">
            <div>
              <label className="text-gray-600 text-sm font-medium block mb-2">Disaster Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['food','health','education','disaster','elderly','environment','infrastructure'].map(t => (
                  <button key={t} type="button" onClick={() => set('disaster_type', t)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all capitalize
                      ${params.disaster_type === t
                        ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-600 text-sm font-medium block mb-2">
                Affected Count: <span className="text-gray-900 font-bold">{params.affected_count}</span>
              </label>
              <input type="range" min="50" max="2000" value={params.affected_count} onChange={e => set('affected_count', parseInt(e.target.value))}
                className="w-full accent-violet-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>50</span><span>2,000</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 text-sm font-medium block mb-2">
                  Severity: <span className="text-red-600 font-bold">{params.severity}/10</span>
                </label>
                <input type="range" min="1" max="10" value={params.severity} onChange={e => set('severity', parseInt(e.target.value))}
                  className="w-full accent-red-500" />
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium block mb-2">
                  Time Sensitivity: <span className="text-orange-500 font-bold">{params.time_sensitivity}/10</span>
                </label>
                <input type="range" min="1" max="10" value={params.time_sensitivity} onChange={e => set('time_sensitivity', parseInt(e.target.value))}
                  className="w-full accent-orange-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 text-sm font-medium block mb-2">
                  Active NGOs: <span className="text-blue-600 font-bold">{params.ngos_active}</span>
                </label>
                <input type="range" min="1" max="5" value={params.ngos_active} onChange={e => set('ngos_active', parseInt(e.target.value))}
                  className="w-full accent-blue-500" />
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium block mb-2">
                  Volunteers: <span className="text-teal-600 font-bold">{params.volunteers_available}</span>
                </label>
                <input type="range" min="5" max="50" value={params.volunteers_available} onChange={e => set('volunteers_available', parseInt(e.target.value))}
                  className="w-full accent-teal-500" />
              </div>
            </div>

            <button onClick={runSim} disabled={running}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm">
              {running ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Running Simulation...</>
              ) : (
                <><Play size={16} /> Run Simulation</>
              )}
            </button>
          </div>
        </Card>

        {/* Results panel */}
        <div className="space-y-4">
          {!result && !running && (
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">🎮</div>
              <div className="text-gray-800 font-semibold">Ready to Simulate</div>
              <div className="text-gray-400 text-sm mt-1">Configure parameters and click Run Simulation</div>
            </Card>
          )}

          {running && (
            <Card className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mb-4" />
              <div className="text-gray-900 font-semibold">Computing Urgency Score...</div>
              <div className="text-gray-400 text-sm mt-1">Assembling resource chain...</div>
            </Card>
          )}

          {result && (
            <>
              {/* Urgency + summary */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Computed Urgency Score</div>
                    <div className={`text-5xl font-extrabold ${urgencyColor(result.urgency_score)}`}>
                      {result.urgency_score}<span className="text-xl text-gray-300 font-normal">/100</span>
                    </div>
                    <span className={`inline-flex items-center text-xs font-bold mt-2 px-3 py-1 rounded-full border ${urgencyLevelColor(result.urgency_level)}`}>
                      {result.urgency_level}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-gray-400 text-xs">Projected Impact</div>
                    <div className="text-gray-900 font-bold text-2xl">{result.projected_people_helped?.toLocaleString()}</div>
                    <div className="text-gray-400 text-xs">people helped</div>
                    <div className="text-gray-500 text-xs mt-1">Est. {result.estimated_resolution_hrs}h to resolve</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 pt-4 border-t border-gray-100">
                  <div className="text-center p-2 bg-blue-50 rounded-xl">
                    <div className="text-blue-700 font-bold text-lg">{result.ngos_required}</div>
                    <div className="text-blue-400 text-xs">NGOs needed</div>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-xl">
                    <div className="text-emerald-700 font-bold text-lg">{result.volunteers_needed}</div>
                    <div className="text-emerald-400 text-xs">Volunteers</div>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded-xl">
                    <div className="text-amber-700 font-bold text-lg">{result.donations_needed}</div>
                    <div className="text-amber-400 text-xs">Donation streams</div>
                  </div>
                </div>
              </Card>

              {/* Resource chain */}
              <Card className="p-5">
                <h3 className="text-gray-900 font-semibold mb-4">Generated Resource Chain</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  {result.resource_chain?.map((node, i) => (
                    <React.Fragment key={i}>
                      <div className={`p-3 rounded-xl border text-xs min-w-28 flex-1 ${TYPE_STYLES[node.type] || 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                        <div className="text-lg mb-1">{TYPE_ICON[node.type]}</div>
                        <div className="font-semibold">{node.label}</div>
                        <div className="capitalize opacity-70">{node.type}</div>
                      </div>
                      {i < result.resource_chain.length - 1 && <ChevronRight size={14} className="text-gray-300 shrink-0" />}
                    </React.Fragment>
                  ))}
                </div>
              </Card>

              {/* Volunteer matches */}
              {result.volunteer_matches?.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-gray-900 font-semibold mb-4">Best Volunteer Matches</h3>
                  <div className="space-y-2">
                    {result.volunteer_matches.map((m, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-gray-900 font-semibold text-sm">{m.volunteer}</div>
                            <div className="text-gray-400 text-xs">{m.node}</div>
                          </div>
                          <div className="text-emerald-600 font-bold">{m.score}/10</div>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {Object.entries(m.breakdown || {}).filter(([k]) => k !== 'distance_km').map(([k, v]) => (
                            <div key={k} className="text-center">
                              <div className="text-gray-900 text-xs font-bold">{v}</div>
                              <div className="text-gray-400 text-xs capitalize">{k.replace(/_/g, ' ')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
