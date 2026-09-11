import type { FrameworkLevel } from "@/lib/objects";
import type { SourceHit } from "@/lib/source-pack";

export type ExtractedUser = {
  name: string;
  role: string;
  organisation: string;
  usesDataFor: string;
  source?: SourceHit;
};

export type ExtractedDecision = {
  decision: string;
  who: string;
  when: string;
  dataNeeded: string;
  source?: SourceHit;
};

export type ExtractedOrphan = {
  datum: string;
  reason: string;
  source?: SourceHit;
};

export type ExtractedAssumption = {
  statement: string;
  testHow: string;
  source?: SourceHit;
};

export type ExtractedFramework = {
  level: FrameworkLevel;
  statement: string;
  indicator: string;
  source?: SourceHit;
};

export type ExtractedCountry = {
  name: string;
  notes: string;
  irbRequired: boolean;
};

export type ExtractedDraft = {
  primaryPurpose: string;
  users: ExtractedUser[];
  decisions: ExtractedDecision[];
  doNotCollect: ExtractedOrphan[];
  tocNarrative: string;
  assumptions: ExtractedAssumption[];
  framework: ExtractedFramework[];
  inception: {
    torConfirmation: string;
    questions: string;
    methodology: string;
    sampling: string;
    tools: string;
    workplan: string;
  };
  countries: ExtractedCountry[];
  methods: string[];
};
