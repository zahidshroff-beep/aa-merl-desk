import { inceptionAaGate, inceptionClientGate } from "@/lib/gates";
import { useDesk, useProgramme } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";

const SECTIONS: {
  key:
    | "torConfirmation"
    | "questions"
    | "methodology"
    | "sampling"
    | "tools"
    | "workplan";
  label: string;
}[] = [
  { key: "torConfirmation", label: "TOR confirmation" },
  { key: "questions", label: "Evaluation questions" },
  { key: "methodology", label: "Methodology" },
  { key: "sampling", label: "Sampling" },
  { key: "tools", label: "Tools" },
  { key: "workplan", label: "Workplan" },
];

export function InceptionPanel({ pid }: { pid: string }) {
  const prog = useProgramme(pid);
  const patch = useDesk((s) => s.patchInception);
  const clientAccept = useDesk((s) => s.clientAcceptInception);
  if (!prog) return null;
  const { inception } = prog;
  const tocOk = prog.stages.toc.state === "accepted";
  const locked = prog.stages.inception.state === "accepted";
  const aaGate = inceptionAaGate(inception);
  const clientGate = inceptionClientGate(inception);

  if (!tocOk) {
    return (
      <p className="text-sm text-muted">
        Inception confirms the accepted design. Accept the theory of change and results
        framework first.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {SECTIONS.map((sec) => (
        <section key={sec.key}>
          <Label>{sec.label}</Label>
          <Textarea
            rows={sec.key === "questions" ? 6 : 4}
            disabled={locked}
            value={inception[sec.key]}
            onChange={(e) => patch(pid, (i) => ({ ...i, [sec.key]: e.target.value }))}
          />
        </section>
      ))}

      {!aaGate.ok ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-hold">
          {aaGate.gaps.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-cleared">
          {inception.aaAcceptedAt
            ? `AA Accepted ${new Date(inception.aaAcceptedAt).toLocaleString()} · ${inception.aaAcceptedBy}`
            : "Ready for AA Accept."}
        </p>
      )}

      <section className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-bg p-4">
        <h3 className="text-base">Client acceptance</h3>
        <p className="text-sm text-muted">
          Fieldwork cannot start on a letter that does not exist. Auto cannot record this.
        </p>
        <div>
          <Label>Accepted by (client)</Label>
          <Input
            disabled={Boolean(inception.clientAcceptedAt)}
            value={inception.clientName}
            onChange={(e) => patch(pid, (i) => ({ ...i, clientName: e.target.value }))}
            placeholder="Name and organisation of the person who accepted"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Evidence</Label>
            <Select
              disabled={Boolean(inception.clientAcceptedAt)}
              value={inception.clientEvidenceKind ?? ""}
              onChange={(e) =>
                patch(pid, (i) => ({
                  ...i,
                  clientEvidenceKind:
                    e.target.value === "letter" || e.target.value === "dated_note"
                      ? e.target.value
                      : null,
                }))
              }
            >
              <option value="">Choose…</option>
              <option value="letter">Acceptance letter</option>
              <option value="dated_note">Dated note (who / when / what)</option>
            </Select>
          </div>
          {inception.clientEvidenceKind === "letter" ? (
            <div>
              <Label>Letter file</Label>
              <Input
                type="file"
                disabled={Boolean(inception.clientAcceptedAt)}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) patch(pid, (i) => ({ ...i, clientLetterName: file.name }));
                }}
              />
              {inception.clientLetterName ? (
                <p className="mt-1 font-mono text-xs text-faint">{inception.clientLetterName}</p>
              ) : null}
            </div>
          ) : (
            <div className="sm:col-span-2">
              <Label>Dated note</Label>
              <Textarea
                rows={3}
                disabled={Boolean(inception.clientAcceptedAt)}
                value={inception.clientEvidenceNote}
                onChange={(e) => patch(pid, (i) => ({ ...i, clientEvidenceNote: e.target.value }))}
                placeholder="Date — who confirmed the inception report, and how."
              />
            </div>
          )}
        </div>
        {inception.clientAcceptedAt ? (
          <p className="text-sm text-cleared">
            Client Accepted {new Date(inception.clientAcceptedAt).toLocaleString()} ·{" "}
            {inception.clientAcceptedBy}
          </p>
        ) : (
          <Button variant="outline" disabled={!inception.aaAcceptedAt} onClick={() => clientAccept(pid)}>
            Record client Accept
          </Button>
        )}
        {!clientGate.ok && inception.aaAcceptedAt ? (
          <p className="text-sm text-hold">{clientGate.gaps[0]}</p>
        ) : null}
      </section>
    </div>
  );
}
