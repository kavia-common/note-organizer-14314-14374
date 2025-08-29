import { component$, $ } from "@builder.io/qwik";

type Props = {
  // Plain functions, will be invoked only inside local $ handlers
  onSearch: (q: string) => void;
  onNewNote?: () => void;
  userEmail?: string;
  onLogout?: () => void;
};

// PUBLIC_INTERFACE
export const Navbar = component$<Props>(({ onSearch, onNewNote, userEmail, onLogout }) => {
  /** Top navigation bar with search, new note, and auth controls */
  const handleInput$ = $((e: Event) => {
    const q = (e.target as HTMLInputElement).value;
    onSearch(q);
  });

  return (
    <header class="navbar">
      <strong class="navbar-title">Note Organizer</strong>
      <input class="nav-input" placeholder="Search notes..." onInput$={handleInput$} />
      <div class="navbar-spacer" />
      {onNewNote && (
        <button class="btn btn-accent" onClick$={() => onNewNote()}>
          + New
        </button>
      )}
      {userEmail ? (
        <>
          <span style={{ color: "var(--color-text-muted)", marginLeft: "8px" }}>{userEmail}</span>
          <button class="btn" onClick$={() => onLogout?.()}>
            Logout
          </button>
        </>
      ) : null}
    </header>
  );
});
