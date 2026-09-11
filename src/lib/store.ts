import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DESIGN_STAGES,
  EVALUATE_STAGES,
  type ChairId,
  type StageId,
} from "@/lib/aa-process";
import { autoEthics, autoInception, autoPurpose, autoToc } from "@/lib/auto";
import { draftHasSignal, extractLocal } from "@/lib/extract-local";
import type { ExtractedDraft } from "@/lib/extract-types";
import {
  canLogEvent,
  ethicsGate,
  inceptionAaGate,
  inceptionClientGate,
  purposeGate,
  tocGate,
} from "@/lib/gates";
import {
  emptyEthics,
  emptyField,
  emptyInception,
  emptyPurpose,
  emptyToc,
  type EthicsStatus,
  type Programme,
  type StageMeta,
} from "@/lib/objects";
import {
  EXAMPLE_DOCUMENTS,
  EXAMPLE_PROGRAMME,
  type DocumentKind,
  type SourceDoc,
} from "@/lib/source-pack";
import { uid } from "@/lib/utils";

function idleMeta(): StageMeta {
  return { state: "idle", mode: "manual", acceptedAt: null, acceptedBy: null };
}

function initialStages(): Programme["stages"] {
  const stages = {} as Programme["stages"];
  for (const s of [...DESIGN_STAGES, ...EVALUATE_STAGES]) {
    stages[s.id] = idleMeta();
  }
  return stages;
}

export function newProgramme(input: {
  name: string;
  client: string;
  period: string;
  walkAs: string;
  documents?: SourceDoc[];
}): Programme {
  return {
    id: uid(),
    name: input.name.trim(),
    client: input.client.trim(),
    period: input.period.trim(),
    walkAs: input.walkAs.trim() || "Altamont Advisory",
    documents: input.documents ?? [],
    stages: initialStages(),
    purpose: emptyPurpose(),
    toc: emptyToc(),
    inception: emptyInception(),
    ethics: emptyEthics(),
    field: emptyField(),
    chair: "design",
    stageId: "purpose",
  };
}

function working(meta: StageMeta, mode: StageMeta["mode"]): StageMeta {
  return { ...meta, state: meta.state === "accepted" ? "accepted" : "working", mode };
}

type DeskStore = {
  programmes: Programme[];
  notice: string | null;
  busy: boolean;
  createProgramme: (input: {
    name: string;
    client: string;
    period: string;
    walkAs: string;
  }) => string;
  createExample: () => string;
  removeProgramme: (id: string) => void;
  patchProgramme: (id: string, patch: Partial<Pick<Programme, "name" | "client" | "period" | "walkAs">>) => void;
  addDocument: (id: string, doc: Omit<SourceDoc, "id">) => void;
  updateDocument: (id: string, docId: string, patch: Partial<SourceDoc>) => void;
  removeDocument: (id: string, docId: string) => void;
  setChair: (id: string, chair: ChairId) => void;
  setStage: (id: string, stageId: StageId) => void;
  setNotice: (msg: string | null) => void;
  patchPurpose: (id: string, fn: (p: Programme["purpose"]) => Programme["purpose"]) => void;
  patchToc: (id: string, fn: (t: Programme["toc"]) => Programme["toc"]) => void;
  patchInception: (id: string, fn: (i: Programme["inception"]) => Programme["inception"]) => void;
  patchEthics: (id: string, fn: (e: Programme["ethics"]) => Programme["ethics"]) => void;
  automate: (id: string, stageId: StageId) => Promise<void>;
  accept: (id: string, stageId: StageId) => void;
  unlock: (id: string, stageId: StageId) => void;
  clientAcceptInception: (id: string) => void;
  setCountryStatus: (id: string, countryId: string, status: EthicsStatus) => void;
  attachLetter: (id: string, countryId: string, fileName: string) => void;
  setWaiver: (id: string, countryId: string, waiver: string) => void;
  logEvent: (id: string, title: string, method: string, countryId: string) => void;
  resetWalk: (id: string) => void;
};

function mapProg(
  programmes: Programme[],
  id: string,
  fn: (p: Programme) => Programme,
): Programme[] {
  return programmes.map((p) => (p.id === id ? fn(p) : p));
}

function find(programmes: Programme[], id: string) {
  return programmes.find((p) => p.id === id);
}

export const useDesk = create<DeskStore>()(
  persist(
    (set, get) => ({
      programmes: [],
      notice: null,
      busy: false,
      createProgramme: (input) => {
        const p = newProgramme(input);
        set((s) => ({ programmes: [p, ...s.programmes], notice: null }));
        return p.id;
      },
      createExample: () => {
        const p = newProgramme({
          ...EXAMPLE_PROGRAMME,
          documents: EXAMPLE_DOCUMENTS.map((d) => ({ ...d, id: uid() })),
        });
        set((s) => ({
          programmes: [p, ...s.programmes],
          notice: "Example documents loaded. This is a walk-through, not a live programme.",
        }));
        return p.id;
      },
      removeProgramme: (id) =>
        set((s) => ({ programmes: s.programmes.filter((p) => p.id !== id) })),
      patchProgramme: (id, patch) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({ ...p, ...patch })),
        })),
      addDocument: (id, doc) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            documents: [...p.documents, { ...doc, id: uid() }],
          })),
        })),
      updateDocument: (id, docId, patch) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            documents: p.documents.map((d) => (d.id === docId ? { ...d, ...patch } : d)),
          })),
        })),
      removeDocument: (id, docId) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            documents: p.documents.filter((d) => d.id !== docId),
          })),
        })),
      setChair: (id, chair) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            chair,
            stageId: chair === "design" ? "purpose" : "inception",
          })),
          notice: null,
        })),
      setStage: (id, stageId) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({ ...p, stageId })),
          notice: null,
        })),
      setNotice: (notice) => set({ notice }),
      patchPurpose: (id, fn) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            purpose: fn(p.purpose),
            stages: { ...p.stages, purpose: working(p.stages.purpose, "manual") },
          })),
        })),
      patchToc: (id, fn) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            toc: fn(p.toc),
            stages: { ...p.stages, toc: working(p.stages.toc, "manual") },
          })),
        })),
      patchInception: (id, fn) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            inception: fn(p.inception),
            stages: { ...p.stages, inception: working(p.stages.inception, "manual") },
          })),
        })),
      patchEthics: (id, fn) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            ethics: fn(p.ethics),
            stages: { ...p.stages, protocols: working(p.stages.protocols, "manual") },
          })),
        })),
      automate: async (id, stageId) => {
        const p = find(get().programmes, id);
        if (!p) return;
        if (p.stages[stageId].state === "accepted") {
          set({ notice: "Unlock this stage before Auto can draft." });
          return;
        }
        const docs = p.documents.filter((d) => d.body.trim());
        if (docs.length === 0) {
          set({
            notice:
              "Add at least one source document with text on this programme, or do this step myself.",
          });
          return;
        }
        if (stageId === "toc" && p.stages.purpose.state !== "accepted") {
          set({ notice: "Accept Purpose, users, and decisions first." });
          return;
        }
        if (stageId === "inception" && p.stages.toc.state !== "accepted") {
          set({
            notice:
              "Accept the theory of change and results framework first. Inception confirms that design.",
          });
          return;
        }
        if (stageId === "protocols" && !p.inception.clientAcceptedAt) {
          set({
            notice: "Client must Accept inception before protocols and ethics are drafted for field.",
          });
          return;
        }
        set({ busy: true, notice: "Reading this programme’s documents…" });
        const local = extractLocal(docs);
        if (!draftHasSignal(local)) {
          set({
            busy: false,
            notice:
              "The documents on this programme did not yield a draft. Add TOR / proposal / logframe text, or do this step myself.",
          });
          return;
        }
        const apply = (draft: ExtractedDraft, via: string) => {
          set({
            busy: false,
            programmes: mapProg(get().programmes, id, (prog) => {
              if (stageId === "purpose") {
                return {
                  ...prog,
                  purpose: autoPurpose(prog.purpose, draft),
                  stages: { ...prog.stages, purpose: working(prog.stages.purpose, "auto") },
                };
              }
              if (stageId === "toc") {
                return {
                  ...prog,
                  toc: autoToc(prog.toc, draft),
                  stages: { ...prog.stages, toc: working(prog.stages.toc, "auto") },
                };
              }
              if (stageId === "inception") {
                return {
                  ...prog,
                  inception: autoInception(prog.inception, draft),
                  stages: { ...prog.stages, inception: working(prog.stages.inception, "auto") },
                };
              }
              if (stageId === "protocols") {
                return {
                  ...prog,
                  ethics: autoEthics(prog.ethics, draft),
                  stages: { ...prog.stages, protocols: working(prog.stages.protocols, "auto") },
                };
              }
              return prog;
            }),
            notice:
              stageId === "protocols"
                ? `Sites from ${via} are OPEN. Auto will not mark Cleared. You Accept.`
                : `Drafted from ${via}. Appended — nothing overwritten. You Accept.`,
          });
        };
        apply(local, "this programme’s documents");

      },
      accept: (id, stageId) => {
        const p = find(get().programmes, id);
        if (!p) return;
        const walker = p.walkAs || "Altamont Advisory";
        const finish = (ok: boolean, gaps: string[]) => {
          if (!ok) {
            set({ notice: gaps[0] ?? "Not ready to Accept." });
            return;
          }
          set({
            programmes: mapProg(get().programmes, id, (prog) => ({
              ...prog,
              stages: {
                ...prog.stages,
                [stageId]: {
                  state: "accepted",
                  mode: prog.stages[stageId].mode,
                  acceptedAt: new Date().toISOString(),
                  acceptedBy: walker,
                },
              },
            })),
            notice: "Accepted. Auto did not do this.",
          });
        };
        if (stageId === "purpose") {
          finish(purposeGate(p.purpose).ok, purposeGate(p.purpose).gaps);
          return;
        }
        if (stageId === "toc") {
          if (p.stages.purpose.state !== "accepted") {
            set({ notice: "Accept Purpose first." });
            return;
          }
          finish(tocGate(p.toc).ok, tocGate(p.toc).gaps);
          return;
        }
        if (stageId === "inception") {
          if (p.stages.toc.state !== "accepted") {
            set({ notice: "Accept the theory of change first." });
            return;
          }
          const g = inceptionAaGate(p.inception);
          if (!g.ok) {
            set({ notice: g.gaps[0] });
            return;
          }
          set({
            programmes: mapProg(get().programmes, id, (prog) => ({
              ...prog,
              inception: {
                ...prog.inception,
                aaAcceptedAt: new Date().toISOString(),
                aaAcceptedBy: walker,
              },
              stages: {
                ...prog.stages,
                inception: {
                  state: "accepted",
                  mode: prog.stages.inception.mode,
                  acceptedAt: new Date().toISOString(),
                  acceptedBy: walker,
                },
              },
            })),
            notice:
              "AA Accepted the inception report. Fieldwork stays blocked until the client Accepts with a letter or dated note.",
          });
          return;
        }
        if (stageId === "protocols") {
          if (!p.inception.clientAcceptedAt) {
            set({ notice: "Client must Accept inception first." });
            return;
          }
          finish(ethicsGate(p.ethics).ok, ethicsGate(p.ethics).gaps);
        }
      },
      unlock: (id, stageId) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            stages: {
              ...p.stages,
              [stageId]: { ...p.stages[stageId], state: "working", acceptedAt: null, acceptedBy: null },
            },
            inception:
              stageId === "inception"
                ? {
                    ...p.inception,
                    aaAcceptedAt: null,
                    aaAcceptedBy: null,
                    clientAcceptedAt: null,
                    clientAcceptedBy: null,
                  }
                : p.inception,
          })),
          notice:
            stageId === "inception"
              ? "Unlocked. Client acceptance was cleared. Field stays closed until both Accepts are done again."
              : "Unlocked.",
        })),
      clientAcceptInception: (id) => {
        const p = find(get().programmes, id);
        if (!p) return;
        const g = inceptionClientGate(p.inception);
        if (!g.ok) {
          set({ notice: g.gaps[0] });
          return;
        }
        set({
          programmes: mapProg(get().programmes, id, (prog) => ({
            ...prog,
            inception: {
              ...prog.inception,
              clientAcceptedAt: new Date().toISOString(),
              clientAcceptedBy: prog.inception.clientName,
            },
          })),
          notice:
            "Client accepted inception. Protocols and ethics are now open. Fieldwork is still blocked until ethics is Accepted.",
        });
      },
      setCountryStatus: (id, countryId, status) => {
        const p = find(get().programmes, id);
        if (!p) return;
        const country = p.ethics.countries.find((c) => c.id === countryId);
        if (!country) return;
        if (status === "CLEARED") {
          const letter = country.letterName.trim();
          const waiver = country.waiver.trim().length >= 40;
          if (!letter && !waiver) {
            set({
              notice: `Cannot mark ${country.name} Cleared. Attach an approval letter or write a “not required” waiver.`,
            });
            return;
          }
        }
        set({
          programmes: mapProg(get().programmes, id, (prog) => ({
            ...prog,
            ethics: {
              ...prog.ethics,
              countries: prog.ethics.countries.map((c) =>
                c.id === countryId ? { ...c, status } : c,
              ),
            },
            stages: { ...prog.stages, protocols: working(prog.stages.protocols, "manual") },
          })),
          notice: null,
        });
      },
      attachLetter: (id, countryId, fileName) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            ethics: {
              ...p.ethics,
              countries: p.ethics.countries.map((c) =>
                c.id === countryId
                  ? {
                      ...c,
                      letterName: fileName,
                      letterDate: new Date().toISOString().slice(0, 10),
                    }
                  : c,
              ),
            },
            stages: { ...p.stages, protocols: working(p.stages.protocols, "manual") },
          })),
        })),
      setWaiver: (id, countryId, waiver) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            ethics: {
              ...p.ethics,
              countries: p.ethics.countries.map((c) =>
                c.id === countryId ? { ...c, waiver } : c,
              ),
            },
            stages: { ...p.stages, protocols: working(p.stages.protocols, "manual") },
          })),
        })),
      logEvent: (id, title, method, countryId) => {
        const p = find(get().programmes, id);
        if (!p) return;
        const gate = canLogEvent(p.ethics, p.inception, countryId);
        const country = p.ethics.countries.find((c) => c.id === countryId);
        const event = {
          id: uid(),
          title: title.trim() || `${method} — ${country?.name ?? "site"}`,
          method,
          countryId,
          status: (gate.ok ? "planned" : "blocked") as "planned" | "blocked",
          blockedReason: gate.reason,
        };
        set({
          programmes: mapProg(get().programmes, id, (prog) => ({
            ...prog,
            field: { events: [event, ...prog.field.events] },
          })),
          notice: gate.ok ? "Event planned." : gate.reason,
        });
      },
      resetWalk: (id) =>
        set((s) => ({
          programmes: mapProg(s.programmes, id, (p) => ({
            ...p,
            stages: initialStages(),
            purpose: emptyPurpose(),
            toc: emptyToc(),
            inception: emptyInception(),
            ethics: emptyEthics(),
            field: emptyField(),
            chair: "design",
            stageId: "purpose",
          })),
          notice:
            "Walk reset. Documents stay on this programme. Auto reads them. Nothing is Accepted.",
        })),
    }),
    {
      name: "aa-merl-programmes-v1",
      partialize: (s) => ({ programmes: s.programmes }),
    },
  ),
);

export function useProgramme(id: string | undefined) {
  return useDesk((s) => s.programmes.find((p) => p.id === id));
}

export type { DocumentKind };
