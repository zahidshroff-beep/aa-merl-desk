export type ChairId = "design" | "evaluate";
export type StageState = "idle" | "working" | "ready" | "accepted";

export type StageId =
  | "purpose"
  | "toc"
  | "methods"
  | "systems"
  | "monitoring"
  | "evaluations"
  | "learning"
  | "iterate"
  | "desk"
  | "inception"
  | "protocols"
  | "field"
  | "analysis"
  | "validation"
  | "report"
  | "delivery"
  | "closeout";

export type StageDef = {
  id: StageId;
  chair: ChairId;
  n: number;
  label: string;
  purpose: string;
  acceptedWhen: string;
  built: boolean;
};

export const DESIGN_STAGES: StageDef[] = [
  {
    id: "purpose",
    chair: "design",
    n: 1,
    label: "Purpose, users, and decisions",
    purpose:
      "Name who uses the data and which decisions it must serve. If no decision depends on a datum, do not collect it.",
    acceptedWhen:
      "Primary purpose is set. At least one user is named by role. At least one decision is on the register.",
    built: true,
  },
  {
    id: "toc",
    chair: "design",
    n: 2,
    label: "Theory of change and results framework",
    purpose:
      "Set out how activities lead to outputs, outcomes, and impact. Make assumptions explicit so they can be tested.",
    acceptedWhen:
      "ToC narrative and at least one assumption exist. Results chain has at least one output row and one outcome row.",
    built: true,
  },
  {
    id: "methods",
    chair: "design",
    n: 3,
    label: "Indicators, questions, and methods",
    purpose:
      "Three to five priority questions tied to real decisions. SMART indicators. Methods chosen on purpose.",
    acceptedWhen: "Each priority question has a method and a sample note.",
    built: false,
  },
  {
    id: "systems",
    chair: "design",
    n: 4,
    label: "Data systems and tools",
    purpose:
      "Map data from collection through cleaning, storage, analysis, and reporting. Name an owner for each step.",
    acceptedWhen: "Every accepted method has an instrument and an owner. Consent language exists.",
    built: false,
  },
  {
    id: "monitoring",
    chair: "design",
    n: 5,
    label: "Monitoring and ongoing research",
    purpose:
      "Keep collection running through implementation — activities, outputs, fidelity, and field reflection.",
    acceptedWhen: "A monitoring calendar exists. At least one period is in play.",
    built: false,
  },
  {
    id: "evaluations",
    chair: "design",
    n: 6,
    label: "Evaluations (midterm and endline)",
    purpose:
      "Step back at key points. Agree scope, questions, and whether the evaluation is internal or external.",
    acceptedWhen: "A commission exists. External work opens Run the evaluation on this programme.",
    built: false,
  },
  {
    id: "learning",
    chair: "design",
    n: 7,
    label: "Learning, reflection, and adaptation",
    purpose:
      "Turn evidence into decisions: pause-and-reflect, insights tied to ToC assumptions, a management response.",
    acceptedWhen:
      "At least one insight is tied to a ToC assumption. A management response has an owner and a date, or is marked not required.",
    built: false,
  },
  {
    id: "iterate",
    chair: "design",
    n: 8,
    label: "Iterate the MERL system",
    purpose:
      "Ask whether people use the data. Drop what they do not. Train staff. Treat MERL as management, not a parallel file.",
    acceptedWhen: "A use-review exists. Dropped or added indicators are on a change log.",
    built: false,
  },
];

export const EVALUATE_STAGES: StageDef[] = [
  {
    id: "desk",
    chair: "evaluate",
    n: 1,
    label: "Desk review and documentation",
    purpose:
      "Review the proposal, logframe, MEL data, reports, budgets, and partner agreements. Map gaps and stakeholders.",
    acceptedWhen: "Source list exists. Gap note exists. Countries from the pack are on the programme.",
    built: false,
  },
  {
    id: "inception",
    chair: "evaluate",
    n: 2,
    label: "Inception plan / inception report",
    purpose:
      "Confirm TOR, questions, methodology, sampling, tools, and workplan. Client accepts before fieldwork.",
    acceptedWhen:
      "Inception report is Accepted by AA. Client accepted is recorded with a letter or a dated note.",
    built: true,
  },
  {
    id: "protocols",
    chair: "evaluate",
    n: 3,
    label: "Protocols, tools, and ethics",
    purpose:
      "Finalise instruments, consent, safeguarding, and country ethics before any site work.",
    acceptedWhen:
      "Each country is Hold or Cleared. Cleared requires an approval letter or a written “not required for this country.” Protocols exist for each method.",
    built: true,
  },
  {
    id: "field",
    chair: "evaluate",
    n: 4,
    label: "Fieldwork and primary data",
    purpose: "KIIs, FGDs, surveys, observation. Evidence stays on the event and the person.",
    acceptedWhen: "Sample frame exists. Planned events exist. Ethics Hold still blocks new events on that site.",
    built: true,
  },
  {
    id: "analysis",
    chair: "evaluate",
    n: 5,
    label: "Cleaning, coding, and analysis",
    purpose: "Clean quant. Code qual. Triangulate. Assess contribution against the theory of change.",
    acceptedWhen: "A triangulation note exists. Contribution against the ToC is written.",
    built: false,
  },
  {
    id: "validation",
    chair: "evaluate",
    n: 6,
    label: "Validation and sense-making",
    purpose: "Test emerging findings with the project team. Challenge assumptions. Revise interpretations.",
    acceptedWhen: "Workshop record exists, or Admin records that the client declined validation, with a reason.",
    built: false,
  },
  {
    id: "report",
    chair: "evaluate",
    n: 7,
    label: "Report writing",
    purpose:
      "Executive summary, methodology, findings, conclusions, recommendations, lessons. Recommendations linked to evidence.",
    acceptedWhen: "Each required section has text. Each recommendation points at a finding.",
    built: false,
  },
  {
    id: "delivery",
    chair: "evaluate",
    n: 8,
    label: "Final deliverables and dissemination",
    purpose: "Final report, annexes, tools, datasets, transcripts. Present. Offer a management-response template.",
    acceptedWhen: "Delivery pack is assembled. Management-response template exists.",
    built: false,
  },
  {
    id: "closeout",
    chair: "evaluate",
    n: 9,
    label: "Close-out",
    purpose: "Archive ethically. Hand over. Debrief the evaluation manager.",
    acceptedWhen: "Inventory of accepted objects exists. Handover has a name and a date. Debrief is filed.",
    built: false,
  },
];

export const CHAIRS: {
  id: ChairId;
  door: string;
  paper: string;
  stages: StageDef[];
}[] = [
  {
    id: "design",
    door: "Design the MERL system",
    paper: "Implementing team — project design through adaptation",
    stages: DESIGN_STAGES,
  },
  {
    id: "evaluate",
    door: "Run the evaluation",
    paper: "External evaluator — desk review through close-out",
    stages: EVALUATE_STAGES,
  },
];

export function stagesFor(chair: ChairId) {
  return chair === "design" ? DESIGN_STAGES : EVALUATE_STAGES;
}

export function stageById(id: StageId) {
  return DESIGN_STAGES.find((s) => s.id === id) ?? EVALUATE_STAGES.find((s) => s.id === id);
}
