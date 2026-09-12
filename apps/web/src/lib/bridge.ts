export const sources = [
  { id: "sdg", publisher: "UNITED NATIONS", title: "The 2030 Agenda", year: "2015", url: "https://sdgs.un.org/2030agenda", summary: "17 interconnected goals. This prototype focuses on health access, skills, decent work, inclusion and partnership.", tags: ["SDGs", "Shared outcomes"] },
  { id: "gdc", publisher: "UNITED NATIONS", title: "Global Digital Compact", year: "2024", url: "https://www.un.org/en/summit-of-the-future/global-digital-compact", summary: "A framework for digital cooperation. Our design applies accessible participation, digital skills and responsible data stewardship.", tags: ["Digital inclusion", "Cooperation"] },
  { id: "unesco", publisher: "UNESCO", title: "Recommendation on the Ethics of AI", year: "2021", url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics", summary: "Human rights, fairness, transparency and human oversight inform how proposals are reviewed and challenged.", tags: ["Human oversight", "Fairness"] },
  { id: "who", publisher: "WORLD HEALTH ORGANIZATION", title: "Ethics and governance of AI for health", year: "2021", url: "https://www.who.int/publications/i/item/9789240029200", summary: "Health AI guidance informs our emphasis on autonomy, accountability, confidentiality and equitable participation.", tags: ["Health AI", "Accountability"] },
] as const;

export const priorities = [
  { id: "SF-001", title: "From community outreach to connected care", short: "Access to care", category: "ACCESS & NAVIGATION", summary: "Connect community outreach with a clear, supported pathway into primary care—so a referral becomes a completed connection.", gap: "Outreach teams and service providers maintain separate resource lists. The demo coalition has no shared owner for following a referral through to completion.", community: "Residents navigating primary care", theme: "care", targets: ["3.8", "4.4", "8.5", "17.17"], project: "Community-to-Care Bridge", roles: ["Community data fellow", "Service-navigation associate", "Implementation associate"], existing: ["Community outreach and resource mapping", "Primary care referral coordination"] },
  { id: "SF-002", title: "Build digital confidence, open doors to care", short: "Digital inclusion", category: "DIGITAL ACCESS & SKILLS", summary: "Help residents use digital health services with confidence while creating practical, paid learning opportunities for new public health professionals.", gap: "Separate digital literacy workshops lack a shared pathway into health-service support. Device access and language needs must be validated with residents.", community: "Residents facing digital access barriers", theme: "digital", targets: ["4.4", "8.5", "10.2", "17.16"], project: "Digital Health Access Lab", roles: ["Digital health support associate", "Community learning fellow", "Accessibility implementation associate"], existing: ["Community digital literacy workshops", "Health-system portal support"] },
  { id: "SF-003", title: "Turn local evidence into shared action", short: "Community evidence", category: "DATA & COMMUNITY VOICE", summary: "Bring community insights and existing assessments together into one useful evidence base for coordinated public health decisions.", gap: "Repeated surveys can burden communities while findings stay in separate reports. The demo lacks a jointly reviewed evidence register and an implementation owner.", community: "Community partners and public health teams", theme: "evidence", targets: ["4.4", "8.3", "16.7", "17.16"], project: "Community Evidence Collaborative", roles: ["Community research fellow", "Public health data associate", "Partnership implementation associate"], existing: ["Local community listening sessions", "Academic population health research"] },
  { id: "GL-004", title: "Connect maternal-health evidence to referral action", short: "Maternal-health referrals", category: "MATERNAL HEALTH & SYSTEMS", summary: "Help student teams understand referral barriers with local communities and translate reviewed evidence into supported service connections.", gap: "This illustrative Haiti project needs a shared pathway between community insight, NGO implementation support and a receiving health-system team. No actual barriers or study findings have been established.", community: "Community partners and student researchers in Haiti", theme: "maternal", targets: ["3.1", "4.4", "8.5", "17.17"], project: "Maternal Referral Learning Partnership", roles: ["Community research fellow", "Referral systems associate", "Implementation evaluation associate"], existing: ["Community-led referral listening protocol", "University and NGO implementation learning"] },
] as const;
export type Priority = (typeof priorities)[number];
export function findPriority(id: string): Priority {
  const p = priorities.find(p => p.id === id);
  if (!p) throw new Error("Unknown community priority.");
  return p;
}
export const partners = [
  { name: "Community organizations", initials: "CO", type: "Community voice", contribution: "Validate priorities, lead outreach and review community experience." },
  { name: "Public health agency", initials: "PH", type: "Government", contribution: "Assess workforce funding, public accountability and long-term ownership." },
  { name: "University partners", initials: "UP", type: "Academia", contribution: "Provide supervision, practical learning and independent evaluation." },
  { name: "Health-system teams", initials: "HS", type: "Service delivery", contribution: "Confirm capacity, receive handoffs and support quality of care." },
  { name: "Student teams", initials: "ST", type: "Primary users", contribution: "Lead supervised research, local learning and implementation support in a paid scope." },
  { name: "Researchers", initials: "RE", type: "Evidence & methods", contribution: "Support rigorous methods, peer learning and review of evidence limitations." },
  { name: "Private-sector partners", initials: "PS", type: "Resources & expertise", contribution: "Contribute transparent technical support, resources and accountable implementation capacity." },
  { name: "Global institutions", initials: "GI", type: "Knowledge & policy", contribution: "Potential technical learning and policy channels, subject to verified mandates and participation rules." },
];
export const sdgNames: Record<string, string> = { "3.1": "Maternal health", "3.8": "Access to health services", "4.4": "Skills for employment", "8.3": "Productive work & job creation", "8.5": "Decent employment", "10.2": "Social inclusion", "16.7": "Participatory decisions", "17.16": "Global partnership", "17.17": "Effective partnerships" };
export const phases = [
  { time: "DAYS 01–30", title: "Listen & align", detail: "Validate the priority with residents. Map existing work, confirm a delivery owner and cost paid roles." },
  { time: "DAYS 31–60", title: "Learn & deliver", detail: "After approvals, onboard practitioners and begin a supervised pilot with an agreed service handoff." },
  { time: "DAYS 61–90", title: "Measure & sustain", detail: "Review outcomes and community feedback. Assess competencies and prepare a funded continuation plan." },
];
export function projectDraft(p: Priority, focus = "") {
  return {
    incidentId: p.id,
    title: p.project,
    details: [
      "SYNTHETIC DEMO • Proposed 90-day project • Partners and funding unconfirmed",
      `COMMUNITY PRIORITY\n${p.title}. ${p.gap}`,
      `BUILD ON EXISTING WORK\nReview ${p.existing.join(" and ")} together. Validate overlap before creating a new program.`,
      "COLLABORATION\nProposed accountable owner: student project lead with faculty and institutional supervision (to confirm). Community organizations validate priorities; university partners supervise learning; a health-system team accepts service handoffs. All participation is proposed.",
      `PAID CAREER PATHWAYS\n${p.roles.map(r => `${r}: 1 proposed paid position; host, pay, benefits and supervisor to confirm.`).join("\n")}\nThree proposed roles are not funded jobs. Budget must include supervision, accessibility and equipment. Use skills-based recruitment, including career changers.`,
      `90-DAY DELIVERY PLAN\n${phases.map(s => `${s.time}: ${s.detail}`).join("\n")}`,
      "SERVICE HANDOFF\nConfirm a receiving service team, acceptance criteria and escalation owner before launch. Track accepted handoffs through completion using aggregate data.",
      `SDG ALIGNMENT\n${p.targets.map(t => `${t}: ${sdgNames[t]}`).join("; ")}. These are proposed alignments, not measured SDG impact.`,
      "MEASURES\nCompleted connections / accepted referrals; paid positions funded and filled; supervised competencies achieved; community experience. Baselines, targets and measurement owners to agree. Assess employment retention at six months.",
      "GOVERNANCE\nHuman and community review; public or aggregate data only; no patient identifiers. Guidance: UN 2030 Agenda, Global Digital Compact, UNESCO AI ethics recommendation and WHO AI-for-health guidance. This is not UN certification or a legal compliance determination.",
      focus ? `TEAM NOTES (unverified input)\n${focus.slice(0, 500)}` : "",
      "NEXT DECISION\nReview this charter. Saving records the proposal only; it does not authorize spending, hiring, partner commitments or clinical operations.",
    ].filter(Boolean).join("\n\n"),
  };
}

export { BRIDGE_PROMPT } from "./bridge-instructions";
