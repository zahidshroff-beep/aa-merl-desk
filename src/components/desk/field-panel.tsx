import { useEffect, useState } from "react";

import { countryFieldOpen, PATH_LABEL, respondentComplete, respondentGaps } from "@/lib/country";
import { fieldGate } from "@/lib/gates";
import { useDesk, useProgramme } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";

export function FieldPanel({ pid }: { pid: string }) {
  const prog = useProgramme(pid);
  const addRespondent = useDesk((s) => s.addRespondent);
  const patchRespondent = useDesk((s) => s.patchRespondent);
  const removeRespondent = useDesk((s) => s.removeRespondent);
  const logEvent = useDesk((s) => s.logEvent);
  const [method, setMethod] = useState("KII");
  const [countryId, setCountryId] = useState("");
  const [respondentId, setRespondentId] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!countryId && prog?.ethics.countries[0]) setCountryId(prog.ethics.countries[0].id);
  }, [countryId, prog?.ethics.countries]);

  if (!prog) return null;
  const { ethics, field, inception, stages } = prog;
  const effectiveCountryId = countryId || ethics.countries[0]?.id || "";
  const site = ethics.countries.find((c) => c.id === effectiveCountryId);
  const people = site?.respondents ?? [];

  if (!inception.clientAcceptedAt) {
    return (
      <p className="text-sm text-muted">
        Fieldwork is closed until the client Accepts the inception report.
      </p>
    );
  }
  if (stages.protocols.state !== "accepted") {
    return (
      <p className="text-sm text-muted">
        Fieldwork is closed until protocols and ethics are Accepted. UNKNOWN, REQUIRED and IN
        PROCESS sites will still refuse events after that.
      </p>
    );
  }

  const gate = fieldGate(ethics, field);

  return (
    <div className="space-y-8">
      <p className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-muted">
        The sample frame is the gate. Incomplete rows refuse KIIs. Closed ethics paths refuse the
        site. Auto does not invent respondents.
      </p>

      {ethics.countries.map((c) => {
        const open = countryFieldOpen(c);
        const complete = c.respondents.filter(respondentComplete).length;
        return (
          <section key={c.id} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base">
                {c.name}{" "}
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                  {PATH_LABEL[c.path]}
                </span>
              </h3>
              <span className={cn("text-sm", open.ok ? "text-cleared" : "text-danger")}>
                {open.ok
                  ? `${complete} complete respondent${complete === 1 ? "" : "s"}`
                  : open.reason}
              </span>
            </div>
            {c.respondents.length === 0 ? (
              <p className="text-sm text-muted">No one on the frame yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted">
                      <th className="pb-2 pr-2 font-medium">Group</th>
                      <th className="pb-2 pr-2 font-medium">Role</th>
                      <th className="pb-2 pr-2 font-medium">Programme engagement</th>
                      <th className="pb-2 pr-2 font-medium">Contact</th>
                      <th className="pb-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {c.respondents.map((r) => {
                      const missing = respondentGaps(r);
                      return (
                        <tr key={r.id} className="align-top">
                          <td className="py-1 pr-2">
                            <Input
                              value={r.group}
                              placeholder="e.g. implementing partner"
                              onChange={(e) =>
                                patchRespondent(pid, c.id, r.id, { group: e.target.value })
                              }
                            />
                          </td>
                          <td className="py-1 pr-2">
                            <Input
                              value={r.role}
                              placeholder="Title"
                              onChange={(e) =>
                                patchRespondent(pid, c.id, r.id, { role: e.target.value })
                              }
                            />
                          </td>
                          <td className="py-1 pr-2">
                            <Input
                              value={r.programmeEngagement}
                              placeholder="How they know the programme"
                              onChange={(e) =>
                                patchRespondent(pid, c.id, r.id, {
                                  programmeEngagement: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td className="py-1 pr-2">
                            <Input
                              value={r.contact}
                              placeholder="Email or phone"
                              onChange={(e) =>
                                patchRespondent(pid, c.id, r.id, { contact: e.target.value })
                              }
                            />
                            {missing.length > 0 ? (
                              <p className="mt-1 text-xs text-danger">Missing {missing.join(", ")}</p>
                            ) : (
                              <p className="mt-1 text-xs text-cleared">Complete</p>
                            )}
                          </td>
                          <td className="py-1">
                            <Button variant="ghost" onClick={() => removeRespondent(pid, c.id, r.id)}>
                              Remove
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <Button variant="outline" onClick={() => addRespondent(pid, c.id)}>
              Add respondent
            </Button>
          </section>
        );
      })}

      <section className="space-y-3 border-t border-border pt-5">
        <h3 className="text-base">Log an event</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Site</Label>
            <Select
              value={effectiveCountryId}
              onChange={(e) => {
                setCountryId(e.target.value);
                setRespondentId("");
              }}
            >
              {ethics.countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({PATH_LABEL[c.path]})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Respondent</Label>
            <Select value={respondentId} onChange={(e) => setRespondentId(e.target.value)}>
              <option value="">Select from the frame…</option>
              {people.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role || r.group || "Unnamed"}
                  {respondentComplete(r) ? "" : " — incomplete"}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Method</Label>
            <Select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>KII</option>
              <option>FGD</option>
              <option>Session observation</option>
            </Select>
          </div>
          <div>
            <Label>Title (optional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to use method + role"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            if (!effectiveCountryId) return;
            logEvent(pid, title, method, effectiveCountryId, respondentId);
            setTitle("");
          }}
        >
          Log event
        </Button>
      </section>

      <section>
        <h3 className="text-base">Events</h3>
        {field.events.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No events yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {field.events.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm"
              >
                <span>
                  {ev.title} · {ev.method}
                </span>
                {ev.status === "blocked" ? (
                  <span className="text-danger">{ev.blockedReason}</span>
                ) : (
                  <span className="text-cleared">Planned</span>
                )}
              </li>
            ))}
          </ul>
        )}
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
