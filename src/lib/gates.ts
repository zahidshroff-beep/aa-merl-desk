import type {
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

export function countryClearedLegal(c: EthicsObject["countries"][number]): boolean {
  if (c.status !== "CLEARED") return true;
  const letter = c.letterName.trim().length > 0;
  const waiver = c.waiver.trim().length >= 40;
  return letter || waiver;
}

export function ethicsGate(e: EthicsObject): Gate {
  const gaps: string[] = [];
  if (e.countries.length < 1) gaps.push("Put the countries from this programme's documents on the dossier.");
  for (const c of e.countries) {
    if (c.status === "OPEN") {
      gaps.push(`${c.name} is still OPEN. Mark Hold or Cleared.`);
    }
    if (c.status === "CLEARED" && !countryClearedLegal(c)) {
      gaps.push(
        `${c.name} cannot be Cleared without an approval letter or a written “not required” waiver (40+ characters).`,
      );
    }
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
): { ok: boolean; reason: string | null } {
  if (!inception.clientAcceptedAt) {
    return { ok: false, reason: "Fieldwork is blocked until the client Accepts inception." };
  }
  const country = ethics.countries.find((c) => c.id === countryId);
  if (!country) return { ok: false, reason: "Unknown site." };
  if (country.status === "OPEN") {
    return { ok: false, reason: `${country.name} is OPEN. No events until Hold or Cleared.` };
  }
  if (country.status === "HOLD") {
    return { ok: false, reason: `${country.name} is on ethics HOLD. No new events.` };
  }
  if (country.status === "CLEARED" && !countryClearedLegal(country)) {
    return { ok: false, reason: `${country.name} was marked Cleared without a letter or waiver.` };
  }
  return { ok: true, reason: null };
}

export function fieldReady(ethics: EthicsObject, inception: InceptionObject, field: FieldObject) {
  return Boolean(inception.clientAcceptedAt) && ethicsGate(ethics).ok && field.events.length >= 0;
}
