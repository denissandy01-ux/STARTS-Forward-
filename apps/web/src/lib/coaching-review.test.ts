import assert from "node:assert/strict";
import test from "node:test";
import raw from "./coaching-review-data.json";
import { coachFindings, filterQueue, queueSummary, type CoachingReviewData } from "./coaching-review";

const data = raw as unknown as CoachingReviewData;

test("coaching review data covers every coach and is internally consistent", () => {
  assert.equal(data.coaches.length, data.overview.coaches);
  assert.equal(data.coaches.reduce((s, c) => s + c.participants, 0), data.overview.participants);
  assert.equal(data.coaches.reduce((s, c) => s + c.calls, 0), data.overview.calls);
  for (const c of data.coaches) {
    assert.ok(c.goalScore >= 0 && c.goalScore <= 1);
    assert.ok(c.safetyNotEscalated <= c.safetyDisclosures);
    if (c.reflectionToQuestion < 0.5) assert.equal(c.tier, "Support suggested");
  }
  assert.ok(data.benchmark.high.reflectionToQuestion > data.benchmark.low.reflectionToQuestion);
});

test("safety queue lists unescalated items first and every item shows its flagged line", () => {
  const firstEscalated = data.safety.findIndex(s => s.escalated);
  assert.ok(firstEscalated > 0);
  assert.ok(data.safety.slice(firstEscalated).every(s => s.escalated));
  for (const s of data.safety) assert.equal(s.context.filter(l => l.flag).length, 1, s.id);
});

test("queue filters and summary respect review marks", () => {
  const target = data.safety[0];
  const reviewed = { [target.id]: true };
  const open = filterQueue(data.safety, reviewed, { status: "Needs review", channel: "All", category: "All", escalation: "Not escalated" });
  assert.ok(!open.some(s => s.id === target.id));
  assert.ok(open.every(s => !s.escalated));
  const done = filterQueue(data.safety, reviewed, { status: "Reviewed", channel: "All", category: "All", escalation: "All" });
  assert.deepEqual(done.map(s => s.id), [target.id]);
  const summary = queueSummary(data.safety, reviewed);
  assert.equal(summary.reviewed, 1);
  assert.equal(summary.openNotEscalated, summary.notEscalated - 1);
});

test("coach findings point low-skill coaches toward reflective practice", () => {
  const low = data.coaches.find(c => c.tier === "Support suggested")!;
  assert.match(coachFindings(low, data.benchmark)[0], /low-quality MI/);
});
