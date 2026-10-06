import React, { useEffect, useState } from 'react';
import { impactApi, volunteersApi } from '../utils/api';
import { StatCard, Card, SectionHeader, Skeleton } from '../components/common/UI';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'];
const BADGE_ICONS = { first_responder: '🚀', consistent_contributor: '⭐', skill_expert: '🎯', community_champion: '🏆' };

const TOOLTIP_STYLE = { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, color: '#111827', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' };

export default function ImpactPage() {
  const [impact, setImpact] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([impactApi.dashboard(), volunteersApi.leaderboard()])
      .then(([i, l]) => { setImpact(i.data); setLeaderboard(l.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;

  const catData = Object.entries(impact?.category_breakdown || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Impact Reports" sub="Platform-wide outcomes and efficiency metrics" />
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          📤 Export CSV
        </button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total People Helped" value={impact?.total_people_helped?.toLocaleString()} color="emerald" icon="👥" />
        <StatCard label="Tasks Completed" value={impact?.tasks_completed} color="blue" icon="✅" />
        <StatCard label="Avg Resolution Time" value={`${impact?.avg_time_to_resolution_hrs}h`} color="orange" icon="⏱️" />
        <StatCard label="Efficiency Score" value={`${impact?.avg_efficiency}%`} color="purple" icon="📊" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <Card className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-gray-900 font-semibold">People Helped Over Time</h2>
              <p className="text-gray-400 text-xs mt-0.5">Last 30 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={impact?.timeline}>
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="helped" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category pie */}
        <Card className="p-6">
          <h2 className="text-gray-900 font-semibold mb-4">Need Distribution</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={3}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {catData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  {item.name}
                </div>
                <span className="text-gray-800 font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card className="p-6">
          <h2 className="text-gray-900 font-semibold mb-4">🏆 Volunteer Leaderboard</h2>
          <div className="space-y-2">
            {leaderboard.slice(0, 8).map((vol, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                ${i < 3
                  ? 'bg-gradient-to-r from-amber-50 to-white border-amber-100'
                  : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                  ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 text-sm font-semibold truncate">{vol.name}</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {vol.badges?.slice(0, 2).map((b, j) => (
                      <span key={j} title={b.type} className="text-xs">{BADGE_ICONS[b.type] || '🎖️'}</span>
                    ))}
                    <span className="text-gray-400 text-xs">{vol.skills?.join(', ')}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-emerald-600 font-bold text-sm">{vol.total_impact_points} pts</div>
                  <div className="text-gray-400 text-xs">{(vol.completion_rate * 100).toFixed(0)}% rate</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* NGO table */}
        <Card className="p-6">
          <h2 className="text-gray-900 font-semibold mb-4">NGO Performance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">NGO</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trust</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Verified</th>
              </tr>
            </thead>
            <tbody>
              {impact?.ngo_stats?.map((ngo, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 text-gray-900 font-medium">{ngo.name}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 rounded-full h-1.5 w-16">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${ngo.trust * 10}%` }} />
                      </div>
                      <span className="text-gray-700 font-semibold text-xs">{ngo.trust}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-gray-600 font-medium">{ngo.interventions}</td>
                  <td className="py-3.5">
                    {ngo.verified
                      ? <span className="text-xs font-semibold text-emerald-700">✓ Verified</span>
                      : <span className="text-xs font-semibold text-yellow-600">⏳ Pending</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
