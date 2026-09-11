import { purposeGate } from "@/lib/gates";
import { useDesk, useProgramme } from "@/lib/store";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

export function PurposePanel({ pid }: { pid: string }) {
  const purpose = useProgramme(pid)?.purpose;
  const locked = useProgramme(pid)?.stages.purpose.state === "accepted";
  const patch = useDesk((s) => s.patchPurpose);
  if (!purpose) return null;
  const gate = purposeGate(purpose);

  return (
    <div className="space-y-6">
      <section>
        <Label>Primary purpose</Label>
        <Textarea
          rows={4}
          disabled={locked}
          value={purpose.primaryPurpose}
          onChange={(e) => patch(pid, (p) => ({ ...p, primaryPurpose: e.target.value }))}
          placeholder="Who this data is for, and what it must decide — on this programme."
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base">Named users</h3>
          <Button
            variant="outline"
            disabled={locked}
            onClick={() =>
              patch(pid, (p) => ({
                ...p,
                users: [
                  ...p.users,
                  { id: uid(), name: "", role: "", organisation: "", usesDataFor: "" },
                ],
              }))
            }
          >
            Add user
          </Button>
        </div>
        {purpose.users.length === 0 ? (
          <p className="text-sm text-muted">
            No users yet. Automate from this programme’s documents, or add one.
          </p>
        ) : (
          <ul className="space-y-3">
            {purpose.users.map((u) => (
              <li key={u.id} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Name</Label>
                    <Input
                      disabled={locked}
                      value={u.name}
                      onChange={(e) =>
                        patch(pid, (p) => ({
                          ...p,
                          users: p.users.map((x) =>
                            x.id === u.id ? { ...x, name: e.target.value } : x,
                          ),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input
                      disabled={locked}
                      value={u.role}
                      onChange={(e) =>
                        patch(pid, (p) => ({
                          ...p,
                          users: p.users.map((x) =>
                            x.id === u.id ? { ...x, role: e.target.value } : x,
                          ),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Organisation</Label>
                    <Input
                      disabled={locked}
                      value={u.organisation}
                      onChange={(e) =>
                        patch(pid, (p) => ({
                          ...p,
                          users: p.users.map((x) =>
                            x.id === u.id ? { ...x, organisation: e.target.value } : x,
                          ),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Uses the data for</Label>
                    <Input
                      disabled={locked}
                      value={u.usesDataFor}
                      onChange={(e) =>
                        patch(pid, (p) => ({
                          ...p,
                          users: p.users.map((x) =>
                            x.id === u.id ? { ...x, usesDataFor: e.target.value } : x,
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
                {u.source ? (
                  <p className="mt-2 font-mono text-xs text-faint">
                    Source: {u.source.docTitle} · {u.source.locator}
                  </p>
                ) : null}
                {!locked ? (
                  <button
                    type="button"
                    className="mt-2 text-xs text-muted underline"
                    onClick={() =>
                      patch(pid, (p) => ({ ...p, users: p.users.filter((x) => x.id !== u.id) }))
                    }
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base">Decision register</h3>
          <Button
            variant="outline"
            disabled={locked}
            onClick={() =>
              patch(pid, (p) => ({
                ...p,
                decisions: [
                  ...p.decisions,
                  { id: uid(), decision: "", who: "", when: "", dataNeeded: "" },
                ],
              }))
            }
          >
            Add decision
          </Button>
        </div>
        {purpose.decisions.length === 0 ? (
          <p className="text-sm text-muted">If no decision uses a datum, it belongs below — not here.</p>
        ) : (
          <ul className="space-y-3">
            {purpose.decisions.map((d) => (
              <li key={d.id} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                <Label>Decision</Label>
                <Textarea
                  rows={2}
                  disabled={locked}
                  value={d.decision}
                  onChange={(e) =>
                    patch(pid, (p) => ({
                      ...p,
                      decisions: p.decisions.map((x) =>
                        x.id === d.id ? { ...x, decision: e.target.value } : x,
                      ),
                    }))
                  }
                />
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Who decides</Label>
                    <Input
                      disabled={locked}
                      value={d.who}
                      onChange={(e) =>
                        patch(pid, (p) => ({
                          ...p,
                          decisions: p.decisions.map((x) =>
                            x.id === d.id ? { ...x, who: e.target.value } : x,
                          ),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>When</Label>
                    <Input
                      disabled={locked}
                      value={d.when}
                      onChange={(e) =>
                        patch(pid, (p) => ({
                          ...p,
                          decisions: p.decisions.map((x) =>
                            x.id === d.id ? { ...x, when: e.target.value } : x,
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <Label>Data required</Label>
                  <Input
                    disabled={locked}
                    value={d.dataNeeded}
                    onChange={(e) =>
                      patch(pid, (p) => ({
                        ...p,
                        decisions: p.decisions.map((x) =>
                          x.id === d.id ? { ...x, dataNeeded: e.target.value } : x,
                        ),
                      }))
                    }
                  />
                </div>
                {d.source ? (
                  <p className="mt-2 font-mono text-xs text-faint">
                    Source: {d.source.docTitle} · {d.source.locator}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base">Do not collect</h3>
          <Button
            variant="outline"
            disabled={locked}
            onClick={() =>
              patch(pid, (p) => ({
                ...p,
                doNotCollect: [...p.doNotCollect, { id: uid(), datum: "", reason: "" }],
              }))
            }
          >
            Flag a datum
          </Button>
        </div>
        {purpose.doNotCollect.map((o) => (
          <div key={o.id} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <Label>Datum</Label>
            <Input
              disabled={locked}
              value={o.datum}
              onChange={(e) =>
                patch(pid, (p) => ({
                  ...p,
                  doNotCollect: p.doNotCollect.map((x) =>
                    x.id === o.id ? { ...x, datum: e.target.value } : x,
                  ),
                }))
              }
            />
            <div className="mt-2">
              <Label>Why no decision uses it</Label>
              <Input
                disabled={locked}
                value={o.reason}
                onChange={(e) =>
                  patch(pid, (p) => ({
                    ...p,
                    doNotCollect: p.doNotCollect.map((x) =>
                      x.id === o.id ? { ...x, reason: e.target.value } : x,
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
