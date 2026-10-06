/**
 * mockData.js — Structured mock data for ImpactSphere demo
 * Replace with real API calls once backend is ready.
 */

export const MOCK_VOLUNTEERS = [
  {
    id: 'vol_001',
    name: 'Priya Sharma',
    email: 'priya@volunteer.org',
    location: 'North Delhi',
    lat: 28.7041,
    lng: 77.1025,
    skills: ['medical', 'general'],
    languages: ['Hindi', 'English'],
    availability: ['weekdays', 'evenings'],
    trust_score: 8.7,
    completion_rate: 0.94,
    total_impact_points: 1240,
    active_task_count: 2,
    badges: ['first_responder', 'consistent_contributor'],
    availability_status: 'available',
  },
  {
    id: 'vol_002',
    name: 'Arjun Mehta',
    email: 'arjun@volunteer.org',
    location: 'Rohini, Delhi',
    lat: 28.7495,
    lng: 77.0670,
    skills: ['teaching', 'general'],
    languages: ['Hindi', 'English', 'Punjabi'],
    availability: ['weekends', 'fulltime'],
    trust_score: 9.2,
    completion_rate: 0.98,
    total_impact_points: 2100,
    active_task_count: 1,
    badges: ['community_champion', 'skill_expert'],
    availability_status: 'available',
  },
  {
    id: 'vol_003',
    name: 'Sara Khan',
    email: 'sara@volunteer.org',
    location: 'Dwarka, Delhi',
    lat: 28.5921,
    lng: 77.0460,
    skills: ['logistics', 'rescue'],
    languages: ['Hindi', 'Urdu', 'English'],
    availability: ['emergency', 'weekends'],
    trust_score: 7.9,
    completion_rate: 0.88,
    total_impact_points: 890,
    active_task_count: 0,
    badges: ['first_responder'],
    availability_status: 'available',
  },
];

export const MOCK_NEEDS = [
  {
    id: 'need_001',
    description: 'People in Ward 5 have not received food for 2 days. ~200 families affected.',
    category: 'food',
    urgency_score: 87,
    severity: 9,
    affected_count: 200,
    location_label: 'Ward 5, North Delhi',
    location_lat: 28.7041,
    location_lng: 77.1025,
    source: 'ngo_direct',
    status: 'active',
    time_sensitivity: 10,
    ngo: 'GreenAid Foundation',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 'need_002',
    description: 'Medical camp needed in flood-affected Rohini area. Skin infections spreading.',
    category: 'health',
    urgency_score: 74,
    severity: 7,
    affected_count: 120,
    location_label: 'Rohini Sector 22',
    location_lat: 28.7495,
    location_lng: 77.0670,
    source: 'community',
    status: 'active',
    time_sensitivity: 7,
    ngo: 'CareNet India',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'need_003',
    description: 'School supplies shortage in government school. 300 students without books.',
    category: 'education',
    urgency_score: 52,
    severity: 5,
    affected_count: 300,
    location_label: 'Dwarka Sector 7',
    location_lat: 28.5921,
    location_lng: 77.0460,
    source: 'ngo_direct',
    status: 'pending',
    time_sensitivity: 4,
    ngo: 'EduFirst NGO',
    created_at: '2024-01-15T11:00:00Z',
  },
];

export const MOCK_IMPACT = {
  total_people_helped: 12400,
  active_needs: 18,
  tasks_completed: 342,
  avg_time_to_resolution_hrs: 2.4,
  category_breakdown: {
    Food: 8,
    Health: 5,
    Education: 3,
    Disaster: 2,
  },
  timeline: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    helped: Math.floor(200 + Math.random() * 400 + i * 10),
  })),
  ngo_stats: [
    { name: 'GreenAid Foundation', trust: 9.2, interventions: 48, verified: true },
    { name: 'CareNet India', trust: 8.7, interventions: 35, verified: true },
    { name: 'EduFirst NGO', trust: 7.4, interventions: 22, verified: true },
    { name: 'ReliefBridge', trust: 6.8, interventions: 18, verified: false },
  ],
};

/**
 * matchVolunteers(need) → ranked volunteer matches
 *
 * Simple scoring: skill match (50%) + proximity (30%) + trust score (20%)
 */
export function matchVolunteers(need) {
  return MOCK_VOLUNTEERS
    .map(vol => {
      // Skill match
      const skillMatch = need.category === 'food' ? vol.skills.includes('general') || vol.skills.includes('logistics') :
        need.category === 'health' ? vol.skills.includes('medical') || vol.skills.includes('general') :
        need.category === 'education' ? vol.skills.includes('teaching') :
        need.category === 'disaster' ? vol.skills.includes('rescue') || vol.skills.includes('logistics') :
        vol.skills.includes('general');

      // Distance (simplified — in real app, use Haversine formula)
      const latDiff = Math.abs(vol.lat - need.location_lat);
      const lngDiff = Math.abs(vol.lng - need.location_lng);
      const distanceScore = Math.max(0, 1 - (latDiff + lngDiff) * 5);

      // Composite score
      const score = (skillMatch ? 0.5 : 0) + distanceScore * 0.3 + (vol.trust_score / 10) * 0.2;

      return { ...vol, match_score: Math.round(score * 100), skill_match: skillMatch };
    })
    .filter(v => v.match_score > 20)
    .sort((a, b) => b.match_score - a.match_score);
}
