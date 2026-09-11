import { tocGate } from "@/lib/gates";
import type { FrameworkLevel } from "@/lib/objects";
import { useDesk, useProgramme } from "@/lib/store";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";

const LEVELS: FrameworkLevel[] = ["impact", "outcome", "output", "activity"];

export function TocPanel({ pid }: { pid: string }) {
  const prog = useProgramme(pid);
  const patch = useDesk((s) => s.patchToc);
  if (!prog) return null;
  const { toc } = prog;
  const purposeOk = prog.stages.purpose.state === "accepted";
  const locked = prog.stages.toc.state === "accepted";
  const gate = tocGate(toc);

  if (!purposeOk) {
    return (
      <p className="text-sm text-muted">
        Accept Purpose, users, and decisions first. The ToC sits on that brief — not beside it.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-muted">
        This object is the results framework. The evaluation matrix (questions) is a different
        object and is not this walk.
      </p>
      <section>
        <Label>Theory of change</Label>
        <Textarea
          rows={6}
          disabled={locked}
          value={toc.narrative}
          onChange={(e) => patch(pid, (t) => ({ ...t, narrative: e.target.value }))}
          placeholder="If we do X, then Y, because Z. Name the failure points."
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base">Assumptions to test</h3>
          <Button
            variant="outline"
            disabled={locked}
            onClick={() =>
              patch(pid, (t) => ({
                ...t,
                assumptions: [...t.assumptions, { id: uid(), statement: "", testHow: "" }],
              }))
            }
          >
            Add assumption
          </Button>
        </div>
        {toc.assumptions.map((a) => (
          <div key={a.id} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <Label>Assumption</Label>
            <Textarea
              rows={2}
              disabled={locked}
              value={a.statement}
              onChange={(e) =>
                patch(pid, (t) => ({
                  ...t,
                  assumptions: t.assumptions.map((x) =>
                    x.id === a.id ? { ...x, statement: e.target.value } : x,
                  ),
                }))
              }
            />
            <div className="mt-2">
              <Label>How it will be tested</Label>
              <Input
                disabled={locked}
                value={a.testHow}
                onChange={(e) =>
                  patch(pid, (t) => ({
                    ...t,
                    assumptions: t.assumptions.map((x) =>
                      x.id === a.id ? { ...x, testHow: e.target.value } : x,
                    ),
                  }))
                }
              />
            </div>
            {a.source ? (
              <p className="mt-2 font-mono text-xs text-faint">
                Source: {a.source.docTitle} · {a.source.locator}
              </p>
            ) : null}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base">Results framework</h3>
          <Button
            variant="outline"
            disabled={locked}
            onClick={() =>
              patch(pid, (t) => ({
                ...t,
                framework: [
                  ...t.framework,
                  { id: uid(), level: "output", statement: "", indicator: "" },
                ],
              }))
            }
          >
            Add row
          </Button>
        </div>
        {toc.framework.map((r) => (
          <div key={r.id} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <div>
                <Label>Level</Label>
                <Select
                  disabled={locked}
                  value={r.level}
                  onChange={(e) =>
                    patch(pid, (t) => ({
                      ...t,
                      framework: t.framework.map((x) =>
                        x.id === r.id ? { ...x, level: e.target.value as FrameworkLevel } : x,
                      ),
                    }))
                  }
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Statement</Label>
                <Input
                  disabled={locked}
                  value={r.statement}
                  onChange={(e) =>
                    patch(pid, (t) => ({
                      ...t,
                      framework: t.framework.map((x) =>
                        x.id === r.id ? { ...x, statement: e.target.value } : x,
                      ),
                    }))
                  }
                />
              </div>
            </div>
            <div className="mt-2">
              <Label>Indicator</Label>
              <Input
                disabled={locked}
                value={r.indicator}
                onChange={(e) =>
                  patch(pid, (t) => ({
                    ...t,
                    framework: t.framework.map((x) =>
                      x.id === r.id ? { ...x, indicator: e.target.value } : x,
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
