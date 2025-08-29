import { component$, useSignal, useVisibleTask$, $, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Navbar } from "~/components/Navbar";
import { Sidebar } from "~/components/Sidebar";
import { NotesList } from "~/components/NotesList";
import { NoteEditor } from "~/components/NoteEditor";
import { useAuthState } from "~/lib/auth";
import {
  apiCreateFolder,
  apiCreateNote,
  apiDeleteNote,
  apiGetMe,
  apiListFolders,
  apiListNotes,
  apiListTags,
  apiUpdateNote,
  type Folder,
  type Note,
  type Tag,
} from "~/lib/api";

// PUBLIC_INTERFACE
export default component$(() => {
  // auth
  const { tokenSig, userSig, setAuth, clearAuth } = useAuthState();
  const authChecked = useSignal(false);

  // data state
  const foldersSig = useSignal<Folder[]>([]);
  const tagsSig = useSignal<Tag[]>([]);
  const notesSig = useSignal<Note[]>([]);
  const selectedNoteId = useSignal<string | undefined>(undefined);
  const selectedNoteDraft = useSignal<Partial<Note> | null>(null);

  // filters
  const qSig = useSignal<string>("");
  const currentFolderId = useSignal<string | undefined>(undefined);
  const currentTag = useSignal<string | undefined>(undefined);

  const loadBasicData = $(async () => {
    try {
      const [folders, tags] = await Promise.all([apiListFolders(), apiListTags()]);
      foldersSig.value = folders;
      tagsSig.value = tags;
    } catch (e) {
      // ignore for now; unauthenticated may be redirected
    }
  });

  const loadNotes = $(async () => {
    const list = await apiListNotes({
      q: qSig.value || undefined,
      folderId: currentFolderId.value,
      tag: currentTag.value,
    });
    notesSig.value = list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    // auto-select first if none
    if (!selectedNoteId.value && list.length) {
      selectedNoteId.value = list[0].id;
      selectedNoteDraft.value = { ...list[0] };
    }
  });

  // Initial auth + data load
  useVisibleTask$(async () => {
    try {
      if (tokenSig.value) {
        const me = await apiGetMe();
        setAuth(tokenSig.value, me);
      }
      authChecked.value = true;
    } catch {
      // not logged in
      authChecked.value = true;
      window.location.href = "/auth/";
      return;
    }
    await loadBasicData();
    await loadNotes();
  });

  useTask$(({ track }) => {
    track(() => qSig.value);
    track(() => currentFolderId.value);
    track(() => currentTag.value);
    if (authChecked.value) {
      loadNotes();
    }
  });

  const onSearch = $((q: string) => {
    qSig.value = q;
  });

  const onNewNote = $(async () => {
    const now = new Date().toISOString();
    const created = await apiCreateNote({
      title: "Untitled",
      content: "",
      tags: [],
      folderId: currentFolderId.value || null,
      createdAt: now,
      updatedAt: now,
    } as Partial<Note>);
    notesSig.value = [created, ...notesSig.value];
    selectedNoteId.value = created.id;
    selectedNoteDraft.value = { ...created };
  });

  const onDelete = $(async (id: string) => {
    await apiDeleteNote(id);
    if (selectedNoteId.value === id) {
      selectedNoteId.value = undefined;
      selectedNoteDraft.value = null;
    }
    notesSig.value = notesSig.value.filter((n) => n.id !== id);
  });

  const onSelect = $((id: string) => {
    selectedNoteId.value = id;
    const n = notesSig.value.find((x) => x.id === id);
    selectedNoteDraft.value = n ? { ...n } : null;
  });

  const onDraftChange = $((partial: Partial<Note>) => {
    selectedNoteDraft.value = { ...(selectedNoteDraft.value || {}), ...partial };
  });

  const onSave = $(async () => {
    if (!selectedNoteId.value || !selectedNoteDraft.value) return;
    const updated = await apiUpdateNote(selectedNoteId.value, {
      ...selectedNoteDraft.value,
      updatedAt: new Date().toISOString(),
    });
    notesSig.value = notesSig.value.map((n) => (n.id === updated.id ? updated : n));
    selectedNoteDraft.value = { ...updated };
  });

  const onSelectFolder = $((id?: string) => {
    currentFolderId.value = id;
    currentTag.value = undefined;
  });
  const onSelectTag = $((t?: string) => {
    currentTag.value = t;
    currentFolderId.value = undefined;
  });
  const onAddFolder = $(async () => {
    const name = prompt("Folder name?");
    if (!name) return;
    const f = await apiCreateFolder(name);
    foldersSig.value = [...foldersSig.value, f];
  });

  const logout = $(() => {
    clearAuth();
    window.location.href = "/auth/";
  });

  if (!authChecked.value) {
    return <div style={{ padding: "24px" }}>Loading...</div>;
  }

  return (
    <div class="app">
      <Navbar
        onSearch={(q) => onSearch(q)}
        onNewNote={() => onNewNote()}
        userEmail={userSig.value?.email}
        onLogout={() => logout()}
      />
      <div class="main">
        <Sidebar
          folders={foldersSig.value}
          tags={tagsSig.value}
          currentFolderId={currentFolderId.value}
          currentTag={currentTag.value}
          onSelectFolder={(id) => onSelectFolder(id)}
          onSelectTag={(t) => onSelectTag(t)}
          onAddFolder={() => onAddFolder()}
        />
        <NotesList
          notes={notesSig.value}
          selectedId={selectedNoteId.value}
          onSelect={(id) => onSelect(id)}
          onNew={() => onNewNote()}
          onDelete={(id) => onDelete(id)}
        />
        <NoteEditor
          note={
            selectedNoteId.value
              ? notesSig.value.find((n) => n.id === selectedNoteId.value)
              : null
          }
          folders={foldersSig.value}
          onChange={(p) => onDraftChange(p)}
          onSave={() => onSave()}
        />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Note Organizer",
  meta: [
    {
      name: "description",
      content: "Create, edit, search and organize notes by tags and folders.",
    },
  ],
};
