export type DocumentKind = "TOR" | "PROPOSAL" | "LOGFRAME" | "NOTE" | "OTHER";

export type SourceDoc = {
  id: string;
  title: string;
  kind: DocumentKind;
  date: string;
  body: string;
};

export type SourceHit = {
  docId: string;
  docTitle: string;
  locator: string;
};

export const DOCUMENT_KINDS: DocumentKind[] = [
  "TOR",
  "PROPOSAL",
  "LOGFRAME",
  "NOTE",
  "OTHER",
];

/** Optional walk-through only. Never the default programme. */
export const EXAMPLE_PROGRAMME = {
  name: "Example — MHMR Independent Evaluation",
  client: "FCDO, on behalf of the MHMR Consortium",
  period: "July 2024 – June 2026",
  walkAs: "Evaluation Director, Altamont Advisory",
};

export const EXAMPLE_DOCUMENTS: Omit<SourceDoc, "id">[] = [
  {
    title: "Terms of Reference — Independent evaluation of MHMR",
    kind: "TOR",
    date: "12 Mar 2026",
    body: `Terms of Reference — Independent evaluation of the Myanmar Humanitarian MHPSS Response (MHMR)

§1 Purpose
Independent evaluation of whether MHMR improved access to quality MHPSS for conflict-affected people, and whether the community psychosocial worker cadre should continue after June 2026.

§1.2 Users of the evaluation
Dr Amina Rahman, Evaluation manager, FCDO — will recommend continue / stop / redesign the cadre to the annual review.
Ko Min Thant, Programme director, MHMR Consortium — will decide 2027 site mix and supervision budget.

§2 Priority decisions
1. Continue, stop, or redesign the community psychosocial worker cadre in 2027. Decided by FCDO annual review, on AA recommendation, Q4 2026. Data needed: outcome evidence on access and quality; cost per supervised worker; fidelity of supervision.
2. Keep or replace WHO SRQ-20 as the outcome measure. MHMR Consortium MERL working group, within 60 days of inception acceptance.

Do not collect: household income and expenditure module (no named decision uses it). Do not collect GPS of beneficiaries' homes (safeguarding).

Sites: Cox's Bazar, Bangladesh (IRB required); Mae Sot, Thailand (waiver may apply for secondary analysis); Yangon peri-urban, Myanmar (remote); Kachin IDP, Myanmar (remote). Default HOLD on Kachin until a site protocol exists.

Methods: KII, FGD, session observation, MIS secondary analysis.`,
  },
  {
    title: "Altamont Advisory technical proposal",
    kind: "PROPOSAL",
    date: "4 Apr 2026",
    body: `Technical proposal — MHMR Independent Evaluation

Theory of change
If conflict-affected people can reach a trained community psychosocial worker, and if that worker is supervised against a protocol, then people with MHPSS needs receive timely, acceptable support. The pathway fails if referral onward does not exist, if supervision is training-in-disguise, or if the outcome measure does not capture what people value.

Assumptions
- Community workers can practise (not only be trained) under current access constraints. Test: fidelity of observed sessions.
- People will use the service if it is available and trusted. Test: uptake vs catchment; KIIs with non-users.

§4.1 Utilisation
Decision: shift 15% of training budget to supervision, or not. Programme director, FY 2026/27 planning.

Evaluation questions
EQ1 Relevance. EQ2 Effectiveness (supervised workers, session completion). EQ3 Efficiency. EQ4 Sustainability. EQ5 Measure (SRQ-20).

Ethics and protection: no GPS of homes. Contribution analysis against the ToC. No household income module.`,
  },
  {
    title: "MHMR results framework annex (implementer)",
    kind: "LOGFRAME",
    date: "Jun 2024",
    body: `Results framework annex

Impact: Conflict-affected people experience improved psychosocial wellbeing. Indicator: mean SRQ-20 among service users.
Outcome: People with MHPSS needs access quality, acceptable support. Indicator: % of referred clients who complete at least three protocol sessions.
Outcome: Supervision improves session quality. Indicator: observed session quality, supervised vs unsupervised.
Output: Community psychosocial workers trained and deployed. Indicator: workers completing training and remaining in post at 6 months.
Output: Monthly supervision against protocol. Indicator: share of workers with a recorded supervision session in the last 30 days.
Activity: Training cohorts, supervision visits, referral-pathway workshops.

Assumptions column, outcome 1: Community workers can practise under current access constraints.`,
  },
  {
    title: "Kick-off note — evaluation manager",
    kind: "NOTE",
    date: "18 Apr 2026",
    body: `Kick-off note

Named users: Daw Hla Win, Country MERL focal point, MHMR — Cox's Bazar. Uses data to drop or keep the SRQ-20 wellbeing scale in routine monitoring.

Measure dispute: is SRQ-20 a valid proxy for the wellbeing the programme claims. Test via cognitive interviews and comparison with local scales named by Daw Hla Win.`,
  },
];
