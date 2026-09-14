import type { ExtractedDraft } from "@/lib/extract-types";
import type { SourceDoc } from "@/lib/source-pack";

const METHOD_WORDS = [
  "KII",
  "FGD",
  "focus group",
  "survey",
  "observation",
  "case study",
  "secondary analysis",
  "MIS",
  "household survey",
  "key informant",
];

const COUNTRY_HINT =
  /\b(Afghanistan|Bangladesh|Benin|Burkina Faso|Cambodia|Cameroon|Chad|Côte d['’]Ivoire|Cote d['’]Ivoire|DRC|Ethiopia|Ghana|Guinea|India|Indonesia|Iraq|Jordan|Kenya|Lao PDR|Lebanon|Liberia|Malawi|Mali|Mozambique|Myanmar|Nepal|Niger|Nigeria|Pakistan|Palestine|Rwanda|Senegal|Sierra Leone|Somalia|South Sudan|Sudan|Syria|Tanzania|Thailand|Togo|Uganda|Ukraine|Viet Nam|Vietnam|Yemen|Zambia|Zimbabwe|Cox['’]s Bazar|Mae Sot|Yangon|Kachin|Juba|Nairobi|Addis|Kampala|Dhaka|Beirut)\b/gi;

function hit(doc: SourceDoc, locator: string) {
  return { docId: doc.id, docTitle: doc.title, locator };
}

function paras(body: string) {
  return body
    .split(/\n+/)
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 8);
}

function section(body: string, headings: RegExp) {
  const lines = body.split(/\n/);
  const out: string[] = [];
  let on = false;
  for (const line of lines) {
    if (headings.test(line) && line.length < 80) {
      on = true;
      continue;
    }
    if (on && /^§?\s*[A-Z0-9].{0,40}$/.test(line) && !headings.test(line) && line.length < 60) {
      break;
    }
    if (on) out.push(line);
  }
  return out.join("\n").trim();
}

function emptyDraft(): ExtractedDraft {
  return {
    primaryPurpose: "",
    users: [],
    decisions: [],
    doNotCollect: [],
    tocNarrative: "",
    assumptions: [],
    framework: [],
    inception: {
      torConfirmation: "",
      questions: "",
      methodology: "",
      sampling: "",
      tools: "",
      workplan: "",
    },
    countries: [],
    methods: [],
  };
}

/** Deterministic extract from this programme's documents only. Invents nothing. */
export function extractLocal(docs: SourceDoc[]): ExtractedDraft {
  const draft = emptyDraft();
  const tor = docs.find((d) => d.kind === "TOR") ?? docs[0];
  const proposal = docs.find((d) => d.kind === "PROPOSAL");
  const logframe = docs.find((d) => d.kind === "LOGFRAME");
  const all = docs.map((d) => d.body).join("\n\n");

  if (tor?.body.trim()) {
    const purposeBlock =
      section(tor.body, /purpose|objective|this evaluation/i) || paras(tor.body)[0] || "";
    draft.primaryPurpose = purposeBlock.slice(0, 600);
    draft.inception.torConfirmation = purposeBlock.slice(0, 1200);
  }

  for (const doc of docs) {
    for (const line of paras(doc.body)) {
      const person = line.match(
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z.'-]+){1,3}),\s+([^,]+),\s+(.+?)(?:\s+[—–-]\s+(.+))?$/,
      );
      if (person) {
        draft.users.push({
          name: person[1],
          role: person[2],
          organisation: person[3].replace(/\s+[—–-].*$/, "").trim(),
          usesDataFor: person[4] ?? line.slice(person[0].length).trim(),
          source: hit(doc, "named person"),
        });
      }
      if (
        /\b(decision|decide|whether to|continue, stop|recommend)\b/i.test(line) &&
        line.length > 40 &&
        !person
      ) {
        draft.decisions.push({
          decision: line.slice(0, 280),
          who: "",
          when: "",
          dataNeeded: "",
          source: hit(doc, "decision language"),
        });
      }
      if (/\b(do not collect|will not collect|out of scope|must not collect)\b/i.test(line)) {
        draft.doNotCollect.push({
          datum: line.slice(0, 180),
          reason: line.slice(0, 280),
          source: hit(doc, "do not collect"),
        });
      }
      if (/\bassumption\b/i.test(line) && line.length > 30) {
        draft.assumptions.push({
          statement: line.replace(/^assumption[s:]?\s*/i, "").slice(0, 280),
          testHow: "",
          source: hit(doc, "assumption"),
        });
      }
    }
  }

  const tocSrc = proposal ?? tor;
  if (tocSrc) {
    draft.tocNarrative =
      section(tocSrc.body, /theory of change|toc|pathway/i).slice(0, 1200) ||
      draft.tocNarrative;
  }

  const frameSrc = logframe ?? proposal ?? tor;
  if (frameSrc) {
    for (const line of paras(frameSrc.body)) {
      const m = line.match(/^(impact|outcome|output|activity)\s*[:.—–-]\s*(.+)$/i);
      if (m) {
        const rest = m[2];
        const [statement, indicator] = rest.split(/indicator\s*:/i);
        draft.framework.push({
          level: m[1].toLowerCase() as ExtractedDraft["framework"][number]["level"],
          statement: (statement ?? "").trim().slice(0, 300),
          indicator: (indicator ?? "").trim().slice(0, 300),
          source: hit(frameSrc, m[1]),
        });
      }
    }
  }

  draft.inception.questions =
    section(all, /evaluation questions|eq\d|priority questions/i).slice(0, 1500);
  draft.inception.methodology =
    section(all, /methodolog|mixed method|contribution analysis/i).slice(0, 1500);
  draft.inception.sampling = section(all, /sampl|sites?:/i).slice(0, 1200);
  draft.inception.tools = section(all, /tools?|instruments?|guides?/i).slice(0, 1200);
  draft.inception.workplan = section(all, /workplan|work plan|timeline/i).slice(0, 1200);

  const seenCountry = new Set<string>();
  for (const doc of docs) {
    const matches = doc.body.match(COUNTRY_HINT) ?? [];
    for (const raw of matches) {
      const name = raw.trim();
      const key = name.toLowerCase();
      if (seenCountry.has(key)) continue;
      seenCountry.add(key);
      const irb = /IRB|ethics board|ethics review/i.test(doc.body);
      draft.countries.push({
        name,
        notes: `Mentioned in ${doc.title}.`,
        irbRequired: irb,
      });
    }
  }

  const seenMethod = new Set<string>();
  for (const word of METHOD_WORDS) {
    if (new RegExp(word, "i").test(all) && !seenMethod.has(word.toLowerCase())) {
      seenMethod.add(word.toLowerCase());
      draft.methods.push(word);
    }
  }

  return draft;
}

export function draftHasSignal(d: ExtractedDraft) {
  return Boolean(
    d.primaryPurpose ||
      d.users.length ||
      d.decisions.length ||
      d.framework.length ||
      d.countries.length ||
      d.tocNarrative,
  );
}
