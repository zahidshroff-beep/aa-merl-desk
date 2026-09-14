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

/** Per-country ethics investigation. Auto never sets CLEARED or NOT_REQUIRED. */
export type EthicsPath =
  | "UNKNOWN"
  | "NOT_REQUIRED"
  | "REQUIRED"
  | "IN_PROCESS"
  | "CLEARED";

export type YesNoUnknown = "yes" | "no" | "unknown" | "na" | "";

export type NotRequiredAppliesTo = "programme" | "evaluation" | "both" | "";

export type RequestStatus = "draft" | "open" | "complete" | "incomplete" | "overdue";

export type CountryRequest = {
  id: string;
  asked: string;
  askedTo: string;
  askedBy: string;
  sentAt: string;
  dueAt: string;
  status: RequestStatus;
  responseNote: string;
};

export type Respondent = {
  id: string;
  group: string;
  role: string;
  programmeEngagement: string;
  contact: string;
};

export type ProtocolRow = {
  id: string;
  method: string;
  instrument: string;
  consentScript: boolean;
};

/** Country is the operating unit: roles, ethics path, 48h requests, sample frame. */
export type CountryUnit = {
  id: string;
  name: string;
  notes: string;
  focalPoint: string;
  focalRole: string;
  icc: string;
  heightenedScrutiny: boolean;
  scrutinyNote: string;
  path: EthicsPath;
  programmeApprovalRequired: YesNoUnknown;
  programmeApprovalObtained: YesNoUnknown;
  evaluationSameAsProgramme: YesNoUnknown;
  notRequiredConfirmedBy: string;
  notRequiredConfirmedAt: string;
  notRequiredAppliesTo: NotRequiredAppliesTo;
  notRequiredNote: string;
  submittedAt: string;
  expectedDays: number;
  letterName: string;
  letterDate: string;
  requests: CountryRequest[];
  respondents: Respondent[];
};

export type EthicsObject = {
  countries: CountryUnit[];
  protocols: ProtocolRow[];
};

export type FieldEvent = {
  id: string;
  title: string;
  method: string;
  countryId: string;
  respondentId: string | null;
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
  /** Named ICC; new countries inherit this. Per-country ICC can override. */
  defaultIcc: string;
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
