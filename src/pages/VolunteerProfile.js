import React, { useEffect, useState } from 'react';
import { volunteersApi } from '../utils/api';
import { Card, SectionHeader, Skeleton, EmptyState } from '../components/common/UI';
import { Search } from 'lucide-react';

const BADGE_ICONS = {
  first_responder:        '🚀',
  consistent_contributor: '⭐',
  skill_expert:           '🎯',
  community_champion:     '🏆',
};

const AVAIL_CONFIG = {
  available: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  busy:      { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',  dot: 'bg-yellow-500' },
  offline:   { cls: 'bg-gray-100 text-gray-500 border-gray-200',       dot: 'bg-gray-400' },
};

export default function VolunteerProfile() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSkill, setFilterSkill] = useState('all');

  useEffect(() => {
    volunteersApi.all().then(r => setVolunteers(r.data)).finally(() => setLoading(false));
  }, []);

  const allSkills = [...new Set(volunteers.flatMap(v => v.skills || []))].sort();
  const filtered = volunteers.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.skills?.some(s => s.includes(search.toLowerCase()));
    const matchSkill = filterSkill === 'all' || v.skills?.includes(filterSkill);
    return matchSearch && matchSkill;
  });

  if (loading) return <div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Volunteer Management"
        sub={`${volunteers.length} volunteers registered on the platform`}
      />

      {/* Search + filter bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by name or skill..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
        <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
          <option value="all">All Skills</option>
          {allSkills.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-gray-500">{filtered.length} shown</span>
        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {volunteers.filter(v => v.availability_status === 'available').length} available
        </span>
        <span className="flex items-center gap-1.5 text-yellow-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          {volunteers.filter(v => v.availability_status === 'busy').length} busy
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12"><EmptyState icon="👤" title="No volunteers found" desc="Try adjusting your search or filters" /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(vol => {
            const avail = AVAIL_CONFIG[vol.availability_status] || AVAIL_CONFIG.offline;
            return (
              <Card key={vol.id} className="p-5 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
                    {vol.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-semibold truncate">{vol.name}</div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${avail.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} />
                      {vol.availability_status}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {vol.badges?.slice(0, 2).map((b, i) => (
                      <span key={i} title={b.type} className="text-base">{BADGE_ICONS[b.type] || '🎖️'}</span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {vol.skills?.map(s => (
                    <span key={s} className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">{s}</span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                    <div className="text-gray-900 font-bold text-sm">{vol.trust_score}</div>
                    <div className="text-gray-400 text-[11px]">Trust</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2">
                    <div className="text-emerald-700 font-bold text-sm">{(vol.completion_rate * 100).toFixed(0)}%</div>
                    <div className="text-emerald-400 text-[11px]">Rate</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-2">
                    <div className="text-amber-700 font-bold text-sm">{vol.total_impact_points}</div>
                    <div className="text-amber-400 text-[11px]">Points</div>
                  </div>
                </div>

                {/* Active task badge */}
                {vol.active_task_count > 0 && (
                  <div className="mt-3 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5 text-center">
                    {vol.active_task_count} active task{vol.active_task_count > 1 ? 's' : ''}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
