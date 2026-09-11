import type { ChairId, StageId, StageState } from "@/lib/aa-process";
import type { SourceDoc, SourceHit } from "@/lib/source-pack";

export type UserRow = {
  id: string;
  name: string;
  role: string;
  organisation: string;
  usesDataFor: string;
  source?: SourceHit;
};

export type DecisionRow = {
  id: string;
  decision: string;
  who: string;
  when: string;
  dataNeeded: string;
  source?: SourceHit;
};

export type OrphanRow = {
  id: string;
  datum: string;
  reason: string;
  source?: SourceHit;
};

export type PurposeObject = {
  primaryPurpose: string;
  users: UserRow[];
  decisions: DecisionRow[];
  doNotCollect: OrphanRow[];
};

export type AssumptionRow = {
  id: string;
  statement: string;
  testHow: string;
  source?: SourceHit;
};

export type FrameworkLevel = "impact" | "outcome" | "output" | "activity";

export type FrameworkRow = {
  id: string;
  level: FrameworkLevel;
  statement: string;
  indicator: string;
  source?: SourceHit;
};

export type TocObject = {
  narrative: string;
  assumptions: AssumptionRow[];
  framework: FrameworkRow[];
};

export type InceptionObject = {
  torConfirmation: string;
  questions: string;
  methodology: string;
  sampling: string;
  tools: string;
  workplan: string;
  aaAcceptedAt: string | null;
  aaAcceptedBy: string | null;
  clientName: string;
  clientAcceptedAt: string | null;
  clientAcceptedBy: string | null;
  clientEvidenceKind: "letter" | "dated_note" | null;
  clientEvidenceNote: string;
  clientLetterName: string;
};

export type EthicsStatus = "OPEN" | "HOLD" | "CLEARED";

export type ProtocolRow = {
  id: string;
  method: string;
  instrument: string;
  consentScript: boolean;
};

export type CountryEthics = {
  id: string;
  name: string;
  notes: string;
  status: EthicsStatus;
  letterName: string;
  letterDate: string;
  waiver: string;
  irbRequired: boolean;
};

export type EthicsObject = {
  countries: CountryEthics[];
  protocols: ProtocolRow[];
};

export type FieldEvent = {
  id: string;
  title: string;
  method: string;
  countryId: string;
  status: "planned" | "blocked" | "completed";
  blockedReason: string | null;
};

export type FieldObject = {
  events: FieldEvent[];
};

export type StageMeta = {
  state: StageState;
  mode: "auto" | "manual";
  acceptedAt: string | null;
  acceptedBy: string | null;
};

export type DeskState = {
  stages: Record<StageId, StageMeta>;
  purpose: PurposeObject;
  toc: TocObject;
  inception: InceptionObject;
  ethics: EthicsObject;
  field: FieldObject;
};

export type Programme = DeskState & {
  id: string;
  name: string;
  client: string;
  period: string;
  walkAs: string;
  documents: SourceDoc[];
  chair: ChairId;
  stageId: StageId;
};

export function emptyPurpose(): PurposeObject {
  return { primaryPurpose: "", users: [], decisions: [], doNotCollect: [] };
}

export function emptyToc(): TocObject {
  return { narrative: "", assumptions: [], framework: [] };
}

export function emptyInception(): InceptionObject {
  return {
    torConfirmation: "",
    questions: "",
    methodology: "",
    sampling: "",
    tools: "",
    workplan: "",
    aaAcceptedAt: null,
    aaAcceptedBy: null,
    clientName: "",
    clientAcceptedAt: null,
    clientAcceptedBy: null,
    clientEvidenceKind: null,
    clientEvidenceNote: "",
    clientLetterName: "",
  };
}

export function emptyEthics(): EthicsObject {
  return { countries: [], protocols: [] };
}

export function emptyField(): FieldObject {
  return { events: [] };
}
