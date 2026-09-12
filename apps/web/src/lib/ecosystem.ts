/** Shared, typed capability layer. Demonstration analysis is deterministic and inspectable. */
import type { Priority } from "./bridge";
export const capabilities = [
  { id: "evidence", name: "Evidence", verb: "Organize what you know", description: "Research, observations and uncertainty in one evidence register." },
  { id: "systems", name: "Systems", verb: "See the whole system", description: "Connect community, clinical, wellness, policy and private-sector dependencies." },
  { id: "match", name: "Match", verb: "Find complementary expertise", description: "Explain shared priorities and relevant skills across teams." },
  { id: "sdg", name: "SDG", verb: "Connect to shared goals", description: "Propose target alignment without claiming measured SDG impact." },
  { id: "collaboration", name: "Collaboration", verb: "Build across borders", description: "Identify opportunities for reciprocal learning and joint work." },
  { id: "implementation", name: "Implementation", verb: "Move evidence into action", description: "Define outputs, supervision, resources and delivery handoffs." },
  { id: "influence", name: "Influence", verb: "Find who can act", description: "Identify missing connections and appropriate decision pathways." },
  { id: "opportunity", name: "Opportunity", verb: "Find meaningful experience", description: "Explore paid project concepts and verified opportunity requirements." },
  { id: "impact", name: "Impact", verb: "Follow what happens next", description: "Separate outputs, decisions, implementation and observed outcomes." },
] as const;
export type CapabilityId = typeof capabilities[number]["id"];
export type Team = { id: string; name: string; country: string; region: string; location: string; lat: number; lon: number; topic: string; sdgs: string[]; expertise: string[]; needs: string[]; project: string; evidence: string; organization: string };
export const teams: Team[] = [
  { id: "miami", name: "South Florida Systems Studio", country: "United States", region: "Coordination hub", location: "South Florida", lat: 25.76, lon: -80.19, topic: "Maternal health", sdgs: ["3", "4", "8", "17"], expertise: ["systems mapping", "implementation design"], needs: ["community insight", "referral evaluation"], project: "Community-to-care learning exchange", evidence: "Proposed shared referral mapping protocol", organization: "Student team + faculty champion + community partner" },
  { id: "haiti", name: "Haiti Community Referral Lab", country: "Haiti", region: "Caribbean", location: "Port-au-Prince", lat: 18.59, lon: -72.31, topic: "Maternal health", sdgs: ["3", "10", "17"], expertise: ["community insight", "participatory research"], needs: ["implementation design", "referral evaluation"], project: "Understanding maternal-health referral barriers", evidence: "Illustrative community listening protocol; no actual study findings", organization: "Student team + NGO technical lead" },
  { id: "colombia", name: "Colombia Referral Research Collective", country: "Colombia", region: "Latin America", location: "Bogotá", lat: 4.71, lon: -74.07, topic: "Maternal health", sdgs: ["3", "4", "17"], expertise: ["referral evaluation", "implementation design"], needs: ["community insight", "systems mapping"], project: "Connecting referral research with local delivery", evidence: "Illustrative referral-process evaluation template", organization: "University researchers + student team + health-system partner" },
  { id: "rwanda", name: "Rwanda Maternal Health Studio", country: "Rwanda", region: "Africa", location: "Kigali", lat: -1.94, lon: 30.06, topic: "Maternal health", sdgs: ["3", "5", "17"], expertise: ["referral evaluation", "systems mapping"], needs: ["participatory research"], project: "Learning across community referral pathways", evidence: "Illustrative systems-mapping workshop outline", organization: "Student team + faculty mentor + community partner" },
  { id: "jamaica", name: "Caribbean Digital Health Lab", country: "Jamaica", region: "Caribbean", location: "Kingston", lat: 17.97, lon: -76.79, topic: "Digital inclusion", sdgs: ["3", "4", "10"], expertise: ["digital literacy", "accessible design"], needs: ["program evaluation"], project: "Digital confidence for community health", evidence: "Illustrative digital-access needs checklist", organization: "University + students + community learning partner" },
  { id: "brazil", name: "Brazil Community Evidence Studio", country: "Brazil", region: "Latin America", location: "São Paulo", lat: -23.55, lon: -46.63, topic: "Community evidence", sdgs: ["3", "16", "17"], expertise: ["participatory research", "program evaluation"], needs: ["accessible design"], project: "Turning community observations into decisions", evidence: "Illustrative community evidence register", organization: "Researchers + students + public health partner" },
];
export function getTeam(id: string) { const team = teams.find(t => t.id === id); if (!team) throw new Error("Choose an existing demonstration team."); return team; }
export function matchTeams(id: string) {
  const selected = getTeam(id);
  return teams.filter(t => t.id !== id).map(t => {
    const sharedTopic = t.topic === selected.topic;
    const skills = t.expertise.filter(s => selected.needs.includes(s));
    const reciprocal = selected.expertise.filter(s => t.needs.includes(s));
    const sharedSDGs = t.sdgs.filter(s => selected.sdgs.includes(s));
    const score = (sharedTopic ? 5 : 0) + skills.length * 2 + reciprocal.length;
    return { team: t, score, sharedTopic, skills, reciprocal, sharedSDGs, reason: [sharedTopic ? `Shared priority: ${t.topic.toLowerCase()}.` : "Different priority; potential methods exchange.", skills.length ? `Offers ${skills.join(" and ")} that your team needs.` : "No direct skills match recorded.", reciprocal.length ? `Your team can contribute ${reciprocal.join(" and ")}.` : "Define a reciprocal contribution together."].join(" ") };
  }).filter(m => m.score > 0).sort((a,b) => b.score - a.score || a.team.id.localeCompare(b.team.id));
}
export const influenceSteps = [
  { id: "community", title: "Community evidence", actor: "Community representatives & student researchers", authority: "Define the problem and validate whether the interpretation reflects lived experience.", artifact: "An anonymized evidence brief, methods, limitations and community feedback.", gap: "A community reviewer and agreement about appropriate evidence use.", next: "Ask a community partner to review the problem framing and identify missing voices." },
  { id: "local", title: "Local health system / organization", actor: "Service manager or institutional lead", authority: "Own the local service process and decide whether a feasible change can be tested.", artifact: "A process map, capacity assessment and proposed service handoff.", gap: "A named receiving team with authority and resources to act.", next: "Find the operational owner and request a review of the proposed pilot." },
  { id: "ngo", title: "NGO or implementing partner", actor: "Program director & technical lead", authority: "Coordinate implementation, mentorship and operational support.", artifact: "A costed partnership proposal with paid student roles and supervision.", gap: "A partner mandate, funding commitment and accountable technical mentor.", next: "Explore alignment with a relevant implementing partner before proposing delivery commitments." },
  { id: "government", title: "Government / Ministry of Health", actor: "Relevant program or policy unit", authority: "Consider institutional adoption, workforce funding and public-system policy options.", artifact: "A locally reviewed policy brief with implementation costs and evidence limitations.", gap: "The correct jurisdiction, policy window and authorized decision owner.", next: "Identify the relevant public-health unit and verify its formal evidence-submission route." },
  { id: "regional", title: "Regional institution", actor: "Relevant regional technical network", authority: "Convene regional learning and consider technical cooperation within its mandate.", artifact: "A comparative learning brief that explains differences between local contexts.", gap: "Regional relevance and a verified technical cooperation or consultation channel.", next: "Seek a regional knowledge partner and check eligibility for its published mechanisms." },
  { id: "global", title: "WHO / UN / global institution", actor: "Relevant technical program or institution", authority: "Consider evidence through appropriate technical or knowledge-sharing processes.", artifact: "A reviewed synthesis with provenance, ethics, local context and limitations.", gap: "A relevant mandate and verified public channel; no direct access is assumed.", next: "Identify a suitable technical program and verify its current participation process." },
  { id: "mechanism", title: "Policy or intergovernmental mechanism", actor: "Mechanism secretariat / authorized representatives", authority: "Receive eligible submissions or consider evidence within a defined process.", artifact: "A submission tailored to verified rules, deadlines and representation requirements.", gap: "A named, current mechanism with confirmed eligibility and submission rules.", next: "Verify the mechanism before drafting a submission; institutional influence is not guaranteed." },
] as const;
export const systemLayers = [
  { name: "Community health", role: "Co-define priorities and validate lived experience", handoff: "Community-reviewed evidence → operational service team" },
  { name: "Clinical healthcare", role: "Confirm receiving capacity and clinical supervision", handoff: "Accepted referrals → supervised service delivery" },
  { name: "Public health & wellness", role: "Connect prevention, access and population-level learning", handoff: "Aggregate monitoring → program improvement" },
  { name: "Government & policy", role: "Clarify authority, workforce funding and sustainable adoption", handoff: "Evaluated pilot → institutional decision" },
  { name: "NGOs & private sector", role: "Provide operational resources, technical expertise and implementation support", handoff: "Transparent partnership agreement → accountable delivery" },
  { name: "Universities & researchers", role: "Provide methodology, student supervision and independent evaluation", handoff: "Reviewed research → actionable implementation brief" },
];
export type EvidenceItem = { id: string; title: string; kind: string; source: string; date: string; summary: string; limitation: string };
export type ImpactItem = { id: string; indicator: string; stage: string; baseline: number; current: number; unit: string; source: string; date: string };
export type CapabilityContext = { priority: Priority; teamId: string; evidence: EvidenceItem[]; impacts: ImpactItem[]; connections: Record<string,string> };
export type CapabilityResult = { capability: CapabilityId; title: string; findings: string[]; nextAction: string; mode: "rule-based preview" };
export function analyzeCapability(id: CapabilityId, ctx: CapabilityContext): CapabilityResult {
  const matches = matchTeams(ctx.teamId).slice(0,3);
  const missing = influenceSteps.find(s => !["Engaged", "Acted"].includes(ctx.connections[s.id] || "")) || influenceSteps[6];
  const results: Record<CapabilityId, { findings: string[]; nextAction: string }> = {
    evidence: { findings: ctx.evidence.length ? ctx.evidence.map(e => `${e.title}: ${e.kind}; source ${e.source || "missing"}; date ${e.date || "missing"}. Observation: ${e.summary}. Limitation: ${e.limitation || "not recorded"}.`) : ["No evidence has been added for this priority. The example description is not an observed finding."], nextAction: "Add an aggregate observation or public reference, its date, methods and limitations. Have a mentor review it." },
    systems: { findings: systemLayers.map(l => `${l.name}: ${l.handoff}.`), nextAction: "Choose the broken handoff for this priority and confirm both sending and receiving owners." },
    match: { findings: matches.map(m => `${m.team.name} (${m.team.country}): ${m.reason}`), nextAction: "Inspect the suggested team's methods and needs. These are synthetic examples, not verified people or available partners." },
    sdg: { findings: [`Proposed targets for ${ctx.priority.short}: ${ctx.priority.targets.join(", ")}.`, "Map local measures to the selected target's actual scope. Training completion is not employment or measured SDG impact."], nextAction: "Review the UN 2030 Agenda and record a baseline, timeframe and measurement owner." },
    collaboration: { findings: matches.map(m => `${m.team.country}: ${m.reason}`), nextAction: "Draft a reciprocal learning exchange with joint outputs, local leadership, language support and data-sharing limits." },
    implementation: { findings: [ctx.priority.gap, `Proposed paid roles: ${ctx.priority.roles.join(", ")}.`, "Confirm a funded host, mentor, work scope, receiving service owner and evaluation plan before launch."], nextAction: "Prepare a reviewed program plan, intervention, research output, dashboard, evaluation or partnership proposal." },
    influence: { findings: [`First unconfirmed connection: ${missing.title}.`, `Potential decision owner: ${missing.actor}.`, `Missing: ${missing.gap}`], nextAction: missing.next },
    opportunity: { findings: ["Explore the illustrative Haiti maternal-health micro-project with local students, South Florida peers, a faculty mentor and an NGO technical lead.", "No grants, fellowships, conferences, consultations, working groups or vacancies are verified in this prototype."], nextAction: "Before presenting a live opportunity, verify the official URL, sponsor, eligibility, deadline, compensation and application process." },
    impact: { findings: ctx.impacts.length ? ctx.impacts.map(i => `${i.indicator}: ${i.baseline} → ${i.current} ${i.unit}; stage ${i.stage}; user-reported, source ${i.source}.`) : ["No outcomes recorded. A proposal, publication or meeting is not evidence of improved health or sustained employment."], nextAction: "Record a source-backed output, decision, implementation milestone or measured outcome; keep causal claims separate." },
  };
  return { capability: id, title: capabilities.find(c => c.id === id)!.verb, ...results[id], mode: "rule-based preview" };
}
