import { Link } from "@tanstack/react-router";

import { CHAIRS, stageById, stagesFor, type StageId } from "@/lib/aa-process";
import { useHydrated } from "@/lib/hydrate";
import { useDesk, useProgramme } from "@/lib/store";
import { cn } from "@/lib/utils";
import { EthicsPanel } from "@/components/desk/ethics-panel";
import { FieldPanel } from "@/components/desk/field-panel";
import { InceptionPanel } from "@/components/desk/inception-panel";
import { PurposePanel } from "@/components/desk/purpose-panel";
import { SourcesPanel } from "@/components/desk/sources-panel";
import { TocPanel } from "@/components/desk/toc-panel";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const STATE_LABEL = {
  idle: "Not started",
  working: "Working",
  ready: "Ready",
  accepted: "Accepted",
} as const;

export function DeskShell({ pid }: { pid: string }) {
  const hydrated = useHydrated();
  const prog = useProgramme(pid);
  const notice = useDesk((s) => s.notice);
  const busy = useDesk((s) => s.busy);
  const setChair = useDesk((s) => s.setChair);
  const setStage = useDesk((s) => s.setStage);
  const automate = useDesk((s) => s.automate);
  const accept = useDesk((s) => s.accept);
  const unlock = useDesk((s) => s.unlock);
  const resetWalk = useDesk((s) => s.resetWalk);
  const patchProgramme = useDesk((s) => s.patchProgramme);

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-bg px-6 py-10 text-muted">Opening desk…</main>
    );
  }

  if (!prog) {
    return (
      <main className="min-h-screen bg-bg px-6 py-10">
        <p className="text-muted">This programme is not on the desk.</p>
        <Link to="/" className="mt-3 inline-block text-sm underline">
          All programmes
        </Link>
      </main>
    );
  }

  const def = stageById(prog.stageId);
  const meta = prog.stages[prog.stageId];
  const locked = meta.state === "accepted";
  const list = stagesFor(prog.chair);
  const hasText = prog.documents.some((d) => d.body.trim());

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/" className="text-xs uppercase tracking-[0.14em] text-muted">
              Altamont Advisory · IMP · All programmes
            </Link>
            <Button variant="ghost" onClick={() => resetWalk(pid)}>
              Reset this walk
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Label>Programme</Label>
              <Input
                value={prog.name}
                onChange={(e) => patchProgramme(pid, { name: e.target.value })}
              />
            </div>
            <div>
              <Label>Client</Label>
              <Input
                value={prog.client}
                onChange={(e) => patchProgramme(pid, { client: e.target.value })}
              />
            </div>
            <div>
              <Label>Period</Label>
              <Input
                value={prog.period}
                onChange={(e) => patchProgramme(pid, { period: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Walk as (signed on Accept)</Label>
              <Input
                value={prog.walkAs}
                onChange={(e) => patchProgramme(pid, { walkAs: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>ICC (default — country can override)</Label>
              <Input
                value={prog.defaultIcc}
                placeholder="Named in-country consultant"
                onChange={(e) => patchProgramme(pid, { defaultIcc: e.target.value })}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="grid gap-2">
            {CHAIRS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChair(pid, c.id)}
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-3 text-left",
                  prog.chair === c.id
                    ? "border-fg bg-fg text-surface"
                    : "border-border bg-surface text-fg hover:bg-sunken",
                )}
              >
                <div className="text-sm font-medium">{c.door}</div>
                <div
                  className={cn(
                    "mt-1 text-xs leading-snug",
                    prog.chair === c.id ? "text-surface/70" : "text-muted",
                  )}
                >
                  {c.paper}
                </div>
              </button>
            ))}
          </div>
          <nav className="rounded-[var(--radius-lg)] border border-border bg-surface p-2">
            <ol>
              {list.map((s) => {
                const st = prog.stages[s.id];
                const active = s.id === prog.stageId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setStage(pid, s.id)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-left text-sm",
                        active ? "bg-sunken" : "hover:bg-bg",
                      )}
                    >
                      <span className="mt-0.5 w-4 shrink-0 font-mono text-xs text-faint">{s.n}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block leading-snug">{s.label}</span>
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {s.built ? STATE_LABEL[st.state] : "Not this walk"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <SourcesPanel pid={pid} />
        </aside>

        <main className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-6">
          {def ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Stage {def.n}
                    {def.built ? "" : " · not built"}
                  </p>
                  <h2 className="mt-1 text-xl">{def.label}</h2>
                </div>
                <span className="text-xs font-medium text-muted">
                  {def.built ? STATE_LABEL[meta.state] : "Later"}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{def.purpose}</p>
              <p className="mt-2 max-w-2xl text-sm">
                <span className="font-medium">Accepted when. </span>
                {def.acceptedWhen}
              </p>

              {def.built ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant={meta.mode === "auto" ? "primary" : "outline"}
                    disabled={locked || busy}
                    onClick={() => void automate(pid, prog.stageId)}
                  >
                    {busy ? "Reading documents…" : "Automate this step"}
                  </Button>
                  <Button variant={meta.mode === "manual" ? "primary" : "outline"} disabled={locked}>
                    Do this step myself
                  </Button>
                  {locked ? (
                    <Button variant="ghost" onClick={() => unlock(pid, prog.stageId)}>
                      Unlock
                    </Button>
                  ) : (
                    <Button onClick={() => accept(pid, prog.stageId)}>Accept this stage</Button>
                  )}
                </div>
              ) : null}

              {def.built && !hasText ? (
                <p className="mt-3 text-sm text-hold">
                  No document text on this programme yet. Paste a TOR or proposal in Source
                  documents, or write the object by hand.
                </p>
              ) : null}

              {notice ? (
                <p className="mt-4 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm">
                  {notice}
                </p>
              ) : null}

              <div className="mt-6 border-t border-border pt-5">
                <StageBody id={prog.stageId} built={def.built} pid={pid} />
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function StageBody({ id, built, pid }: { id: StageId; built: boolean; pid: string }) {
  if (id === "purpose") return <PurposePanel pid={pid} />;
  if (id === "toc") return <TocPanel pid={pid} />;
  if (id === "inception") return <InceptionPanel pid={pid} />;
  if (id === "protocols") return <EthicsPanel pid={pid} />;
  if (id === "field") return <FieldPanel pid={pid} />;
  if (!built) {
    return (
      <p className="text-sm text-muted">
        This stage is on the rail so the process is visible. The object is not built in this
        walk. Auto is disabled. Accept is disabled. That is deliberate.
      </p>
    );
  }
  return null;
}
