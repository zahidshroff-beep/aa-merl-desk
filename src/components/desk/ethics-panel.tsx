import { countryClearedLegal, ethicsGate } from "@/lib/gates";
import type { EthicsStatus } from "@/lib/objects";
import { useDesk, useProgramme } from "@/lib/store";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";

const STATUSES: EthicsStatus[] = ["OPEN", "HOLD", "CLEARED"];

export function EthicsPanel({ pid }: { pid: string }) {
  const prog = useProgramme(pid);
  const patch = useDesk((s) => s.patchEthics);
  const setStatus = useDesk((s) => s.setCountryStatus);
  const attachLetter = useDesk((s) => s.attachLetter);
  const setWaiver = useDesk((s) => s.setWaiver);
  if (!prog) return null;
  const { ethics } = prog;
  const clientOk = Boolean(prog.inception.clientAcceptedAt);
  const locked = prog.stages.protocols.state === "accepted";
  const gate = ethicsGate(ethics);

  if (!clientOk) {
    return (
      <p className="text-sm text-muted">
        Protocols sit after inception. Record client acceptance of the inception report first.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-muted">
        New sites are OPEN. Auto will not mark Cleared. Cleared requires a letter or a written
        waiver that this country does not need one.
      </p>

      <section className="space-y-3">
        <h3 className="text-base">Countries</h3>
        {ethics.countries.length === 0 ? (
          <p className="text-sm text-muted">
            Automate this step to load sites from this programme’s documents, or add them by
            writing protocols first.
          </p>
        ) : null}
        {ethics.countries.map((c) => (
          <article key={c.id} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{c.name}</h4>
                <p className="text-sm text-muted">{c.notes}</p>
              </div>
              <span
                className={
                  c.status === "CLEARED"
                    ? "text-xs font-medium text-cleared"
                    : c.status === "HOLD"
                      ? "text-xs font-medium text-hold"
                      : "text-xs font-medium text-open"
                }
              >
                {c.status}
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Status</Label>
                <Select
                  disabled={locked}
                  value={c.status}
                  onChange={(e) => setStatus(pid, c.id, e.target.value as EthicsStatus)}
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Approval letter</Label>
                <Input
                  type="file"
                  disabled={locked}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) attachLetter(pid, c.id, file.name);
                  }}
                />
                {c.letterName ? (
                  <p className="mt-1 font-mono text-xs text-faint">
                    {c.letterName}
                    {c.letterDate ? ` · ${c.letterDate}` : ""}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-faint">No letter attached</p>
                )}
              </div>
            </div>
            <div className="mt-2">
              <Label>Waiver — “not required for this country because…”</Label>
              <Textarea
                rows={3}
                disabled={locked}
                value={c.waiver}
                onChange={(e) => setWaiver(pid, c.id, e.target.value)}
              />
              <p className="mt-1 text-xs text-faint">{c.waiver.trim().length}/40 characters minimum</p>
            </div>
            {c.status === "CLEARED" && !countryClearedLegal(c) ? (
              <p className="mt-2 text-sm text-danger">
                Cleared is not legal yet. Letter or waiver first.
              </p>
            ) : null}
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base">Protocols</h3>
          <Button
            variant="outline"
            disabled={locked}
            onClick={() =>
              patch(pid, (e) => ({
                ...e,
                protocols: [
                  ...e.protocols,
                  { id: uid(), method: "", instrument: "", consentScript: true },
                ],
              }))
            }
          >
            Add protocol
          </Button>
        </div>
        {ethics.protocols.map((p) => (
          <div
            key={p.id}
            className="grid gap-3 rounded-[var(--radius-md)] border border-border bg-bg p-3 sm:grid-cols-2"
          >
            <div>
              <Label>Method</Label>
              <Input
                disabled={locked}
                value={p.method}
                onChange={(e) =>
                  patch(pid, (eth) => ({
                    ...eth,
                    protocols: eth.protocols.map((x) =>
                      x.id === p.id ? { ...x, method: e.target.value } : x,
                    ),
                  }))
                }
              />
            </div>
            <div>
              <Label>Instrument</Label>
              <Input
                disabled={locked}
                value={p.instrument}
                onChange={(e) =>
                  patch(pid, (eth) => ({
                    ...eth,
                    protocols: eth.protocols.map((x) =>
                      x.id === p.id ? { ...x, instrument: e.target.value } : x,
                    ),
                  }))
                }
              />
            </div>
          </div>
        ))}
      </section>

      {!gate.ok ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-hold">
          {gate.gaps.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-cleared">Ready to Accept.</p>
      )}
    </div>
  );
}
