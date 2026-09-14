import type {
  CountryRequest,
  CountryUnit,
  EthicsPath,
  Programme,
  RequestStatus,
  Respondent,
} from "@/lib/objects";
import { uid } from "@/lib/utils";

export const ETHICS_ASK =
  "Confirm: (1) Was ethical or statistical approval required for the programme? (2) Was it obtained — letter on file? (3) Does this country office treat the evaluation the same way?";

export const REQUEST_SLA_HOURS = 48;

export const PATH_LABEL: Record<EthicsPath, string> = {
  UNKNOWN: "Unknown",
  NOT_REQUIRED: "Not required",
  REQUIRED: "Required",
  IN_PROCESS: "In process",
  CLEARED: "Cleared",
};

export function emptyCountry(name = "", icc = ""): CountryUnit {
  return {
    id: uid(),
    name,
    notes: "",
    focalPoint: "",
    focalRole: "",
    icc,
    heightenedScrutiny: false,
    scrutinyNote: "",
    path: "UNKNOWN",
    programmeApprovalRequired: "unknown",
    programmeApprovalObtained: "unknown",
    evaluationSameAsProgramme: "unknown",
    notRequiredConfirmedBy: "",
    notRequiredConfirmedAt: "",
    notRequiredAppliesTo: "",
    notRequiredNote: "",
    submittedAt: "",
    expectedDays: 45,
    letterName: "",
    letterDate: "",
    requests: [],
    respondents: [],
  };
}

export function emptyRespondent(): Respondent {
  return {
    id: uid(),
    group: "",
    role: "",
    programmeEngagement: "",
    contact: "",
  };
}

export function emptyRequest(asked: string, askedBy: string, askedTo: string): CountryRequest {
  return {
    id: uid(),
    asked,
    askedTo,
    askedBy,
    sentAt: "",
    dueAt: "",
    status: "draft",
    responseNote: "",
  };
}

export function respondentGaps(r: Respondent): string[] {
  const gaps: string[] = [];
  if (!r.group.trim()) gaps.push("stakeholder group");
  if (!r.role.trim()) gaps.push("role");
  if (!r.programmeEngagement.trim()) gaps.push("programme engagement");
  if (!r.contact.trim()) gaps.push("contact");
  return gaps;
}

export function respondentComplete(r: Respondent): boolean {
  return respondentGaps(r).length === 0;
}

export function notRequiredLegal(c: CountryUnit): { ok: boolean; gaps: string[] } {
  const gaps: string[] = [];
  if (c.heightenedScrutiny) {
    gaps.push(
      `${c.name} is flagged heightened scrutiny. The “not required” shortcut is closed. Use Required → In process → Cleared with a letter.`,
    );
    return { ok: false, gaps };
  }
  if (!c.notRequiredConfirmedBy.trim()) {
    gaps.push(`${c.name}: name who at the country office confirmed this is not required.`);
  }
  if (!c.notRequiredConfirmedAt.trim()) {
    gaps.push(`${c.name}: date of that confirmation.`);
  }
  if (c.notRequiredAppliesTo === "programme") {
    gaps.push(
      `${c.name}: “not required for the programme” is not evaluation clearance. The country office must confirm the evaluation, or both.`,
    );
  } else if (c.notRequiredAppliesTo !== "evaluation" && c.notRequiredAppliesTo !== "both") {
    gaps.push(`${c.name}: say whether the confirmation covers the evaluation, or both programme and evaluation.`);
  }
  return { ok: gaps.length === 0, gaps };
}

export function clearedLegal(c: CountryUnit): { ok: boolean; gaps: string[] } {
  if (c.letterName.trim()) return { ok: true, gaps: [] };
  return {
    ok: false,
    gaps: [`${c.name} cannot be Cleared without an approval letter on file.`],
  };
}

/** Field opens only on Cleared-with-letter or a legal Not-required for the evaluation. */
export function countryFieldOpen(c: CountryUnit): { ok: boolean; reason: string | null } {
  if (c.path === "UNKNOWN") {
    return { ok: false, reason: `${c.name} is UNKNOWN. No events until the ethics path is investigated.` };
  }
  if (c.path === "REQUIRED") {
    return { ok: false, reason: `${c.name} requires approval. Submit it; field stays closed.` };
  }
  if (c.path === "IN_PROCESS") {
    return {
      ok: false,
      reason: `${c.name} approval is in process (${c.expectedDays || 45}-day clock). No events until Cleared.`,
    };
  }
  if (c.path === "NOT_REQUIRED") {
    const g = notRequiredLegal(c);
    if (!g.ok) return { ok: false, reason: g.gaps[0] ?? `${c.name} Not required is not legal yet.` };
    return { ok: true, reason: null };
  }
  if (c.path === "CLEARED") {
    const g = clearedLegal(c);
    if (!g.ok) return { ok: false, reason: g.gaps[0] ?? `${c.name} Cleared has no letter.` };
    return { ok: true, reason: null };
  }
  return { ok: false, reason: `${c.name} has no ethics path.` };
}

export function liveRequestStatus(r: CountryRequest, now = Date.now()): RequestStatus {
  if (r.status === "draft" || r.status === "complete") return r.status;
  if (r.status === "incomplete") {
    if (r.dueAt && Date.parse(r.dueAt) < now) return "overdue";
    return "incomplete";
  }
  if (r.dueAt && Date.parse(r.dueAt) < now) return "overdue";
  return r.status === "overdue" ? "overdue" : "open";
}

export function hoursUntilDue(r: CountryRequest, now = Date.now()): number | null {
  if (!r.dueAt) return null;
  return Math.round((Date.parse(r.dueAt) - now) / 36e5);
}

export function reviewDeadline(c: CountryUnit): { label: string; overdue: boolean } | null {
  if (c.path !== "IN_PROCESS" || !c.submittedAt) return null;
  const start = Date.parse(c.submittedAt);
  if (Number.isNaN(start)) return null;
  const days = c.expectedDays > 0 ? c.expectedDays : 45;
  const end = start + days * 864e5;
  const remain = Math.ceil((end - Date.now()) / 864e5);
  if (remain >= 0) return { label: `${remain} day${remain === 1 ? "" : "s"} left on the ${days}-day review`, overdue: false };
  return { label: `${Math.abs(remain)} day${Math.abs(remain) === 1 ? "" : "s"} past the ${days}-day review`, overdue: true };
}

export function dueLabel(r: CountryRequest): string {
  const h = hoursUntilDue(r);
  if (h === null) return "No clock — still a draft";
  if (h >= 0) return `Due in ${h}h (48-hour SLA)`;
  return `Overdue ${Math.abs(h)}h`;
}

export function countryIcc(c: CountryUnit, defaultIcc: string): string {
  return c.icc.trim() || defaultIcc.trim();
}

export function stampSend(r: CountryRequest, askedTo: string, askedBy: string): CountryRequest {
  const sent = new Date();
  const due = new Date(sent.getTime() + REQUEST_SLA_HOURS * 36e5);
  return {
    ...r,
    askedTo: askedTo.trim() || r.askedTo,
    askedBy: askedBy.trim() || r.askedBy,
    sentAt: sent.toISOString(),
    dueAt: due.toISOString(),
    status: "open",
  };
}

export function mapCountry(countries: CountryUnit[], id: string, fn: (c: CountryUnit) => CountryUnit) {
  return countries.map((c) => (c.id === id ? fn(c) : c));
}

export function migrateCountry(raw: Record<string, unknown>): CountryUnit {
  const name = typeof raw.name === "string" ? raw.name : "";
  const icc = typeof raw.icc === "string" ? raw.icc : "";
  const base = emptyCountry(name, icc);
  if (typeof raw.id === "string") base.id = raw.id;

  if (typeof raw.path === "string") {
    return {
      ...base,
      ...pickCountry(raw),
      requests: Array.isArray(raw.requests) ? (raw.requests as CountryRequest[]) : [],
      respondents: Array.isArray(raw.respondents) ? (raw.respondents as Respondent[]) : [],
    };
  }

  const status = raw.status;
  let path: EthicsPath = "UNKNOWN";
  if (status === "CLEARED") path = "CLEARED";
  else if (status === "HOLD") path = "IN_PROCESS";

  return {
    ...base,
    notes: typeof raw.notes === "string" ? raw.notes : "",
    path,
    letterName: typeof raw.letterName === "string" ? raw.letterName : "",
    letterDate: typeof raw.letterDate === "string" ? raw.letterDate : "",
    notRequiredNote: typeof raw.waiver === "string" ? raw.waiver : "",
  };
}

function pickCountry(raw: Record<string, unknown>): Partial<CountryUnit> {
  const out: Partial<CountryUnit> = {};
  const strKeys = [
    "name",
    "notes",
    "focalPoint",
    "focalRole",
    "icc",
    "scrutinyNote",
    "notRequiredConfirmedBy",
    "notRequiredConfirmedAt",
    "notRequiredNote",
    "submittedAt",
    "letterName",
    "letterDate",
  ] as const;
  for (const k of strKeys) {
    if (typeof raw[k] === "string") (out as Record<string, string>)[k] = raw[k] as string;
  }
  if (typeof raw.heightenedScrutiny === "boolean") out.heightenedScrutiny = raw.heightenedScrutiny;
  if (typeof raw.path === "string") out.path = raw.path as EthicsPath;
  if (typeof raw.programmeApprovalRequired === "string") {
    out.programmeApprovalRequired = raw.programmeApprovalRequired as CountryUnit["programmeApprovalRequired"];
  }
  if (typeof raw.programmeApprovalObtained === "string") {
    out.programmeApprovalObtained = raw.programmeApprovalObtained as CountryUnit["programmeApprovalObtained"];
  }
  if (typeof raw.evaluationSameAsProgramme === "string") {
    out.evaluationSameAsProgramme = raw.evaluationSameAsProgramme as CountryUnit["evaluationSameAsProgramme"];
  }
  if (typeof raw.notRequiredAppliesTo === "string") {
    out.notRequiredAppliesTo = raw.notRequiredAppliesTo as CountryUnit["notRequiredAppliesTo"];
  }
  if (typeof raw.expectedDays === "number") out.expectedDays = raw.expectedDays;
  return out;
}

export function migrateProgramme(raw: Record<string, unknown>): Programme {
  const ethics = (raw.ethics ?? {}) as Record<string, unknown>;
  const field = (raw.field ?? {}) as Record<string, unknown>;
  const events = Array.isArray(field.events) ? field.events : [];
  return {
    ...(raw as unknown as Programme),
    defaultIcc: typeof raw.defaultIcc === "string" ? raw.defaultIcc : "",
    ethics: {
      protocols: Array.isArray(ethics.protocols) ? (ethics.protocols as Programme["ethics"]["protocols"]) : [],
      countries: Array.isArray(ethics.countries)
        ? ethics.countries.map((c) => migrateCountry((c ?? {}) as Record<string, unknown>))
        : [],
    },
    field: {
      events: events.map((e) => {
        const ev = (e ?? {}) as Record<string, unknown>;
        return {
          id: String(ev.id ?? uid()),
          title: String(ev.title ?? ""),
          method: String(ev.method ?? ""),
          countryId: String(ev.countryId ?? ""),
          respondentId: typeof ev.respondentId === "string" ? ev.respondentId : null,
          status: (ev.status === "blocked" || ev.status === "completed" ? ev.status : "planned") as
            | "planned"
            | "blocked"
            | "completed",
          blockedReason: typeof ev.blockedReason === "string" ? ev.blockedReason : null,
        };
      }),
    },
  };
}
