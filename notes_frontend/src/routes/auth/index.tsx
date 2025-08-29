import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { apiLogin, apiRegister } from "~/lib/api";
import { useAuthState } from "~/lib/auth";

export const onGet: RequestHandler = async () => {
  // no-op
};

// PUBLIC_INTERFACE
export default component$(() => {
  /** Auth page with login/register */
  const email = useSignal("");
  const password = useSignal("");
  const mode = useSignal<"login" | "register">("login");
  const error = useSignal<string>("");

  const { setAuth, userSig } = useAuthState();

  useVisibleTask$(() => {
    // If already logged in, redirect to home
    if (userSig.value) {
      window.location.href = "/";
    }
  });

  const submit$ = $(async () => {
    try {
      error.value = "";
      if (mode.value === "login") {
        const res = await apiLogin(email.value, password.value);
        setAuth(res.token, res.user);
      } else {
        const res = await apiRegister(email.value, password.value);
        setAuth(res.token, res.user);
      }
      window.location.href = "/";
    } catch (e: any) {
      error.value = e?.message || "Authentication failed";
    }
  });

  return (
    <div class="auth-card">
      <h2 class="auth-title">{mode.value === "login" ? "Login" : "Create account"}</h2>
      <div style={{ display: "grid", gap: "10px" }}>
        <label>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Email</div>
          <input class="input" type="email" value={email.value} onInput$={(e) => (email.value = (e.target as HTMLInputElement).value)} />
        </label>
        <label>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Password</div>
          <input class="input" type="password" value={password.value} onInput$={(e) => (password.value = (e.target as HTMLInputElement).value)} />
        </label>
        {error.value && <div style={{ color: "crimson" }}>{error.value}</div>}
        <button class="btn btn-primary" onClick$={submit$}>
          {mode.value === "login" ? "Login" : "Register"}
        </button>
        <button
          class="btn"
          onClick$={() => (mode.value = mode.value === "login" ? "register" : "login")}
          type="button"
        >
          {mode.value === "login" ? "Need an account? Register" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Auth - Note Organizer",
  meta: [{ name: "description", content: "Login or register to use Note Organizer" }],
};
