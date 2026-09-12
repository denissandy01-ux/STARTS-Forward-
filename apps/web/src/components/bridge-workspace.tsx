"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { findPriority, priorities, partners, sources, phases, sdgNames, projectDraft } from "@/lib/bridge";
import { useWorkplace } from "@/lib/use-workplace";
import { BridgeAgent } from "./bridge-agent";
import { VisionSection, HubSection, CapabilityPanel, GlobalNetwork, EvidenceStudio, InfluenceLadder, PaidProjects, ImpactTracker } from "./ecosystem-panels";
import { analyzeCapability, getTeam, type CapabilityId, type CapabilityResult } from "@/lib/ecosystem";
import { useLearningWorkspace } from "@/lib/use-learning-workspace";

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2"/></>,
    book: <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1ZM12 5v15"/>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/><path d="m20 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    case: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12a24 24 0 0 0 18 0M10 13h4"/></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>;
}
function NetworkArt() { return <div className="network-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><svg viewBox="0 0 330 260"><path d="M165 133 74 52M165 133 281 84M165 133 248 222M165 133 54 202M74 52 281 84M54 202 248 222"/></svg><div className="network-center"><Icon name="spark" size={32}/></div>{["people", "book", "case", "globe"].map((n,i) => <div key={n} className={`network-node n${i+1}`}><Icon name={n}/></div>)}{["COMMUNITY", "KNOWLEDGE", "OPPORTUNITY", "SHARED IMPACT"].map((n,i) => <span key={n} className={`network-label l${i+1}`}>{n}</span>)}</div>; }

const navigationItems = [["Overview", "grid"], ["Global network", "globe"], ["Evidence studio", "book"], ["Intelligence", "spark"], ["Influence ladder", "arrow"], ["Paid projects", "case"], ["Impact tracker", "check"], ["Shared projects", "case"], ["Partner network", "people"], ["Career pathways", "globe"], ["Knowledge library", "book"]];

export function BridgeWorkspace({ live, storage, account }: { live: boolean; storage: string; account?: { name: string; key: string } }) {
  const [selectedId, setSelectedId] = useState<string>(priorities[0].id);
  const [teamId, setTeamId] = useState("haiti");
  const [analysis, setAnalysis] = useState<CapabilityResult>();
  const learning = useLearningWorkspace(selectedId, account?.key);
  const [view, setView] = useState("Overview");
  const [navigationReady, setNavigationReady] = useState(false);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const requestedView = query.get("view");
    if (navigationItems.some(([name]) => name === requestedView)) setView(requestedView!);
    const requestedPriority = query.get("priority");
    if (priorities.some(p => p.id === requestedPriority)) setSelectedId(requestedPriority!);
    const requestedTeam = query.get("team");
    if (requestedTeam) { try { getTeam(requestedTeam); setTeamId(requestedTeam); } catch { /* Ignore unknown IDs. */ } }
    setNavigationReady(true);
  }, []);
  useEffect(() => {
    if (!navigationReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set("view", view); url.searchParams.set("priority", selectedId); url.searchParams.set("team", teamId);
    window.history.replaceState(window.history.state, "", url);
  }, [view, selectedId, teamId, navigationReady]);
  const [tab, setTab] = useState("Community priority");
  const [notes, setNotes] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [demoAnswer, setDemoAnswer] = useState("");
  const [setupOpen, setSetupOpen] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string>();
  const workplace = useWorkplace(selectedId, storage);
  const priority = findPriority(selectedId);
  const proposalRef = useRef<HTMLDivElement>(null);
  const select = useCallback((id: string) => { findPriority(id); setSelectedId(id); setDemoAnswer(""); }, []);
  const showEvidence = useCallback(() => setView("Knowledge library"), []);
  useEffect(() => { if (workplace.proposal) proposalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [workplace.proposal]);
  useEffect(() => { setAnalysis(undefined); }, [view, selectedId, teamId, learning.evidence, learning.impacts, learning.connections]);
  const records = workplace.status?.status === "connected" ? workplace.status.tasks : [];
  const capabilityContext = { priority, teamId, evidence: learning.evidence, impacts: learning.impacts, connections: learning.connections };
  const runCapability = (id: CapabilityId) => { const result = analyzeCapability(id, capabilityContext); setAnalysis(result); return result; };
  const featureDraft = async (text: string, kind: "collaboration" | "influence" | "paid") => {
    if (preparing || workplace.busy) return;
    const topic = getTeam(teamId).topic;
    const p = kind === "paid" ? findPriority("GL-004") : kind === "collaboration" ? findPriority(topic === "Maternal health" ? "GL-004" : topic === "Digital inclusion" ? "SF-002" : "SF-003") : priority;
    select(p.id); setPreparing(true);
    try { const draft = projectDraft(p, text); await workplace.propose({ ...draft, title: `${kind === "paid" ? "Paid project" : kind === "influence" ? "Influence brief" : "Collaboration brief"} · ${p.short}` }); }
    catch { /* Existing hook displays errors. */ } finally { setPreparing(false); }
  };
  const prepare = async () => {
    if (preparing || workplace.busy) return;
    setPreparing(true);
    try { await workplace.propose(projectDraft(priority, notes)); } catch { /* Hook shows error. */ } finally { setPreparing(false); }
  };
  const demoRespond = (kind: string) => {
    setDemoAnswer(kind === "jobs" ? `For ${priority.short.toLowerCase()}, the sample pathway proposes ${priority.roles.join(", ")}. Each would be paid and supervised. Hosts, compensation and funding remain to be confirmed; these are not job openings.` : kind === "governance" ? "Use community review, aggregate data and named human accountability. Our curated UN, UNESCO and WHO source summaries guide this design; they do not certify it. Open the Knowledge library to inspect the sources." : `${priority.existing[0]} and ${priority.existing[1]} could share a delivery plan. ${priority.gap} First confirm the overlap and a receiving service owner with community representatives.`);
  };
  return <div className="sf-app">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="STARTS Forward home"><span className="brand-mark"><Icon name="spark" size={24}/></span><span>STARTS<span className="brand-forward">FORWARD</span></span></a>
      <div className="workspace-select"><span className="workspace-avatar">SF</span><div><strong>Global learning network</strong><small>First hub · South Florida</small></div></div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Workspace navigation">{navigationItems.map(([label, icon]) => <button key={label} className={`nav-item ${view === label ? "active" : ""}`} aria-current={view === label ? "page" : undefined} onClick={() => setView(label)}><Icon name={icon}/><span>{label}</span>{label === "Shared projects" && <span className="nav-count">{records.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="purpose-card"><span className="purpose-icon"><Icon name="globe" size={25}/></span><strong>Local action.<br/>Global possibility.</strong><p>Connecting the next generation to work that matters.</p><div className="sdg-stripe">{["#e5243b", "#dda63a", "#4c9f38", "#c5192d", "#ff3a21", "#26bde2", "#fcc30b", "#a21942", "#fd6925", "#dd1367", "#fd9d24", "#bf8b2e", "#3f7e44", "#0a97d9", "#56c02b", "#00689d", "#19486a"].map(c => <i key={c} style={{ background: c }}/>)}</div></div><button className="profile" onClick={() => setSetupOpen(true)}><span className="profile-avatar">ST</span><span><strong>{account?.name || "Student workspace"}</strong><small>Learn · Connect · Implement</small></span></button><a className="account-link" href={account ? "/auth/logout" : "/login"}>{account ? "Sign out" : "Sign in / Create account"}</a></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div><span className="breadcrumb">Workspace</span><span className="slash">/</span><span>{view}</span></div><button className="mode-pill" onClick={() => setSetupOpen(true)}><i/>{live ? "AI configured" : "Interactive demo"}<span>↗</span></button></header>
    <main className="main-content">
      <div className="page-heading"><div><p className="eyebrow">SCIENCE TO ACTION. TOGETHER.</p><h1>{view === "Overview" ? "Shared purpose. Collective progress." : view}</h1><p className="subtitle">{view === "Overview" ? "Your evidence. Our collective intelligence. Healthier systems." : "Move community priorities forward, together."}</p></div><span className="region-label"><Icon name="globe" size={16}/>South Florida ↔ Distributed global network</span></div>
      {view === "Overview" && <>
        <section className="hero"><div className="hero-copy"><span className="hero-kicker"><span/>STUDENT-LED · COMMUNITY-GROUNDED · GLOBALLY CONNECTED</span><h2>Your local insight.<br/>A world of possibility.</h2><p>Connect your research to people, paid experience<br className="desktop-break"/> and the institutions that can act on it.</p><button className="primary light" onClick={prepare} disabled={preparing || workplace.busy}>{preparing ? "Preparing project…" : "Build a shared project"}<Icon name="arrow" size={18}/></button></div><NetworkArt/></section>
        <div className="metrics"><div><span className="metric-icon mint"><Icon name="globe"/></span><div><strong>{String(priorities.length).padStart(2,"0")} <span>Health priorities</span></strong><small>Illustrative starting points</small></div></div><div><span className="metric-icon blue"><Icon name="people"/></span><div><strong>{String(partners.length).padStart(2,"0")} <span>Partner perspectives</span></strong><small>One collaborative approach</small></div></div><div><span className="metric-icon peach"><Icon name="case"/></span><div><strong>03 <span>Paid role concepts</span></strong><small>Per project · funding to confirm</small></div></div></div>
      </>}
      {view === "Overview" && <VisionSection navigate={setView}/>}
      {!["Overview", "Shared projects"].includes(view) && <div className="scope-bar"><label htmlFor="global-priority">Your active health problem</label><select id="global-priority" value={selectedId} onChange={e => select(e.target.value)}>{priorities.map(p => <option key={p.id} value={p.id}>{p.short}</option>)}</select><span>Evidence, connections and impact follow this priority.</span></div>}
      {view === "Global network" && <><GlobalNetwork teamId={teamId} setTeamId={setTeamId} onDraft={text => {void featureDraft(text,"collaboration");}}/><HubSection/></>}
      {view === "Evidence studio" && <EvidenceStudio key={priority.id} learning={learning} priority={priority}/>}
      {view === "Influence ladder" && <InfluenceLadder learning={learning} onDraft={text => {void featureDraft(text,"influence");}}/>}
      {view === "Paid projects" && <PaidProjects onDraft={text => {void featureDraft(text,"paid");}}/>}
      {view === "Impact tracker" && <ImpactTracker key={priority.id} learning={learning} priority={priority}/>}
      {(view === "Intelligence" || view === "Overview" || !!analysis) && <CapabilityPanel run={runCapability} result={analysis}/>}
      {(view === "Overview" || view === "Shared projects") && <div className="workspace-grid"><section className="priority-panel">
        <div className="section-heading"><div><p className="eyebrow">START WITH WHAT MATTERS</p><h2>{view === "Shared projects" ? "Your project workspace" : "A priority. A path forward."}</h2></div><span className="soft-tag">Synthetic CHNA scenario</span></div>
        <label className="field-label" htmlFor="priority-select">Community priority</label><select id="priority-select" value={selectedId} onChange={e => select(e.target.value)}>{priorities.map(p => <option key={p.id} value={p.id}>{p.short}</option>)}</select>
        <div className="tabs" role="tablist" aria-label="Priority details">{["Community priority", "Collaboration", "Career pathways"].map(t => <button role="tab" aria-selected={tab === t} key={t} onClick={() => setTab(t)}>{t}</button>)}</div>
        <div className="priority-content">
          {tab === "Community priority" && <><p className="category">{priority.category}</p><h3>{priority.title}</h3><p className="body-copy">{priority.summary}</p><div className="gap-callout"><Icon name="people" size={18}/><div><strong>The connection we can make</strong><p>{priority.gap}</p></div></div><p className="field-label">PROPOSED SDG ALIGNMENT</p><div className="sdg-chips">{priority.targets.map(t => <a key={t} href="https://sdgs.un.org/2030agenda" target="_blank" rel="noreferrer" title={sdgNames[t]}><span className={`sdg-square goal-${t.split(".")[0]}`}>{t.split(".")[0]}</span><span>{sdgNames[t]}<small>Target {t}</small></span></a>)}</div></>}
          {tab === "Collaboration" && <><p className="category">BUILD ON WHAT ALREADY EXISTS</p><h3>One plan. Complementary strengths.</h3><p className="body-copy">Review these illustrative initiatives together before launching something new.</p>{priority.existing.map((e, i) => <div className="initiative" key={e}><span>0{i + 1}</span><div><strong>{e}</strong><p>Scope, overlap and partner capacity to validate.</p></div></div>)}<div className="gap-callout"><Icon name="arrow"/><div><strong>Close the handoff</strong><p>Agree on a receiving service owner, acceptance criteria and how completed connections will be measured.</p></div></div></>}
          {tab === "Career pathways" && <><p className="category">LEARNING THAT LEADS TO WORK</p><h3>Build capability. Create opportunity.</h3><p className="body-copy">Three proposed paid roles bridge community work and service delivery. Funding, compensation and hosts are unconfirmed.</p>{priority.roles.map((role, i) => <div className="initiative" key={role}><span>0{i + 1}</span><div><strong>{role}</strong><p>Paid role concept · supervised learning · 90-day pilot</p></div></div>)}<p className="microcopy">Skills-based entry includes career changers. No live vacancies or hiring decisions.</p></>}
        </div><div className="priority-footer"><span><Icon name="shield" size={16}/>Community review comes first</span><button className="text-button" onClick={prepare} disabled={preparing || workplace.busy}>Draft project<Icon name="arrow" size={16}/></button></div>
      </section><section className="agent-panel"><header className="agent-heading"><span className="agent-avatar"><Icon name="spark" size={23}/></span><div><h2>STARTS Bridge</h2><p>Your collaboration partner</p></div><span className="agent-dot"/></header>{live ? <BridgeAgent priority={priority} workplace={workplace} select={select} showEvidence={showEvidence} capabilityContext={capabilityContext} onCapability={result => {setAnalysis(result);}}/> : <div className="demo-agent"><span className="demo-label">GUIDED DEMO · NO AI CALLS</span><h3>What can we move <br/>forward together?</h3><p>I can help you explore this sample priority and prepare a shared project for review.</p><div className="prompt-buttons">{[["connections", "Find collaboration opportunities", "people"], ["jobs", "Explore paid career pathways", "case"], ["governance", "Understand responsible AI", "shield"]].map(([kind, label, icon]) => <button key={kind} onClick={() => demoRespond(kind)}><Icon name={icon} size={17}/>{label}<span>↗</span></button>)}</div>{demoAnswer && <div className="demo-answer" role="status"><strong>Sample guidance</strong><p>{demoAnswer}</p></div>}<div className="notes-field"><label htmlFor="student-notes">Add your project focus <span>optional</span></label><textarea id="student-notes" maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. multilingual outreach, digital skills…" rows={2}/><button onClick={prepare} className="primary" disabled={preparing || workplace.busy}>{preparing ? "Preparing…" : "Prepare sample project"}<Icon name="arrow" size={16}/></button></div><button className="setup-link" onClick={() => setSetupOpen(true)}>Connect AI for an open-ended conversation ↗</button></div>}<footer className="agent-footer"><Icon name="book" size={14}/>Grounded in SDGs · UN, UNESCO & WHO guidance</footer></section></div>}
      {(workplace.error || workplace.notice) && <div className={`notice ${workplace.error ? "error" : ""}`} role={workplace.error ? "alert" : "status"}>{workplace.error || workplace.notice}</div>}
      {workplace.proposal && <div className="proposal-panel" ref={proposalRef}><div className="section-heading"><div><p className="eyebrow">YOUR REVIEW IS THE NEXT STEP</p><h2>{workplace.proposal.title}</h2></div><span className="soft-tag">Pending approval</span></div><p className="body-copy">Prepared for {findPriority(workplace.proposal.incidentId).short}. Saving records this proposal in {storage}; it does not commit funding, hiring or partners.</p><details open><summary>Review the complete project charter</summary><pre>{workplace.proposal.description.split("\n\nSample context:")[0]}</pre></details><div className="approval-actions"><button className="secondary" disabled={workplace.busy} onClick={workplace.deny}>Decline</button><button className="primary" disabled={workplace.busy} onClick={workplace.approve}>{workplace.busy ? "Working…" : `Approve & save ${storage === "local demo" ? "locally" : "to Ambiguous"}`}<Icon name="check" size={17}/></button></div><p className="microcopy">Review expires after 10 minutes. Proposal fields are fixed for this approval.</p></div>}
      {view === "Shared projects" && <section className="content-panel"><div className="section-heading"><div><p className="eyebrow">APPROVED PROPOSALS</p><h2>Saved for {priority.short.toLowerCase()}</h2></div><button className="secondary" onClick={() => workplace.refresh().catch(() => {})}>Refresh records</button></div>{records.length === 0 ? <div className="empty-state"><Icon name="case" size={32}/><h3>Your first shared project starts here.</h3><p>Prepare a proposal above, review it, then approve its save.</p></div> : records.map(r => <article className="saved-record" key={r.id}><span className="saved-check"><Icon name="check"/></span><div><h3>{r.title}</h3><p>Retrieved from {storage} · {r.id}</p><button className="text-button" onClick={() => setExpandedRecord(expandedRecord === r.id ? undefined : r.id)}>{expandedRecord === r.id ? "Hide charter" : "Read saved charter"}</button>{expandedRecord === r.id && <pre>{r.description.split("\n\nSample context:")[0]}</pre>}{r.url && <a href={r.url} target="_blank" rel="noreferrer">Open provider record ↗</a>}</div></article>)}</section>}
      {view === "Partner network" && <section className="content-panel"><p className="eyebrow">COMPLEMENTARY STRENGTHS</p><h2>A coalition built around community.</h2><p className="body-copy">Illustrative partner types, not confirmed institutions or endorsements. Begin with shared ownership and verify capacity together.</p><div className="partner-grid">{partners.map(p => <article className="partner-card" key={p.name}><span className="partner-avatar">{p.initials}</span><p className="category">{p.type}</p><h3>{p.name}</h3><p>{p.contribution}</p><span className="soft-tag">Participation to confirm</span></article>)}</div></section>}
      {view === "Career pathways" && <section className="content-panel"><p className="eyebrow">FROM LEARNING TO LIVELIHOODS</p><h2>Experience with a path forward.</h2><p className="body-copy">Proposed roles for {priority.project}. Every pathway needs compensation, an accountable supervisor, practical evidence of skills and a continuation plan.</p><div className="career-grid">{priority.roles.map((r, i) => <article className="career-card" key={r}><span className="metric-icon peach"><Icon name="case"/></span><span className="category">PATHWAY 0{i + 1}</span><h3>{r}</h3><p>{["Translate community insight into usable, responsibly managed evidence.", "Connect residents and teams to practical support and services.", "Help partners turn a pilot into a repeatable delivery process."][i]}</p><dl><div><dt>Format</dt><dd>Paid, supervised pilot</dd></div><div><dt>Funding</dt><dd>To confirm</dd></div><div><dt>Entry</dt><dd>Skills-based assessment</dd></div></dl></article>)}</div><div className="gap-callout"><Icon name="people"/><div><strong>Decent work is part of the outcome.</strong><p>Track proposed, funded, filled and retained roles separately. Training completion is not employment.</p></div></div></section>}
      {view === "Knowledge library" && <section className="content-panel"><p className="eyebrow">EVIDENCE YOU CAN INSPECT</p><h2>A shared foundation for responsible action.</h2><p className="body-copy">Curated summaries with official source links. This prototype does not retrieve full documents or live updates. Reviewed September 12, 2026.</p><div className="source-grid">{sources.map(s => <a className="source-card" key={s.id} href={s.url} target="_blank" rel="noreferrer"><div><span className="category">{s.publisher}</span><span>↗</span></div><h3>{s.title}</h3><p>{s.summary}</p><footer><span>{s.year}</span><span>{s.tags[0]}</span></footer></a>)}</div><div className="gap-callout"><Icon name="shield"/><div><strong>Guidance informs decisions. People remain accountable.</strong><p>These sources do not confer UN endorsement or certification. Local requirements and institutional review still apply.</p></div></div></section>}
      {view === "Overview" && <section className="journey"><div className="section-heading"><div><p className="eyebrow">A PRACTICAL PATH TO IMPACT</p><h2>From shared insight to sustained action.</h2></div><span className="microcopy">An illustrative 90-day journey</span></div><div className="phase-grid">{phases.map((p, i) => <article key={p.title}><div className="phase-top"><span>0{i + 1}</span><i/></div><p className="category">{p.time}</p><h3>{p.title}</h3><p>{p.detail}</p></article>)}</div></section>}
      {view === "Overview" && <HubSection/>}
      <footer className="page-footer"><span>STARTS FORWARD <b>·</b> Community-led. Opportunity-driven.</span><span>Synthetic data · No institutional affiliations implied</span></footer>
    </main></div>
    {setupOpen && <div className="modal-backdrop" onClick={() => setSetupOpen(false)}><section className="setup-modal" role="dialog" aria-modal="true" aria-labelledby="setup-title" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === "Escape") setSetupOpen(false); }}><button className="close-button" autoFocus aria-label="Close setup" onClick={() => setSetupOpen(false)}><Icon name="close"/></button><span className="agent-avatar"><Icon name="spark"/></span><h2 id="setup-title">Your prototype, ready to connect.</h2><p>AI: <strong>{live ? "Provider configured" : "Guided demo (no model calls)"}</strong><br/>Project storage: <strong>{storage}</strong></p><p>The demo uses predefined guidance and saves approved records on this computer. For live AI, add your provider key to the root <code>.env</code> file and restart.</p><pre>MODEL_PROVIDER=openai{"\n"}OPENAI_API_KEY=your-key{"\n"}MODEL=your-accessible-model</pre><p>Optionally set <code>AMBIGUOUS_API_KEY</code> to save to your connected workspace. Local demo records are kept separately.</p><p className="microcopy">Keep keys server-side. This local prototype has no multi-user authentication and is not ready for public hosting.</p></section></div>}
  </div>;
}
