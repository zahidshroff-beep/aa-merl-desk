import { useState } from "react";

import { ethicsGate } from "@/lib/gates";
import { useDesk, useProgramme } from "@/lib/store";
import { uid } from "@/lib/utils";
import { CountryCard } from "@/components/desk/country-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function EthicsPanel({ pid }: { pid: string }) {
  const prog = useProgramme(pid);
  const patch = useDesk((s) => s.patchEthics);
  const addCountry = useDesk((s) => s.addCountry);
  const [newName, setNewName] = useState("");
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
        Each country is an operating unit: ICC, focal point, ethics path, 48-hour requests. New
        sites are UNKNOWN. Auto drafts the three questions. Auto will not mark Cleared or Not
        required. “Not required for the programme” is not evaluation clearance.
      </p>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[12rem] flex-1">
            <Label>Add country</Label>
            <Input
              disabled={locked}
              value={newName}
              placeholder="Country name"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addCountry(pid, newName);
                  setNewName("");
                }
              }}
            />
          </div>
          <Button
            variant="outline"
            disabled={locked || !newName.trim()}
            onClick={() => {
              addCountry(pid, newName);
              setNewName("");
            }}
          >
            Add as UNKNOWN
          </Button>
        </div>
        {ethics.countries.length === 0 ? (
          <p className="text-sm text-muted">
            Automate this step to load sites from this programme’s documents, or add them here.
          </p>
        ) : null}
        {ethics.countries.map((c) => (
          <CountryCard key={c.id} pid={pid} country={c} locked={locked} />
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
        <p className="text-sm text-cleared">Ready to Accept. Field still blocked on unopened sites.</p>
      )}
    </div>
  );
}
