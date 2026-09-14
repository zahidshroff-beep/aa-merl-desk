import { emptyCountry, emptyRequest, ETHICS_ASK } from "@/lib/country";
import type { ExtractedDraft } from "@/lib/extract-types";
import { uid } from "@/lib/utils";
import type {
  AssumptionRow,
  DecisionRow,
  EthicsObject,
  FrameworkRow,
  InceptionObject,
  OrphanRow,
  PurposeObject,
  TocObject,
  UserRow,
} from "@/lib/objects";

function missing<T extends { id?: string }>(
  existing: T[],
  incoming: Omit<T, "id">[],
  key: (row: Omit<T, "id">) => string,
): T[] {
  const have = new Set(existing.map((row) => key(row)).filter(Boolean));
  return incoming
    .filter((row) => {
      const k = key(row);
      return k.length > 0 && !have.has(k);
    })
    .map((row) => ({ ...row, id: uid() }) as T);
}

function str(v: unknown) {
  return typeof v === "string" ? v : "";
}

/** Merge a draft extracted from THIS programme's documents. Appends. Never Accepts. Never marks ethics Cleared. */
export function autoPurpose(current: PurposeObject, draft: ExtractedDraft): PurposeObject {
  const users = (draft.users ?? []).filter((u) => str(u.name));
  const decisions = (draft.decisions ?? []).filter((d) => str(d.decision));
  const orphans = (draft.doNotCollect ?? []).filter((o) => str(o.datum));
  return {
    primaryPurpose: current.primaryPurpose.trim() || str(draft.primaryPurpose),
    users: [
      ...current.users,
      ...missing<UserRow>(current.users, users, (u) => u.name.trim().toLowerCase()),
    ],
    decisions: [
      ...current.decisions,
      ...missing<DecisionRow>(
        current.decisions,
        decisions,
        (d) => d.decision.trim().toLowerCase(),
      ),
    ],
    doNotCollect: [
      ...current.doNotCollect,
      ...missing<OrphanRow>(
        current.doNotCollect,
        orphans,
        (o) => o.datum.trim().toLowerCase(),
      ),
    ],
  };
}

export function autoToc(current: TocObject, draft: ExtractedDraft): TocObject {
  const assumptions = (draft.assumptions ?? []).filter((a) => str(a.statement));
  const framework = (draft.framework ?? []).filter((r) => str(r.statement));
  return {
    narrative: current.narrative.trim() || str(draft.tocNarrative),
    assumptions: [
      ...current.assumptions,
      ...missing<AssumptionRow>(
        current.assumptions,
        assumptions,
        (a) => a.statement.trim().toLowerCase(),
      ),
    ],
    framework: [
      ...current.framework,
      ...missing<FrameworkRow>(
        current.framework,
        framework,
        (r) => r.statement.trim().toLowerCase(),
      ),
    ],
  };
}

export function autoInception(current: InceptionObject, draft: ExtractedDraft): InceptionObject {
  const fill = (cur: string, next: string) => (cur.trim() ? cur : str(next));
  const inc = draft.inception ?? {
    torConfirmation: "",
    questions: "",
    methodology: "",
    sampling: "",
    tools: "",
    workplan: "",
  };
  return {
    ...current,
    torConfirmation: fill(current.torConfirmation, inc.torConfirmation),
    questions: fill(current.questions, inc.questions),
    methodology: fill(current.methodology, inc.methodology),
    sampling: fill(current.sampling, inc.sampling),
    tools: fill(current.tools, inc.tools),
    workplan: fill(current.workplan, inc.workplan),
  };
}

/**
 * Add countries from this programme's documents as UNKNOWN.
 * Draft the three ethics questions as unsent requests.
 * Never marks Cleared or Not required. Never sets or unsets heightened scrutiny.
 */
export function autoEthics(current: EthicsObject, draft: ExtractedDraft, icc = ""): EthicsObject {
  const have = new Set(current.countries.map((c) => c.name.trim().toLowerCase()));
  const incoming = (draft.countries ?? [])
    .filter((c) => str(c.name) && !have.has(c.name.trim().toLowerCase()))
    .map((c) => {
      const unit = emptyCountry(c.name, icc);
      unit.notes = str(c.notes);
      unit.requests = [emptyRequest(ETHICS_ASK, icc, "")];
      return unit;
    });

  const countries = [...current.countries, ...incoming].map((c) => {
    const hasAsk = c.requests.some((r) => r.asked.trim() === ETHICS_ASK);
    if (hasAsk) return c;
    return {
      ...c,
      requests: [...c.requests, emptyRequest(ETHICS_ASK, c.icc || icc, c.focalPoint)],
    };
  });

  const haveMethod = new Set(current.protocols.map((p) => p.method.trim().toLowerCase()));
  const protocols = [
    ...current.protocols,
    ...(draft.methods ?? [])
      .filter((m) => str(m) && !haveMethod.has(m.toLowerCase()))
      .map((method) => ({
        id: uid(),
        method,
        instrument: `${method} instrument — draft from this programme's documents`,
        consentScript: !/secondary|mis/i.test(method),
      })),
  ];
  return { countries, protocols };
}
