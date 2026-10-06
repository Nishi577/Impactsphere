/**
 * gemini.js — Google Gemini AI integration for ImpactSphere
 *
 * Set REACT_APP_GEMINI_API_KEY in your .env file.
 * Get a free key at: https://aistudio.google.com/app/apikey
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    console.warn('[Gemini] No API key — returning mock response');
    return null;
  }
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function safeParse(text) {
  try {
    // Strip markdown code fences if present
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

/**
 * structureNeed(rawInput: string) → StructuredNeed
 *
 * Converts a free-text NGO field report into structured need data.
 *
 * Example input:  "People haven't received food for 2 days in Ward 5"
 * Example output: { category, severity, urgency, affected_estimate, location_hint, summary }
 */
export async function structureNeed(rawInput) {
  const prompt = `
You are an AI assistant for an NGO resource allocation system.
Convert the following raw field report into structured JSON.

Field report: "${rawInput}"

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "category": "food | health | education | disaster | elderly | environment | infrastructure",
  "severity": "Low | Medium | High | Critical",
  "urgency": "Low | Medium | High | Immediate",
  "affected_estimate": <number or null if unknown>,
  "location_hint": "<extracted location or null>",
  "suggested_resources": ["<resource1>", "<resource2>", "<resource3>"],
  "summary": "<1-2 sentence professional summary of the need>"
}
`.trim();

  const text = await callGemini(prompt);

  if (!text) {
    // Fallback mock for demo without API key
    return getMockNeedAnalysis(rawInput);
  }

  const parsed = safeParse(text);
  return parsed || getMockNeedAnalysis(rawInput);
}

/**
 * suggestResources(needDescription: string) → string[]
 *
 * Given a need description, suggests specific resources required.
 */
export async function suggestResources(needDescription) {
  const prompt = `
You are a resource planning expert for NGO operations.
Given this community need: "${needDescription}"

List exactly 5 specific resources needed to address this need.
Respond ONLY with a JSON array of strings, like:
["Doctors (2)", "First aid kits (20)", "Ambulance", "Medicines", "Medical volunteers (5)"]
`.trim();

  const text = await callGemini(prompt);
  if (!text) return ['Volunteers', 'Supplies', 'Transport', 'Coordination', 'Communication'];

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return ['Volunteers', 'Supplies', 'Transport', 'Coordination', 'Communication'];
  }
}

/**
 * classifyUrgency(description, affectedCount, location) → urgency details
 */
export async function classifyUrgency(description, affectedCount, location) {
  const prompt = `
Community need details:
- Description: "${description}"
- People affected: ${affectedCount}
- Location: ${location}

Assess this need and respond ONLY with JSON:
{
  "urgency_score": <number 0-100>,
  "priority_level": "Low | Medium | High | Critical",
  "recommended_response_time": "<e.g. Within 2 hours | Same day | Within 3 days>",
  "key_risk": "<main risk if not addressed promptly>"
}
`.trim();

  const text = await callGemini(prompt);
  if (!text) {
    const score = Math.min(90, 40 + (affectedCount / 10));
    return { urgency_score: Math.round(score), priority_level: score > 70 ? 'High' : 'Medium', recommended_response_time: 'Within 24 hours', key_risk: 'Situation may worsen without intervention' };
  }
  return safeParse(text) || { urgency_score: 60, priority_level: 'Medium', recommended_response_time: 'Within 24 hours', key_risk: 'Unknown' };
}

// ─── Mock responses for demo without API key ─────────────────────────────────

function getMockNeedAnalysis(input) {
  const lower = input.toLowerCase();

  const category =
    lower.includes('food') || lower.includes('hunger') || lower.includes('meal') ? 'food' :
    lower.includes('medical') || lower.includes('health') || lower.includes('doctor') ? 'health' :
    lower.includes('school') || lower.includes('educat') ? 'education' :
    lower.includes('flood') || lower.includes('disaster') || lower.includes('rescue') ? 'disaster' :
    'general';

  const severity =
    lower.includes('days') || lower.includes('urgent') || lower.includes('emergency') ? 'High' :
    lower.includes('critical') || lower.includes('immediately') ? 'Critical' : 'Medium';

  const resourceMap = {
    food: ['Food packets (500)', 'Distribution volunteers (10)', 'Transport vehicle', 'Storage facility', 'Water supply'],
    health: ['Doctors (3)', 'First aid kits (30)', 'Medicines', 'Medical volunteers (8)', 'Ambulance access'],
    education: ['Teachers (5)', 'Learning materials', 'Classroom space', 'Education volunteers', 'Stationery supplies'],
    disaster: ['Rescue team (10)', 'Emergency shelter', 'Food & water', 'Medical support', 'Communication equipment'],
    general: ['Volunteers (10)', 'Supplies', 'Transport', 'Coordination team', 'Communication'],
  };

  return {
    category,
    severity,
    urgency: severity === 'Critical' ? 'Immediate' : severity === 'High' ? 'High' : 'Medium',
    affected_estimate: null,
    location_hint: null,
    suggested_resources: resourceMap[category] || resourceMap.general,
    summary: `Based on the report, this is a ${severity.toLowerCase()}-severity ${category} need that requires prompt attention and resource allocation.`,
  };
}
