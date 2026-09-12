import assert from "node:assert/strict";
import test from "node:test";
import { analyzeCapability, capabilities, matchTeams, teams, influenceSteps } from "./ecosystem";
import { findPriority, priorities, projectDraft } from "./bridge";
const context = { priority: findPriority("GL-004"), teamId: "haiti", evidence: [], impacts: [], connections: {} };

test("cross-country matches exclude self, explain complementary skills, and surface Colombia and Rwanda", () => {
  const matches = matchTeams("haiti");
  assert.ok(!matches.some(m => m.team.id === "haiti"));
  assert.deepEqual(new Set(matches.slice(0,3).map(m=>m.team.id)), new Set(["colombia","rwanda","miami"]));
  for (const m of matches.slice(0,3)) {
    assert.equal(m.sharedTopic,true);
    assert.ok(m.skills.length > 0);
    assert.match(m.reason,/Offers/);
    assert.notEqual(m.team.country, "Haiti");
  }
  assert.throws(()=>matchTeams("not-a-team"),/existing demonstration/);
});
test("influence identifies the first unconfirmed connection, rather than assuming institutional access", () => {
  const empty = analyzeCapability("influence",context);
  assert.match(empty.findings[0],/Community evidence/);
  const next = analyzeCapability("influence",{...context, connections:{community:"Engaged",local:"Identified"}});
  assert.match(next.findings[0],/Local health system/);
  assert.equal(influenceSteps.length,7);
});
test("all nine capability previews preserve uncertainty and do not invent outcomes or opportunities",()=>{
  assert.equal(capabilities.length,9);
  for(const c of capabilities){const r=analyzeCapability(c.id,context); assert.equal(r.mode,"rule-based preview"); assert.ok(r.findings.length); assert.ok(r.nextAction);}
  assert.match(analyzeCapability("evidence",context).findings[0],/No evidence/);
  assert.match(analyzeCapability("impact",context).findings[0],/No outcomes/);
  assert.match(analyzeCapability("opportunity",context).findings.join(" "),/None|No grants/);
});
test("provided evidence and impact records keep source and user-reported status in analysis",()=>{
  const evidence=[{id:"a",title:"Referral notes",kind:"Aggregate observation",source:"Public summary",date:"2026-09-12",summary:"Illustrative observation",limitation:"Small convenience sample"}];
  const impacts=[{id:"i",indicator:"Paid roles",stage:"Implementation",baseline:0,current:2,unit:"roles",source:"Draft budget",date:"2026-09-12"}];
  assert.match(analyzeCapability("evidence",{...context,evidence}).findings[0],/Small convenience sample/);
  assert.match(analyzeCapability("impact",{...context,impacts}).findings[0],/user-reported/);
});
test("expanded priority charters remain within server limits including longest student notes",()=>{
  assert.equal(new Set(teams.map(t=>t.id)).size,teams.length);
  for(const p of priorities){const d=projectDraft(p,"x".repeat(500)); assert.ok(d.details.length<=4000,`${p.id}: ${d.details.length}`); assert.match(d.details,/paid position/); assert.match(d.details,/funding unconfirmed/);}
});
