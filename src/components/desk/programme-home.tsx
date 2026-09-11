import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useDesk } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function ProgrammeHome() {
  const programmes = useDesk((s) => s.programmes);
  const createProgramme = useDesk((s) => s.createProgramme);
  const createExample = useDesk((s) => s.createExample);
  const removeProgramme = useDesk((s) => s.removeProgramme);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [period, setPeriod] = useState("");
  const [walkAs, setWalkAs] = useState("");

  function open(id: string) {
    void navigate({ to: "/p/$id", params: { id } });
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Altamont Advisory · IMP
          </p>
          <h1 className="mt-2 text-3xl">MERL desk</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            One desk. Any programme. Attach that programme’s documents. Auto drafts from them.
            You Accept.
          </p>
        </div>
      </header>
      <main className="mx-auto grid max-w-3xl gap-8 px-4 py-8">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-lg">New programme</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Programme name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CAMFED Zambia endline"
              />
            </div>
            <div>
              <Label>Client</Label>
              <Input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Commissioning organisation"
              />
            </div>
            <div>
              <Label>Period</Label>
              <Input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="2025–2027"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Walk as</Label>
              <Input
                value={walkAs}
                onChange={(e) => setWalkAs(e.target.value)}
                placeholder="Your name and role — used on Accept"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={!name.trim()}
              onClick={() => {
                const id = createProgramme({ name, client, period, walkAs });
                setName("");
                setClient("");
                setPeriod("");
                setWalkAs("");
                open(id);
              }}
            >
              Open desk
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const id = createExample();
                open(id);
              }}
            >
              Load example documents
            </Button>
          </div>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-lg">For testers</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              Open a <span className="text-fg">new programme</span> for a live Altamont
              assignment. Do not start with the example unless you only want to see Auto.
            </li>
            <li>
              Paste that programme’s TOR / proposal / logframe as text in Source documents.
            </li>
            <li>
              On each built stage: <span className="text-fg">Automate this step</span> or{" "}
              <span className="text-fg">Do this step myself</span>. Auto must not Accept.
            </li>
            <li>
              Accept only when names, decisions, and the framework are true for that
              programme. Empty Accept must refuse.
            </li>
            <li>
              Inception: AA Accept, then client Accept with a letter or dated note. Field
              stays closed until both.
            </li>
            <li>
              Ethics: marking Cleared without a letter or a written waiver must refuse. OPEN
              and HOLD sites must refuse field events.
            </li>
          </ol>
          <p className="mt-3 text-sm text-muted">
            Send notes on whether this is the AA process, where Auto is wrong, and what is
            still missing. Work stays in this browser.
          </p>
        </section>

        <section>
          <h2 className="text-lg">Programmes</h2>
          {programmes.length === 0 ? (
            <p className="mt-3 text-sm text-muted">None yet. Open a desk for the next evaluation.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {programmes.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3"
                >
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => open(p.id)}>
                    <span className="block font-medium">{p.name}</span>
                    <span className="block text-xs text-muted">
                      {p.client || "No client"} · {p.documents.length} document
                      {p.documents.length === 1 ? "" : "s"}
                    </span>
                  </button>
                  <Button variant="ghost" onClick={() => removeProgramme(p.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
