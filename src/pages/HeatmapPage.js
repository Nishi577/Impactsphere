import React, { useEffect, useState, useRef } from 'react';
import { needsApi, interventionsApi } from '../utils/api';
import { UrgencyBadge, SourceBadge, CategoryBadge, StatusBadge, SectionHeader, Card } from '../components/common/UI';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Filter, Zap } from 'lucide-react';

const URGENCY_COLOR = (score) => {
  if (score >= 80) return '#ef4444';
  if (score >= 60) return '#f97316';
  if (score >= 40) return '#eab308';
  return '#22c55e';
};

const CATEGORIES = ['all', 'food', 'health', 'education', 'disaster', 'elderly', 'environment', 'infrastructure'];

function MapBounds({ features }) {
  const map = useMap();
  useEffect(() => {
    if (features.length > 0) {
      const bounds = features.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0]]);
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [features, map]);
  return null;
}

export default function HeatmapPage() {
  const [geojson, setGeojson] = useState({ features: [] });
  const [selected, setSelected] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrg, setFilterUrg] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    needsApi.heatmap().then(r => setGeojson(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = geojson.features.filter(f => {
    const p = f.properties;
    if (filterCat !== 'all' && p.category !== filterCat) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (p.urgency_score < filterUrg[0] || p.urgency_score > filterUrg[1]) return false;
    return true;
  });

  const handleSelectNeed = async (feature) => {
    setSelected(feature.properties);
    setIntervention(null);
    try {
      const { data } = await interventionsApi.byNeed(feature.properties.id);
      setIntervention(data);
    } catch {}
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionHeader title="Community Needs Heatmap" sub={`${filtered.length} needs displayed`} />
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm hover:border-gray-300 hover:shadow-sm transition-all">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-gray-500 text-xs font-medium block mb-1">Category</label>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs font-medium block mb-1">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-gray-500 text-xs font-medium block mb-1">Urgency Range: {filterUrg[0]} – {filterUrg[1]}</label>
              <input type="range" min="0" max="100" value={filterUrg[1]} onChange={e => setFilterUrg([filterUrg[0], parseInt(e.target.value)])}
                className="w-full accent-emerald-500" />
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <span className="text-gray-400 text-xs font-medium">Urgency:</span>
            {[['#ef4444','Critical (80+)'],['#f97316','High (60-79)'],['#eab308','Medium (40-59)'],['#22c55e','Low (<40)']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3 h-3 rounded-full" style={{ background: c }} />
                {l}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          {loading ? (
            <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
              <span className="text-gray-400">Loading map...</span>
            </div>
          ) : (
            <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
              />
              <MapBounds features={filtered} />
              {filtered.map((feature, i) => {
                const p = feature.properties;
                const [lng, lat] = feature.geometry.coordinates;
                return (
                  <CircleMarker
                    key={i}
                    center={[lat, lng]}
                    radius={Math.max(8, p.urgency_score / 10)}
                    pathOptions={{
                      fillColor: URGENCY_COLOR(p.urgency_score),
                      fillOpacity: 0.8,
                      color: URGENCY_COLOR(p.urgency_score),
                      weight: 2,
                      opacity: selected?.id === p.id ? 1 : 0.6
                    }}
                    eventHandlers={{ click: () => handleSelectNeed(feature) }}
                  >
                    <Popup>
                      <div className="p-1 min-w-48">
                        <div className="font-bold text-sm mb-1">{p.category?.toUpperCase()}</div>
                        <div className="text-xs mb-2">{p.description}</div>
                        <div className="text-xs">📍 {p.location_label}</div>
                        <div className="text-xs">👥 {p.affected_count} affected</div>
                        <div className="text-xs">Score: {p.urgency_score}/100</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 shrink-0 overflow-y-auto space-y-4">
            <Card className="p-5">
              <div className="flex items-start justify-between mb-3">
                <CategoryBadge category={selected.category} />
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-lg leading-none transition-colors">✕</button>
              </div>
              <p className="text-gray-900 text-sm font-semibold mb-3 leading-snug">{selected.description}</p>
              <div className="space-y-1.5 text-xs mb-4">
                <div className="text-gray-700 font-medium">📍 {selected.location_label}</div>
                <div className="text-gray-500">👥 {selected.affected_count} affected</div>
                <div className="flex gap-2 flex-wrap mt-2">
                  <SourceBadge source={selected.source} />
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <UrgencyBadge score={selected.urgency_score} />
            </Card>

            {intervention && (
              <Card className="p-5">
                <div className="text-gray-900 font-semibold text-sm mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-emerald-500" />
                  Resource Chain
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Completion</span>
                    <span className="text-gray-900 font-bold">{intervention.chain_completion_pct}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${intervention.chain_completion_pct}%` }} />
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  {intervention.chain_nodes?.map((node, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-xs border
                      ${node.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : node.status === 'assigned' ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      : node.status === 'failed' ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-gray-50 border-gray-100 text-gray-500'}`}
                    >
                      <span>{node.status === 'completed' ? '✅' : node.status === 'assigned' ? '⏳' : node.status === 'failed' ? '❌' : '⬜'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{node.requirement_label}</div>
                        {node.assigned_name && <div className="opacity-70">→ {node.assigned_name}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
