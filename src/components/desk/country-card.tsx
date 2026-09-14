import {
  dueLabel,
  liveRequestStatus,
  PATH_LABEL,
  reviewDeadline,
} from "@/lib/country";
import { countryPathLegal } from "@/lib/gates";
import type { CountryUnit, EthicsPath, YesNoUnknown } from "@/lib/objects";
import { useDesk } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";

const PATHS: EthicsPath[] = ["UNKNOWN", "REQUIRED", "IN_PROCESS", "NOT_REQUIRED", "CLEARED"];
const YNU: { value: YesNoUnknown; label: string }[] = [
  { value: "unknown", label: "Unknown" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "na", label: "N/A" },
];

function pathClass(path: EthicsPath) {
  if (path === "CLEARED") return "text-cleared";
  if (path === "NOT_REQUIRED") return "text-cleared";
  if (path === "IN_PROCESS") return "text-hold";
  if (path === "REQUIRED") return "text-hold";
  return "text-open";
}

export function CountryCard({
  pid,
  country,
  locked,
}: {
  pid: string;
  country: CountryUnit;
  locked: boolean;
}) {
  const patchCountry = useDesk((s) => s.patchCountry);
  const setCountryPath = useDesk((s) => s.setCountryPath);
  const setScrutiny = useDesk((s) => s.setScrutiny);
  const attachLetter = useDesk((s) => s.attachLetter);
  const addRequest = useDesk((s) => s.addRequest);
  const patchRequest = useDesk((s) => s.patchRequest);
  const sendRequest = useDesk((s) => s.sendRequest);
  const markRequest = useDesk((s) => s.markRequest);
  const legal = countryPathLegal(country);
  const review = reviewDeadline(country);

  return (
    <article className="space-y-4 rounded-[var(--radius-md)] border border-border bg-bg p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-medium">{country.name}</h4>
          {country.notes ? <p className="text-sm text-muted">{country.notes}</p> : null}
        </div>
        <span className={cn("text-xs font-medium uppercase tracking-wide", pathClass(country.path))}>
          {PATH_LABEL[country.path]}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>ICC (this country)</Label>
          <Input
            disabled={locked}
            value={country.icc}
            placeholder="Inherits programme ICC if blank"
            onChange={(e) => patchCountry(pid, country.id, { icc: e.target.value })}
          />
        </div>
        <div>
          <Label>Country focal point</Label>
          <Input
            disabled={locked}
            value={country.focalPoint}
            placeholder="Name — ICC talks to them directly"
            onChange={(e) => patchCountry(pid, country.id, { focalPoint: e.target.value })}
          />
        </div>
        <div>
          <Label>Focal point role</Label>
          <Input
            disabled={locked}
            value={country.focalRole}
            onChange={(e) => patchCountry(pid, country.id, { focalRole: e.target.value })}
          />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          disabled={locked}
          checked={country.heightenedScrutiny}
          onChange={(e) => setScrutiny(pid, country.id, e.target.checked, country.scrutinyNote)}
        />
        <span>
          Heightened government scrutiny — Auto cannot unset this. Not required is closed. Use a
          letter.
          <Input
            className="mt-2"
            disabled={locked || !country.heightenedScrutiny}
            placeholder="Why this country (optional note)"
            value={country.scrutinyNote}
            onChange={(e) => patchCountry(pid, country.id, { scrutinyNote: e.target.value })}
          />
        </span>
      </label>

      <div>
        <h5 className="text-sm font-medium">Ethics investigation</h5>
        <p className="mt-1 text-xs text-muted">
          Three questions. Auto may draft them as a request. Auto may not answer them.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Approval required for the programme?</Label>
            <Select
              disabled={locked}
              value={country.programmeApprovalRequired || "unknown"}
              onChange={(e) =>
                patchCountry(pid, country.id, {
                  programmeApprovalRequired: e.target.value as YesNoUnknown,
                })
              }
            >
              {YNU.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Was it obtained?</Label>
            <Select
              disabled={locked}
              value={country.programmeApprovalObtained || "unknown"}
              onChange={(e) =>
                patchCountry(pid, country.id, {
                  programmeApprovalObtained: e.target.value as YesNoUnknown,
                })
              }
            >
              {YNU.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Evaluation treated the same?</Label>
            <Select
              disabled={locked}
              value={country.evaluationSameAsProgramme || "unknown"}
              onChange={(e) =>
                patchCountry(pid, country.id, {
                  evaluationSameAsProgramme: e.target.value as YesNoUnknown,
                })
              }
            >
              {YNU.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Ethics path</Label>
          <Select
            disabled={locked}
            value={country.path}
            onChange={(e) => setCountryPath(pid, country.id, e.target.value as EthicsPath)}
          >
            {PATHS.map((st) => (
              <option key={st} value={st}>
                {PATH_LABEL[st]}
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
              if (file) attachLetter(pid, country.id, file.name);
            }}
          />
          {country.letterName ? (
            <p className="mt-1 font-mono text-xs text-faint">
              {country.letterName}
              {country.letterDate ? ` · ${country.letterDate}` : ""}
            </p>
          ) : (
            <p className="mt-1 text-xs text-faint">No letter attached</p>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Who at the country office confirmed (for Not required)</Label>
            <Input
              disabled={locked}
              value={country.notRequiredConfirmedBy}
              placeholder="Name, not Altamont"
              onChange={(e) =>
                patchCountry(pid, country.id, { notRequiredConfirmedBy: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Date of confirmation</Label>
            <Input
              type="date"
              disabled={locked}
              value={country.notRequiredConfirmedAt}
              onChange={(e) =>
                patchCountry(pid, country.id, { notRequiredConfirmedAt: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Confirmation covers</Label>
            <Select
              disabled={locked}
              value={country.notRequiredAppliesTo}
              onChange={(e) =>
                patchCountry(pid, country.id, {
                  notRequiredAppliesTo: e.target.value as CountryUnit["notRequiredAppliesTo"],
                })
              }
            >
              <option value="">Select…</option>
              <option value="programme">Programme only — not enough</option>
              <option value="evaluation">The evaluation</option>
              <option value="both">Programme and evaluation</option>
            </Select>
          </div>
          <div>
            <Label>Note</Label>
            <Input
              disabled={locked}
              value={country.notRequiredNote}
              onChange={(e) => patchCountry(pid, country.id, { notRequiredNote: e.target.value })}
            />
          </div>
        </div>

      {country.path === "IN_PROCESS" || country.path === "REQUIRED" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Submitted to reviewers</Label>
            <Input
              type="date"
              disabled={locked}
              value={country.submittedAt}
              onChange={(e) => patchCountry(pid, country.id, { submittedAt: e.target.value })}
            />
          </div>
          <div>
            <Label>Expected review (days)</Label>
            <Select
              disabled={locked}
              value={String(country.expectedDays || 45)}
              onChange={(e) =>
                patchCountry(pid, country.id, { expectedDays: Number(e.target.value) })
              }
            >
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </Select>
            {review ? (
              <p className={cn("mt-1 text-xs", review.overdue ? "text-danger" : "text-hold")}>
                {review.label}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {!legal.ok ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-danger">
          {legal.gaps.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      ) : null}

      <section className="space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between gap-2">
          <h5 className="text-sm font-medium">48-hour requests</h5>
          <Button variant="outline" disabled={locked} onClick={() => addRequest(pid, country.id)}>
            Add request
          </Button>
        </div>
        {country.requests.length === 0 ? (
          <p className="text-sm text-muted">
            No requests yet. Automate this step to draft the three ethics questions, or add one.
          </p>
        ) : null}
        {country.requests.map((r) => {
          const live = liveRequestStatus(r);
          return (
            <div key={r.id} className="rounded-[var(--radius-sm)] border border-border bg-surface p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    live === "overdue"
                      ? "text-danger"
                      : live === "complete"
                        ? "text-cleared"
                        : live === "open"
                          ? "text-hold"
                          : "text-muted",
                  )}
                >
                  {live}
                </span>
                <span className="text-xs text-faint">{dueLabel(r)}</span>
              </div>
              <Label className="mt-2">Asked</Label>
              <Textarea
                rows={3}
                disabled={locked || r.status !== "draft"}
                value={r.asked}
                onChange={(e) =>
                  patchRequest(pid, country.id, r.id, { asked: e.target.value })
                }
              />
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>To (focal point)</Label>
                  <Input
                    disabled={locked || r.status !== "draft"}
                    value={r.askedTo}
                    placeholder={country.focalPoint || "Country focal point"}
                    onChange={(e) =>
                      patchRequest(pid, country.id, r.id, { askedTo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>By (ICC)</Label>
                  <Input
                    disabled={locked || r.status !== "draft"}
                    value={r.askedBy}
                    placeholder={country.icc || "ICC"}
                    onChange={(e) =>
                      patchRequest(pid, country.id, r.id, { askedBy: e.target.value })
                    }
                  />
                </div>
              </div>
              {r.status !== "draft" ? (
                <div className="mt-2">
                  <Label>What they confirmed</Label>
                  <Textarea
                    rows={2}
                    disabled={locked || r.status === "complete"}
                    value={r.responseNote}
                    onChange={(e) =>
                      patchRequest(pid, country.id, r.id, { responseNote: e.target.value })
                    }
                  />
                </div>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {r.status === "draft" ? (
                  <Button onClick={() => sendRequest(pid, country.id, r.id)}>
                    Send — start 48h clock
                  </Button>
                ) : r.status !== "complete" ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        markRequest(pid, country.id, r.id, "complete", r.responseNote)
                      }
                    >
                      Mark complete
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        markRequest(pid, country.id, r.id, "incomplete", r.responseNote)
                      }
                    >
                      Mark incomplete
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </section>
    </article>
  );
}
