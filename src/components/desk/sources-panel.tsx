import { useState } from "react";

import { DOCUMENT_KINDS, type DocumentKind } from "@/lib/source-pack";
import { useDesk, useProgramme } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";

export function SourcesPanel({ pid }: { pid: string }) {
  const prog = useProgramme(pid);
  const addDocument = useDesk((s) => s.addDocument);
  const updateDocument = useDesk((s) => s.updateDocument);
  const removeDocument = useDesk((s) => s.removeDocument);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<DocumentKind>("TOR");
  const [openId, setOpenId] = useState<string | null>(null);
  if (!prog) return null;

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const isText = /\.(txt|md|csv|json)$/i.test(file.name) || file.type.startsWith("text/");
      if (!isText) {
        addDocument(pid, {
          title: file.name,
          kind: "OTHER",
          date: new Date().toISOString().slice(0, 10),
          body: "",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        addDocument(pid, {
          title: file.name.replace(/\.[^.]+$/, ""),
          kind,
          date: new Date().toISOString().slice(0, 10),
          body: String(reader.result ?? ""),
        });
      };
      reader.readAsText(file);
    });
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Source documents</p>
      <p className="mt-1 text-xs leading-snug text-muted">
        Auto reads these. Paste TOR / proposal / logframe text. PDF must be pasted as text.
      </p>
      <ul className="mt-3 space-y-2">
        {prog.documents.map((d) => (
          <li key={d.id} className="rounded-[var(--radius-sm)] border border-border bg-bg p-2">
            <button
              type="button"
              className="w-full text-left text-xs"
              onClick={() => setOpenId(openId === d.id ? null : d.id)}
            >
              <span className="font-medium">{d.title || "Untitled"}</span>
              <span className="mt-0.5 block text-faint">
                {d.kind}
                {d.body.trim() ? "" : " · no text yet"}
              </span>
            </button>
            {openId === d.id ? (
              <div className="mt-2 space-y-2">
                <Input
                  value={d.title}
                  onChange={(e) => updateDocument(pid, d.id, { title: e.target.value })}
                />
                <Select
                  value={d.kind}
                  onChange={(e) =>
                    updateDocument(pid, d.id, { kind: e.target.value as DocumentKind })
                  }
                >
                  {DOCUMENT_KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </Select>
                <Textarea
                  rows={8}
                  value={d.body}
                  onChange={(e) => updateDocument(pid, d.id, { body: e.target.value })}
                  placeholder="Paste the document text."
                />
                <button
                  type="button"
                  className="text-xs text-danger underline"
                  onClick={() => removeDocument(pid, d.id)}
                >
                  Remove
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-2">
        <Label>Add document</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <Select value={kind} onChange={(e) => setKind(e.target.value as DocumentKind)}>
          {DOCUMENT_KINDS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </Select>
        <Input type="file" multiple accept=".txt,.md,.csv,.json,text/plain" onChange={(e) => onFiles(e.target.files)} />
        <Button
          variant="outline"
          onClick={() => {
            addDocument(pid, {
              title: title.trim() || "Untitled document",
              kind,
              date: new Date().toISOString().slice(0, 10),
              body: "",
            });
            setTitle("");
          }}
        >
          Add blank document
        </Button>
      </div>
    </section>
  );
}
