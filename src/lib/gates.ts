import {
  clearedLegal,
  countryFieldOpen,
  notRequiredLegal,
  respondentComplete,
  respondentGaps,
} from "@/lib/country";
import type {
  CountryUnit,
  EthicsObject,
  FieldObject,
  InceptionObject,
  PurposeObject,
  TocObject,
} from "@/lib/objects";

export type Gate = { ok: boolean; gaps: string[] };

export function purposeGate(p: PurposeObject): Gate {
  const gaps: string[] = [];
  if (!p.primaryPurpose.trim()) gaps.push("Write the primary purpose.");
  const named = p.users.filter((u) => u.name.trim() && u.role.trim());
  if (named.length < 1) gaps.push("Name at least one user by name and role.");
  if (p.decisions.filter((d) => d.decision.trim()).length < 1) {
    gaps.push("Put at least one decision on the register.");
  }
  return { ok: gaps.length === 0, gaps };
}

export function tocGate(t: TocObject): Gate {
  const gaps: string[] = [];
  if (!t.narrative.trim()) gaps.push("Write the theory of change narrative.");
  if (t.assumptions.filter((a) => a.statement.trim()).length < 1) {
    gaps.push("Make at least one assumption explicit.");
  }
  if (t.framework.filter((r) => r.level === "output" && r.statement.trim()).length < 1) {
    gaps.push("Add at least one output row to the results framework.");
  }
  if (t.framework.filter((r) => r.level === "outcome" && r.statement.trim()).length < 1) {
    gaps.push("Add at least one outcome row to the results framework.");
  }
  return { ok: gaps.length === 0, gaps };
}

export function inceptionAaGate(i: InceptionObject): Gate {
  const gaps: string[] = [];
  const sections: [string, string][] = [
    ["TOR confirmation", i.torConfirmation],
    ["Questions", i.questions],
    ["Methodology", i.methodology],
    ["Sampling", i.sampling],
    ["Tools", i.tools],
    ["Workplan", i.workplan],
  ];
  for (const [label, body] of sections) {
    if (!body.trim()) gaps.push(`Fill the ${label} section.`);
  }
  return { ok: gaps.length === 0, gaps };
}

export function inceptionClientGate(i: InceptionObject): Gate {
  const gaps: string[] = [];
  if (!i.aaAcceptedAt) gaps.push("AA must Accept the inception report first.");
  if (!i.clientName.trim()) gaps.push("Name who accepted for the client.");
  if (i.clientEvidenceKind === "letter") {
    if (!i.clientLetterName.trim()) gaps.push("Attach the client acceptance letter (file name).");
  } else if (i.clientEvidenceKind === "dated_note") {
    if (i.clientEvidenceNote.trim().length < 24) {
      gaps.push("Write a dated note of client acceptance (who, when, what they accepted).");
    }
  } else {
    gaps.push("Record client acceptance as a letter or a dated note.");
  }
  return { ok: gaps.length === 0, gaps };
}

export function countryPathLegal(c: CountryUnit): Gate {
  if (c.path === "NOT_REQUIRED") return notRequiredLegal(c);
  if (c.path === "CLEARED") return clearedLegal(c);
  return { ok: true, gaps: [] };
}

export function ethicsGate(e: EthicsObject): Gate {
  const gaps: string[] = [];
  if (e.countries.length < 1) gaps.push("Put the countries from this programme's documents on the dossier.");
  for (const c of e.countries) {
    if (c.path === "UNKNOWN") {
      gaps.push(
        `${c.name} is still UNKNOWN. Investigate: was approval required for the programme, was it obtained, does the evaluation follow the same rule?`,
      );
    }
    const legal = countryPathLegal(c);
    if (!legal.ok) gaps.push(...legal.gaps);
  }
  if (e.protocols.filter((p) => p.method.trim() && p.instrument.trim()).length < 1) {
    gaps.push("Name at least one protocol (method + instrument).");
  }
  return { ok: gaps.length === 0, gaps };
}

export function canLogEvent(
  ethics: EthicsObject,
  inception: InceptionObject,
  countryId: string,
  respondentId: string | null,
  protocolsAccepted: boolean,
): { ok: boolean; reason: string | null } {
  if (!inception.clientAcceptedAt) {
    return { ok: false, reason: "Fieldwork is blocked until the client Accepts inception." };
  }
  if (!protocolsAccepted) {
    return { ok: false, reason: "Fieldwork is blocked until protocols and ethics are Accepted." };
  }
  const country = ethics.countries.find((c) => c.id === countryId);
  if (!country) return { ok: false, reason: "Unknown site." };
  const open = countryFieldOpen(country);
  if (!open.ok) return open;
  if (!respondentId) {
    return { ok: false, reason: `Name the respondent from the ${country.name} frame. Empty rows cannot be interviewed.` };
  }
  const person = country.respondents.find((r) => r.id === respondentId);
  if (!person) return { ok: false, reason: "That respondent is not on this country's frame." };
  if (!respondentComplete(person)) {
    const missing = respondentGaps(person).join(", ");
    return {
      ok: false,
      reason: `${person.role || person.group || "This row"} is incomplete (${missing}). Cannot schedule the KII.`,
    };
  }
  return { ok: true, reason: null };
}

export function fieldGate(ethics: EthicsObject, field: FieldObject): Gate {
  const gaps: string[] = [];
  const complete = ethics.countries.flatMap((c) => c.respondents.filter(respondentComplete));
  if (complete.length < 1) {
    gaps.push("Add at least one complete respondent (group, role, programme engagement, contact).");
  }
  if (field.events.filter((e) => e.status === "planned").length < 1) {
    gaps.push("Plan at least one field event against a complete respondent on an open site.");
  }
  return { ok: gaps.length === 0, gaps };
}
