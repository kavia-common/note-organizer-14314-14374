import { component$, $ } from "@builder.io/qwik";
import type { Folder, Tag } from "~/lib/api";

type Props = {
  folders: Folder[];
  tags: Tag[];
  currentFolderId?: string;
  currentTag?: string;
  onSelectFolder: (id?: string) => void;
  onSelectTag: (tag?: string) => void;
  onAddFolder?: () => void;
};

// PUBLIC_INTERFACE
export const Sidebar = component$<Props>(
  ({ folders, tags, currentFolderId, currentTag, onSelectFolder, onSelectTag, onAddFolder }) => {
    const handleFolderClick$ = $((id?: string) => onSelectFolder(id));
    const handleTagClick$ = $((t?: string) => onSelectTag(t));
    const handleAddFolder$ = $(() => onAddFolder?.());

    return (
      <aside class="sidebar">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "4px 6px",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--color-secondary)" }}>Library</div>
          {onAddFolder && (
            <button class="btn" onClick$={handleAddFolder$} title="Add folder">
              + Folder
            </button>
          )}
        </div>

        <div class="section-title">Folders</div>
        <ul class="list">
          <li
            class={`list-item ${!currentFolderId ? "active" : ""}`}
            onClick$={() => handleFolderClick$(undefined)}
            role="button"
          >
            <span>All Notes</span>
          </li>
          {folders.map((f) => (
            <li
              key={f.id}
              class={`list-item ${currentFolderId === f.id ? "active" : ""}`}
              onClick$={() => handleFolderClick$(f.id)}
              role="button"
            >
              <span>{f.name}</span>
              {typeof f.count === "number" && (
                <span class="note-meta" style={{ marginLeft: "auto" }}>
                  {f.count}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div class="section-title">Tags</div>
        <ul class="list">
          <li
            class={`list-item ${!currentTag ? "active" : ""}`}
            onClick$={() => handleTagClick$(undefined)}
            role="button"
          >
            <span>All Tags</span>
          </li>
          {tags.map((t) => (
            <li
              key={t.id}
              class={`list-item ${currentTag === t.name ? "active" : ""}`}
              onClick$={() => handleTagClick$(t.name)}
              role="button"
            >
              <span>#{t.name}</span>
              {typeof t.count === "number" && (
                <span class="note-meta" style={{ marginLeft: "auto" }}>
                  {t.count}
                </span>
              )}
            </li>
          ))}
        </ul>
      </aside>
    );
  },
);
