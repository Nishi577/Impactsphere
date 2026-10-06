import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { impactApi } from '../utils/api';
import { StatCard, Card, UrgencyBadge, SourceBadge, SectionHeader, Skeleton, EmptyState } from '../components/common/UI';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Zap, ArrowRight, TrendingUp, Users, Activity, Globe } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function AdminDashboard() {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    impactApi.dashboard().then(imp => {
      setImpact(imp.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  );

  const catData = Object.entries(impact?.category_breakdown || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Platform Overview"
        sub="Real-time intelligence across all NGOs and communities"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="People Helped" value={impact?.total_people_helped?.toLocaleString()} color="emerald" icon="👥" />
        <StatCard label="Active Needs" value={impact?.active_needs} color="blue" icon="📋" />
        <StatCard label="Tasks Completed" value={impact?.tasks_completed} color="purple" icon="✅" />
        <StatCard label="Avg Resolution" value={`${impact?.avg_time_to_resolution_hrs}h`} color="orange" icon="⏱️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline chart */}
        <Card className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-gray-900 font-semibold">People Helped</h2>
              <p className="text-gray-400 text-xs mt-0.5">Last 30 days</p>
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={impact?.timeline}>
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, color: '#111827', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
              <Line type="monotone" dataKey="helped" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category donut */}
        <Card className="p-6">
          <h2 className="text-gray-900 font-semibold mb-4">Need Categories</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, color: '#111827', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {catData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* NGO Table */}
      <Card className="p-6">
        <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2">
          <Globe size={16} className="text-emerald-500" />
          NGO Performance
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">NGO</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trust Score</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Interventions</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {impact?.ngo_stats?.map((ngo, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3.5 text-gray-900 font-medium">{ngo.name}</td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-20">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${ngo.trust * 10}%` }} />
                    </div>
                    <span className="text-gray-700 font-semibold text-xs">{ngo.trust}</span>
                  </div>
                </td>
                <td className="py-3.5 text-gray-600 font-medium">{ngo.interventions}</td>
                <td className="py-3.5">
                  {ngo.verified
                    ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">✓ Verified</span>
                    : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full">⏳ Pending</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}