export type CoachTier = "On track" | "Monitor" | "Support suggested";

export interface CoachSummary {
  id: string;
  name: string;
  role: string;
  languages: string;
  yearsExperience: number;
  participants: number;
  calls: number;
  avgCallMinutes: number;
  reflectionToQuestion: number;
  openQuestionShare: number;
  complexReflectionShare: number;
  persuadeConfrontShare: number;
  changeTalkShare: number;
  sustainTalkShare: number;
  supervisorEmpathy: number;
  supervisorPartnership: number;
  supervisorOverall: number;
  plannedForBarriers: number;
  summarized: number;
  completionRate: number;
  goalScore: number;
  safetyDisclosures: number;
  safetyNotEscalated: number;
  tier: CoachTier;
}

export interface SafetyItem {
  id: string;
  channel: "Call" | "Text";
  source: string;
  participantId: string;
  coachId: string;
  date: string;
  language: string;
  category: string;
  text: string;
  coachReply: string;
  replyHours?: number | null;
  escalated: boolean;
  labelled: boolean;
  supervisorHandled: "yes" | "no" | null;
  context: { speaker: string; text: string; flag: boolean }[];
}

export interface GroupOutcome { group: string; n: number; completionRate: number; goalScore: number }
export interface Benchmark { sessions: number; reflectionToQuestion: number; openQuestionShare: number; complexReflectionShare: number; changeTalkShare: number; sustainTalkShare: number }

export interface CoachingReviewData {
  source: string;
  overview: {
    participants: number; coaches: number; activeCoaches: number; calls: number; labelledCalls: number; transcriptLines: number;
    textMessages: number; labelledTexts: number; supervisorRatedCalls: number; programWeeks: number; callsPerParticipant: number;
    startDates: [string, string]; completionRate: number; goalScore: number; goalFullyMet: number; spanishShare: number; languageMismatches: number;
  };
  correlations: Record<"reflectionToQuestion" | "supervisorOverall" | "changeTalkShare" | "avgCallMinutes", number>;
  benchmark: { high: Benchmark; low: Benchmark };
  coaches: CoachSummary[];
  equity: Record<string, GroupOutcome[]>;
  engagement: { band: string; n: number; avgReplies: number; completionRate: number; goalScore: number }[];
  goalTrend: { week: number; fullyMet: number; partly: number; n: number }[];
  topics: { topic: string; goals: number; fullyMet: number }[];
  raters: {
    names: [string, string];
    scales: { item: string; meanA: number; meanB: number; exact: number; withinOne: number }[];
    checklist: { item: string; agreement: number; kappa: number }[];
  };
  safety: SafetyItem[];
}

export const loadCoachingReview = async (): Promise<CoachingReviewData> =>
  (await import("./coaching-review-data.json")).default as unknown as CoachingReviewData;

export const pct = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;

export type QueueStatus = "Needs review" | "Reviewed" | "All";

export function filterQueue(items: SafetyItem[], reviewed: Record<string, boolean>, filters: { status: QueueStatus; channel: string; category: string; escalation: string }) {
  return items.filter(item =>
    (filters.status === "All" || (filters.status === "Reviewed") === !!reviewed[item.id]) &&
    (filters.channel === "All" || item.channel === filters.channel) &&
    (filters.category === "All" || item.category === filters.category) &&
    (filters.escalation === "All" || (filters.escalation === "Not escalated") === !item.escalated));
}

export function queueSummary(items: SafetyItem[], reviewed: Record<string, boolean>) {
  const open = items.filter(i => !reviewed[i.id]);
  return {
    total: items.length,
    notEscalated: items.filter(i => !i.escalated).length,
    openNotEscalated: open.filter(i => !i.escalated).length,
    unlabelled: items.filter(i => !i.labelled).length,
    reviewed: items.length - open.length,
  };
}

export function coachFindings(coach: CoachSummary, benchmark: CoachingReviewData["benchmark"]) {
  const findings: string[] = [];
  const midpoint = (benchmark.high.reflectionToQuestion + benchmark.low.reflectionToQuestion) / 2;
  findings.push(coach.reflectionToQuestion >= midpoint
    ? `Reflects ${coach.reflectionToQuestion.toFixed(2)} times per question, closer to expert-rated high-quality MI (${benchmark.high.reflectionToQuestion.toFixed(2)}).`
    : `Reflects ${coach.reflectionToQuestion.toFixed(2)} times per question, closer to low-quality MI sessions (${benchmark.low.reflectionToQuestion.toFixed(2)}). Practise reflecting before the next question.`);
  if (coach.persuadeConfrontShare >= 0.08) findings.push(`${pct(coach.persuadeConfrontShare)} of coded moves persuade or confront; swap for asking permission and emphasising autonomy.`);
  if (coach.plannedForBarriers < 0.6) findings.push(`Supervisors saw barrier planning on only ${pct(coach.plannedForBarriers)} of rated calls.`);
  if (coach.summarized < 0.55) findings.push(`Calls ended with a summary ${pct(coach.summarized)} of the time.`);
  if (coach.safetyNotEscalated > 0) findings.push(`${coach.safetyNotEscalated} of ${coach.safetyDisclosures} risk disclosures had no escalation in the next coach reply. Review them in the safety queue.`);
  findings.push(`Participants voiced change talk in ${pct(coach.changeTalkShare)} of labelled statements; goal score ${coach.goalScore.toFixed(2)}, completion ${pct(coach.completionRate)}.`);
  return findings;
}
