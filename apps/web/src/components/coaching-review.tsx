"use client";
import { useEffect, useMemo, useState } from "react";
import { coachFindings, filterQueue, loadCoachingReview, pct, queueSummary, type CoachingReviewData, type QueueStatus } from "@/lib/coaching-review";

const REVIEW_KEY = "starts-forward:coaching-safety-reviewed:v1";
const TABS = ["Coach review", "Safety queue", "Engagement & equity", "Rater calibration"] as const;
type Tab = typeof TABS[number];

function Bar({ value, max = 1, label }: { value: number; max?: number; label: string }) {
  return <span className="cr-bar" role="img" aria-label={label}><i style={{ width: `${Math.max(2, Math.min(100, (value / max) * 100))}%` }}/></span>;
}

export function CoachingReview() {
  const [data, setData] = useState<CoachingReviewData>();
  const [tab, setTab] = useState<Tab>("Coach review");
  const [coachId, setCoachId] = useState<string>();
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({ status: "Needs review" as QueueStatus, channel: "All", category: "All", escalation: "Not escalated" });
  const [open, setOpen] = useState<string>();
  const [dimension, setDimension] = useState("Language");
  const [notice, setNotice] = useState("");

  useEffect(() => { void loadCoachingReview().then(setData); }, []);
  useEffect(() => {
    try { const raw = localStorage.getItem(REVIEW_KEY); if (raw) setReviewed(JSON.parse(raw)); setNotice("Review marks are saved in this browser only."); }
    catch { setNotice("Browser storage is unavailable; review marks will not persist."); }
  }, []);
  const mark = (id: string, value: boolean) => {
    const next = { ...reviewed }; if (value) next[id] = true; else delete next[id];
    setReviewed(next);
    try { localStorage.setItem(REVIEW_KEY, JSON.stringify(next)); } catch { setNotice("Could not save review marks in this browser."); }
  };

  const queue = useMemo(() => data ? filterQueue(data.safety, reviewed, filters) : [], [data, reviewed, filters]);
  if (!data) return <section className="content-panel"><p className="eyebrow">COACHING REVIEW</p><p className="body-copy" role="status">Loading coaching data…</p></section>;

  const o = data.overview;
  const summary = queueSummary(data.safety, reviewed);
  const coaches = [...data.coaches].sort((a, b) => b.goalScore - a.goalScore);
  const coach = data.coaches.find(c => c.id === coachId);
  const top = coaches.slice(0, 3), bottom = coaches.filter(c => c.tier === "Support suggested");
  const engagementLow = data.engagement[0], engagementHigh = data.engagement[data.engagement.length - 1];
  const scaleGap = data.raters.scales.reduce((s, r) => s + (r.meanA - r.meanB), 0) / data.raters.scales.length;
  const weakest = [...data.raters.checklist].sort((a, b) => a.kappa - b.kappa).slice(0, 2);
  const categories = [...new Set(data.safety.map(s => s.category))].sort();
  const coachName = (id: string) => data.coaches.find(c => c.id === id)?.name ?? id;

  return <section className="content-panel coaching-review">
    <div className="section-heading"><div><p className="eyebrow">STARTS COACHING PROGRAM · DATA REVIEW</p><h2>What the coaching data is saying.</h2></div><span className="soft-tag">Synthetic data · not real participants</span></div>
    <p className="body-copy">{o.participants.toLocaleString()} cancer survivors, {o.coaches} coaches, {o.programWeeks}-week program with {o.callsPerParticipant} calls each. Built from {o.calls.toLocaleString()} calls ({o.transcriptLines.toLocaleString()} transcript lines, {o.labelledCalls.toLocaleString()} MI-labelled), {o.textMessages.toLocaleString()} texts, {o.supervisorRatedCalls} double-rated calls and the expert-annotated AnnoMI benchmark. Associations across coaches do not establish causality.</p>
    <div className="impact-stages"><div><strong>{pct(o.completionRate)}</strong><span>completed all {o.callsPerParticipant} calls</span></div><div><strong>{pct(o.goalFullyMet)}</strong><span>weekly goals fully met</span></div><div><strong>{bottom.length}</strong><span>coaches flagged for support</span></div><div><strong>{summary.openNotEscalated}</strong><span>unescalated safety items open</span></div></div>
    <div className="capability-result"><p className="eyebrow">KEY FINDINGS</p><ul>
      <li><strong>Coaching skill is the strongest signal.</strong> Across coaches, reflections per question correlate {data.correlations.reflectionToQuestion.toFixed(2)} with participant goal score and supervisor ratings {data.correlations.supervisorOverall.toFixed(2)}. {top.map(c => c.name).join(", ")} sit near expert high-quality MI; {bottom.map(c => c.name).join(" and ")} sit near low-quality MI.</li>
      <li><strong>Outcomes are equitable.</strong> Completion and goal scores are similar across language, race/ethnicity, sex, age and cancer type; {o.languageMismatches === 0 ? "every participant has a coach who speaks their call language" : `${o.languageMismatches} participants lack a language-matched coach`}.</li>
      <li><strong>Text replies predict dropout.</strong> {pct(engagementLow.completionRate)} of the least-responsive quarter completed the program versus {pct(engagementHigh.completionRate)} of the most responsive.</li>
      <li><strong>{summary.notEscalated} of {summary.total} risk disclosures were not escalated</strong> in the next coach reply; {summary.unlabelled} disclosures sit in unlabelled data no reviewer has seen.</li>
      <li><strong>Supervisors need calibration.</strong> {data.raters.names[1]} scores {scaleGap.toFixed(1)} points lower than {data.raters.names[0]} on average; weakest checklist agreement: {weakest.map(w => `${w.item} (κ ${w.kappa.toFixed(2)})`).join(", ")}.</li>
    </ul></div>
    <div className="tabs" role="tablist" aria-label="Coaching review sections">{TABS.map(t => <button role="tab" key={t} aria-selected={tab === t} onClick={() => setTab(t)}>{t}{t === "Safety queue" && ` (${summary.openNotEscalated})`}</button>)}</div>

    {tab === "Coach review" && <div className="cr-panel">
      <div className="cr-table-wrap"><table className="cr-table"><thead><tr><th>Coach</th><th>Participants</th><th title="Reflections per question">Reflect : ask</th><th>Open Qs</th><th>Change talk</th><th>Supervisor /5</th><th>Goal score</th><th>Completion</th><th>Not escalated</th><th>Status</th></tr></thead><tbody>
        {coaches.map(c => <tr key={c.id} className={coachId === c.id ? "selected" : ""}><th scope="row"><button className="text-button" aria-pressed={coachId === c.id} onClick={() => setCoachId(coachId === c.id ? undefined : c.id)}>{c.name} <small>{c.id} · {c.role}</small></button></th><td>{c.participants}</td><td>{c.reflectionToQuestion.toFixed(2)}</td><td>{pct(c.openQuestionShare)}</td><td>{pct(c.changeTalkShare)}</td><td>{c.supervisorOverall.toFixed(1)}</td><td><Bar value={c.goalScore} label={`Goal score ${c.goalScore}`}/>{c.goalScore.toFixed(2)}</td><td>{pct(c.completionRate)}</td><td>{c.safetyNotEscalated}/{c.safetyDisclosures}</td><td><span className={`cr-tier tier-${c.tier.split(" ")[0].toLowerCase()}`}>{c.tier}</span></td></tr>)}
        <tr className="cr-benchmark"><th scope="row">AnnoMI high quality <small>{data.benchmark.high.sessions} expert-rated sessions</small></th><td>–</td><td>{data.benchmark.high.reflectionToQuestion.toFixed(2)}</td><td>{pct(data.benchmark.high.openQuestionShare)}</td><td>{pct(data.benchmark.high.changeTalkShare)}</td><td colSpan={5}>Benchmark</td></tr>
        <tr className="cr-benchmark"><th scope="row">AnnoMI low quality <small>{data.benchmark.low.sessions} expert-rated sessions</small></th><td>–</td><td>{data.benchmark.low.reflectionToQuestion.toFixed(2)}</td><td>{pct(data.benchmark.low.openQuestionShare)}</td><td>{pct(data.benchmark.low.changeTalkShare)}</td><td colSpan={5}>Benchmark</td></tr>
      </tbody></table></div>
      <p className="microcopy cr-note">Status: “Support suggested” when reflect : ask is below 0.50 or supervisor overall below 2.5; “Monitor” below 0.65 or 3.1, or when 40%+ of risk disclosures were not escalated. Goal score: yes = 1, partly = 0.5, no = 0. Select a coach for details.</p>
      {coach && <div className="influence-detail cr-coach"><p className="category">{coach.id} · {coach.role.toUpperCase()} · {coach.languages} · {coach.yearsExperience} YRS</p><h3>{coach.name}: {coach.tier}</h3><ul>{coachFindings(coach, data.benchmark).map(f => <li key={f}>{f}</li>)}</ul><div className="gap-callout"><p>Suggested next step: {coach.tier === "On track" ? "share recorded calls as peer-learning examples." : "schedule supervised MI practice and re-rate three calls next month."} Decisions about staff stay with program supervisors.</p></div></div>}
    </div>}

    {tab === "Safety queue" && <div className="cr-panel">
      <div className="gap-callout"><div><strong>Clinical, mental-health and social-need disclosures.</strong><p>Found by keyword matching across all calls and texts, including unlabelled data. “Not escalated” means the next coach reply did not mention the nurse line, care team, 911, social worker or food resources. A person must confirm each item; this is not a clinical determination.</p></div></div>
      <div className="cr-filters">
        <label>Status<select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value as QueueStatus })}>{["Needs review", "Reviewed", "All"].map(v => <option key={v}>{v}</option>)}</select></label>
        <label>Escalation<select value={filters.escalation} onChange={e => setFilters({ ...filters, escalation: e.target.value })}>{["Not escalated", "Escalated", "All"].map(v => <option key={v}>{v}</option>)}</select></label>
        <label>Channel<select value={filters.channel} onChange={e => setFilters({ ...filters, channel: e.target.value })}>{["All", "Call", "Text"].map(v => <option key={v}>{v}</option>)}</select></label>
        <label>Concern<select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>{["All", ...categories].map(v => <option key={v}>{v}</option>)}</select></label>
      </div>
      <p className="cr-count" role="status">{queue.length} item{queue.length === 1 ? "" : "s"} · {summary.reviewed} of {summary.total} reviewed · {notice}</p>
      <div className="evidence-list">{queue.map(item => <article key={item.id} className={item.escalated ? "" : "cr-alert"}>
        <span className="soft-tag">{item.category} · {item.escalated ? "Escalated" : "Not escalated"}{item.labelled ? " · Labelled" : " · Unlabelled"}</span>
        <h3>“{item.text}”</h3>
        <small>{item.channel} {item.source} · {item.date} · {item.language} · {item.participantId} · Coach {coachName(item.coachId)}{item.supervisorHandled ? ` · Supervisors: ${item.supervisorHandled === "yes" ? "handled" : "not handled"}` : ""}</small>
        <p><strong>Next coach reply{item.replyHours != null ? ` (${item.replyHours} h later)` : ""}:</strong> {item.coachReply || "No coach reply within 72 hours."}</p>
        <button className="text-button" aria-expanded={open === item.id} onClick={() => setOpen(open === item.id ? undefined : item.id)}>{open === item.id ? "Hide context" : "Show context"}</button>
        {open === item.id && <ol className="cr-context">{item.context.map((l, i) => <li key={i} className={l.flag ? "flag" : ""}><b>{l.speaker}</b> {l.text}</li>)}</ol>}
        <div className="cr-actions">{reviewed[item.id] ? <button className="secondary" onClick={() => mark(item.id, false)}>Reopen</button> : <button className="primary" onClick={() => mark(item.id, true)}>Mark reviewed</button>}</div>
      </article>)}</div>
      {queue.length === 0 && <div className="empty-state"><h3>Nothing matches these filters.</h3><p>Change the status or escalation filter to see other items.</p></div>}
    </div>}

    {tab === "Engagement & equity" && <div className="cr-panel cr-columns">
      <div><h3 className="subsection-title">Text replies and completion</h3><table className="cr-table"><thead><tr><th>Participants by replies</th><th>Avg replies</th><th>Completed</th><th>Goal score</th></tr></thead><tbody>{data.engagement.map(e => <tr key={e.band}><th scope="row">{e.band}</th><td>{e.avgReplies}</td><td><Bar value={e.completionRate} label={`${pct(e.completionRate)} completed`}/>{pct(e.completionRate)}</td><td>{e.goalScore.toFixed(2)}</td></tr>)}</tbody></table>
        <p className="body-copy">Participants who stop replying to texts are the ones who leave. A falling reply rate is an early, low-cost outreach trigger.</p>
        <h3 className="subsection-title">Goals fully met by week</h3><div className="cr-trend">{data.goalTrend.map(w => <div key={w.week} title={`Week ${w.week}: ${pct(w.fullyMet, 1)} of ${w.n}`}><i style={{ height: `${w.fullyMet * 200}px` }}/><span>{w.week}</span></div>)}</div><p className="microcopy cr-note">Week number · bar height = share of goals fully met ({pct(data.goalTrend[0].fullyMet)} → {pct(data.goalTrend[data.goalTrend.length - 1].fullyMet)}).</p>
      </div>
      <div><h3 className="subsection-title">Outcomes by group</h3><label className="field-label">Compare by<select value={dimension} onChange={e => setDimension(e.target.value)}>{Object.keys(data.equity).map(k => <option key={k}>{k}</option>)}</select></label><table className="cr-table"><thead><tr><th>{dimension}</th><th>n</th><th>Completed</th><th>Goal score</th></tr></thead><tbody>{data.equity[dimension].map(g => <tr key={g.group}><th scope="row">{g.group}</th><td>{g.n}</td><td><Bar value={g.completionRate} label={`${pct(g.completionRate)} completed`}/>{pct(g.completionRate)}</td><td>{g.goalScore.toFixed(2)}</td></tr>)}</tbody></table><p className="microcopy cr-note">Small groups (n &lt; 50) vary by chance; read them with care.</p>
        <h3 className="subsection-title">Goal topics</h3><table className="cr-table"><thead><tr><th>Topic</th><th>Weekly goals</th><th>Fully met</th></tr></thead><tbody>{data.topics.map(t => <tr key={t.topic}><th scope="row">{t.topic}</th><td>{t.goals.toLocaleString()}</td><td>{pct(t.fullyMet)}</td></tr>)}</tbody></table>
      </div>
    </div>}

    {tab === "Rater calibration" && <div className="cr-panel cr-columns">
      <div><h3 className="subsection-title">1–5 scales</h3><table className="cr-table"><thead><tr><th>Scale</th><th>{data.raters.names[0]}</th><th>{data.raters.names[1]}</th><th>Exact match</th><th>Within 1</th></tr></thead><tbody>{data.raters.scales.map(s => <tr key={s.item}><th scope="row">{s.item}</th><td>{s.meanA.toFixed(2)}</td><td>{s.meanB.toFixed(2)}</td><td>{pct(s.exact)}</td><td>{pct(s.withinOne)}</td></tr>)}</tbody></table></div>
      <div><h3 className="subsection-title">Checklist items</h3><table className="cr-table"><thead><tr><th>Item</th><th>Agreement</th><th>Cohen’s κ</th></tr></thead><tbody>{data.raters.checklist.map(c => <tr key={c.item}><th scope="row">{c.item}</th><td>{pct(c.agreement)}</td><td><Bar value={c.kappa} label={`kappa ${c.kappa}`}/>{c.kappa.toFixed(2)}</td></tr>)}</tbody></table><p className="body-copy">κ below 0.6 means the item definition needs a shared example set before ratings are used for coach feedback.</p></div>
    </div>}
    <p className="microcopy cr-note">{data.source}</p>
  </section>;
}
