import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Workplace, WorkplaceTask } from "./workplace";

/** Explicit local demo adapter. Uses the same approval service as Ambiguous. */
export class DemoWorkplace implements Workplace {
  constructor(private directory: string) {}
  async identity() { return { id: "local-demo", workspaceId: "starts-forward-demo", name: "Local prototype" }; }
  async list(marker: string) {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const files = (await readdir(this.directory)).filter(f => /^[a-f0-9-]{36}\.json$/.test(f));
    const records = await Promise.all(files.map(f => this.get(f.slice(0, -5))));
    return records.filter(r => r.description.includes(marker));
  }
  async get(id: string): Promise<WorkplaceTask> {
    z.uuid().parse(id);
    return JSON.parse(await readFile(join(this.directory, `${id}.json`), "utf8"));
  }
  async create(title: string, description: string, beforeWrite: () => Promise<void>) {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    await beforeWrite();
    const task = { id: randomUUID(), title, description, url: null };
    await writeFile(join(this.directory, `${task.id}.json`), JSON.stringify(task), { flag: "wx", mode: 0o600 });
    return task;
  }
}
