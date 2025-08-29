import { component$, $, useSignal } from "@builder.io/qwik";
import type { Note } from "~/lib/api";

type Props = {
  notes: Note[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew?: () => void;
  onDelete?: (id: string) => void;
};

// PUBLIC_INTERFACE
export const NotesList = component$<Props>(({ notes, selectedId, onSelect, onNew, onDelete }) => {
  const confirmId = useSignal<string | null>(null);

  const handleSelect$ = $((id: string) => onSelect(id));
  const handleDelete$ = $((id: string) => {
    if (confirmId.value === id) {
      onDelete?.(id);
      confirmId.value = null;
    } else {
      confirmId.value = id;
      setTimeout(() => {
        if (confirmId.value === id) confirmId.value = null;
      }, 2000);
    }
  });
  const handleNew$ = $(() => onNew?.());

  return (
    <section class="notes-list">
      <div class="toolbar">
        {onNew && (
          <button class="btn btn-accent" onClick$={handleNew$}>
            + New Note
          </button>
        )}
        <div style={{ marginLeft: "auto", color: "var(--color-text-muted)", fontSize: "12px" }}>
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </div>
      </div>
      <div role="list" aria-label="Notes">
        {notes.map((n) => (
          <article
            role="listitem"
            key={n.id}
            class="note-card"
            style={{ background: selectedId === n.id ? "#fffef3" : undefined }}
            onClick$={() => handleSelect$(n.id)}
          >
            <div class="note-title">{n.title || "(Untitled)"}</div>
            <div class="note-meta">
              {new Date(n.updatedAt || n.createdAt).toLocaleString()}
              {n.tags?.length ? <> · {n.tags.map((t) => `#${t}`).join(", ")}</> : null}
            </div>
            {onDelete && (
              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                <button class="btn" onClick$={(e) => (e.stopPropagation(), handleDelete$(n.id))}>
                  {confirmId.value === n.id ? "Confirm delete?" : "Delete"}
                </button>
              </div>
            )}
          </article>
        ))}
        {!notes.length && (
          <div style={{ padding: "18px", color: "var(--color-text-muted)" }}>No notes yet. Create one!</div>
        )}
      </div>
    </section>
  );
});
