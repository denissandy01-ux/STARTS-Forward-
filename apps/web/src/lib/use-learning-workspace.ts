"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import type { EvidenceItem, ImpactItem } from "./ecosystem";
const text = z.string().trim().min(1).max(2000);
const evidenceSchema = z.object({ id: text, title: text, kind: text, source: text, date: text, summary: text, limitation: text });
const impactSchema = z.object({ id: text, indicator: text, stage: text, baseline: z.number().finite(), current: z.number().finite(), unit: text, source: text, date: text });
const recordSchema = z.object({ evidence: z.array(evidenceSchema).max(100), impacts: z.array(impactSchema).max(100), connections: z.record(z.string(), z.enum(["Not connected", "Identified", "Engaged", "Acted"])) });
const workspaceSchema = z.record(z.string(), recordSchema);
const EMPTY = { evidence: [] as EvidenceItem[], impacts: [] as ImpactItem[], connections: {} as Record<string, "Not connected" | "Identified" | "Engaged" | "Acted"> };
export function useLearningWorkspace(priorityId: string, accountKey?: string) {
  const storageKey = accountKey ? `starts-learning-workspace-v1:${accountKey}` : "starts-learning-workspace-v1";
  const [all, setAll] = useState<z.infer<typeof workspaceSchema>>({});
  const [ready, setReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState("Loading local learning workspace…");
  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw) setAll(workspaceSchema.parse(JSON.parse(raw))); setReady(true); }
    catch { setStorageNotice("Local workspace could not be read. Existing stored data has been preserved; reload after checking browser storage."); }
  }, [storageKey]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(all)); setStorageNotice("Learning notes saved in this browser only · user-reported, not independently verified"); }
    catch { setStorageNotice("Browser storage is unavailable. Changes remain in memory and will be lost on reload."); }
  }, [all, ready, storageKey]);
  const record = all[priorityId] || EMPTY;
  return { ...record, ready, storageNotice,
    addEvidence(item: EvidenceItem) { const value = evidenceSchema.parse(item); if (record.evidence.length >= 100) throw new Error("Evidence limit reached."); setAll(prev => { const old = prev[priorityId] || EMPTY; return { ...prev, [priorityId]: { ...old, evidence: [...old.evidence, value].slice(0,100) } }; }); },
    addImpact(item: ImpactItem) { const value = impactSchema.parse(item); if (record.impacts.length >= 100) throw new Error("Impact limit reached."); setAll(prev => { const old = prev[priorityId] || EMPTY; return { ...prev, [priorityId]: { ...old, impacts: [...old.impacts, value].slice(0,100) } }; }); },
    setConnection(id: string, status: "Not connected" | "Identified" | "Engaged" | "Acted") { setAll(prev => { const old = prev[priorityId] || EMPTY; return { ...prev, [priorityId]: { ...old, connections: { ...old.connections, [id]: status } } }; }); },
  };
}
export type LearningWorkspace = ReturnType<typeof useLearningWorkspace>;
