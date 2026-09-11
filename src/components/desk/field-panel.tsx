import { useEffect, useState } from "react";

import { useDesk, useProgramme } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";

export function FieldPanel({ pid }: { pid: string }) {
  const prog = useProgramme(pid);
  const logEvent = useDesk((s) => s.logEvent);
  const [title, setTitle] = useState("");
  const [method, setMethod] = useState("KII");
  const [countryId, setCountryId] = useState("");

  useEffect(() => {
    if (!countryId && prog?.ethics.countries[0]) setCountryId(prog.ethics.countries[0].id);
  }, [countryId, prog?.ethics.countries]);

  if (!prog) return null;
  const { ethics, field, inception, stages } = prog;

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
        Fieldwork is closed until protocols and ethics are Accepted. HOLD and OPEN sites will
        still refuse events after that.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-muted">
        This is not a full sample frame. It exists to prove the gate: OPEN and HOLD sites
        refuse events even after you press the button.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="KII — supervisor" />
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
          <Label>Site</Label>
          <Select value={countryId} onChange={(e) => setCountryId(e.target.value)}>
            {ethics.countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status})
              </option>
            ))}
          </Select>
        </div>
      </div>
      <Button
        onClick={() => {
          if (!countryId) return;
          logEvent(pid, title, method, countryId);
          setTitle("");
        }}
      >
        Log event
      </Button>
      {field.events.length === 0 ? (
        <p className="text-sm text-muted">No events yet.</p>
      ) : (
        <ul className="space-y-2">
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
    </div>
  );
}
