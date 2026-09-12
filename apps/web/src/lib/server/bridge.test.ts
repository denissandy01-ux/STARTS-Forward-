import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DemoWorkplace } from "./demo-workplace";
import { FollowupService } from "./followups";
import { findPriority, priorities, projectDraft } from "../bridge";

test("Bridge proposals preserve priority, require review, and persist once across service restarts", async () => {
  const root = await mkdtemp(join(tmpdir(), "bridge-test-"));
  try {
    const workspace = new DemoWorkplace(join(root, "records"));
    const service = new FollowupService(workspace, join(root, "approvals"), Date.now, findPriority);
    for (const p of priorities) {
      const draft = projectDraft(p, "Accessible outreach");
      assert.ok(draft.details.length <= 4000);
      const proposal = await service.propose("browser-a", draft);
      assert.equal((await service.list(p.id)).length, 0);
      await assert.rejects(service.approve("browser-b", proposal.id), /another browser/);
      const task = await service.approve("browser-a", proposal.id);
      assert.match(task.description, /funding unconfirmed/);
      const restarted = new FollowupService(new DemoWorkplace(join(root, "records")), join(root, "approvals"), Date.now, findPriority);
      assert.equal((await restarted.approve("browser-a", proposal.id)).id, task.id);
      assert.deepEqual(await restarted.get(task.id), task);
      assert.equal((await restarted.list(p.id)).length, 1);
    }
    const declined = await service.propose("browser-a", { ...projectDraft(priorities[0]), title: "Decline this proposal" });
    await service.deny("browser-a", declined.id);
    await assert.rejects(service.approve("browser-a", declined.id), /declined/);
    assert.equal((await service.list(priorities[0].id)).length, 1);
    await assert.rejects(service.propose("browser-a", { ...projectDraft(priorities[0]), incidentId: "unknown" }), /Unknown community/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
