import { component$, useSignal, $, useTask$ } from "@builder.io/qwik";
import type { Note, Folder } from "~/lib/api";

type Props = {
  note?: Note | null;
  folders: Folder[];
  onChange?: (partial: Partial<Note>) => void;
  onSave?: () => void;
};

// PUBLIC_INTERFACE
export const NoteEditor = component$<Props>(({ note, folders, onChange, onSave }) => {
  const titleSig = useSignal(note?.title || "");
  const contentSig = useSignal(note?.content || "");
  const tagsInputSig = useSignal("");
  const tagsSig = useSignal<string[]>(note?.tags || []);
  const folderSig = useSignal<string | "">((note?.folderId as string) || "");

  useTask$(({ track }) => {
    track(() => note?.id);
    titleSig.value = note?.title || "";
    contentSig.value = note?.content || "";
    tagsSig.value = note?.tags || [];
    folderSig.value = (note?.folderId as string) || "";
    tagsInputSig.value = "";
  });

  const pushChange$ = $(() => {
    onChange?.({
      title: titleSig.value,
      content: contentSig.value,
      tags: tagsSig.value,
      folderId: folderSig.value || null,
    });
  });

  const handleAddTag$ = $(() => {
    const t = tagsInputSig.value.trim();
    if (!t) return;
    if (!tagsSig.value.includes(t)) {
      tagsSig.value = [...tagsSig.value, t];
      pushChange$();
    }
    tagsInputSig.value = "";
  });

  const handleRemoveTag$ = $((t: string) => {
    tagsSig.value = tagsSig.value.filter((x) => x !== t);
    pushChange$();
  });

  const handleSave$ = $(() => onSave?.());

  return (
    <section class="editor">
      <div class="toolbar">
        <button class="btn btn-primary" onClick$={handleSave$} disabled={!note}>
          Save
        </button>
        <div style={{ marginLeft: "auto", color: "var(--color-text-muted)" }}>
          {note ? "Editing" : "Select or create a note"}
        </div>
      </div>
      <div class="editor-body">
        <div style={{ display: "grid", gap: "10px" }}>
          <input
            class="input"
            placeholder="Title"
            value={titleSig.value}
            onInput$={(e) => ((titleSig.value = (e.target as HTMLInputElement).value), pushChange$())}
            disabled={!note}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              class="input"
              value={folderSig.value}
              onChange$={(e) => ((folderSig.value = (e.target as HTMLSelectElement).value), pushChange$())}
              disabled={!note}
            >
              <option value="">No Folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <input
              class="chips-input"
              placeholder="Add tag and press Enter"
              value={tagsInputSig.value}
              onKeyDown$={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag$();
                }
              }}
              onInput$={(e) => (tagsInputSig.value = (e.target as HTMLInputElement).value)}
              disabled={!note}
            />
          </div>
          <div class="chips">
            {tagsSig.value.map((t) => (
              <span key={t} class="chip">
                #{t}
                <button
                  class="btn"
                  style={{ padding: "2px 6px", fontSize: "12px" }}
                  onClick$={() => handleRemoveTag$(t)}
                  disabled={!note}
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <textarea
            class="textarea"
            placeholder="Start writing..."
            value={contentSig.value}
            onInput$={(e) => ((contentSig.value = (e.target as HTMLTextAreaElement).value), pushChange$())}
            disabled={!note}
          />
        </div>
      </div>
    </section>
  );
});
