// ============================================================================
// Auth helpers — thin wrapper around Supabase Auth (email + password).
//
// Auth is OPTIONAL: if Supabase isn't configured (`supabaseEnabled === false`)
// every function degrades gracefully so the site keeps working as guest-only.
// Passwords are never stored by us — Supabase Auth handles hashing.
// ============================================================================
import { supabase, supabaseEnabled } from "@/src/lib/supabase";

export { supabaseEnabled };

/**
 * Current session (or null). Safe to call when auth is disabled.
 * @returns {Promise<import("@supabase/supabase-js").Session | null>}
 */
export async function getSession() {
  if (!supabaseEnabled) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to auth changes (login / logout / token refresh). Returns an
 * unsubscribe function. No-op when auth is disabled.
 * @param {(session: import("@supabase/supabase-js").Session | null) => void} cb
 * @returns {() => void}
 */
export function onAuthChange(cb) {
  if (!supabaseEnabled) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session || null);
  });
  return () => {
    try {
      data?.subscription?.unsubscribe?.();
    } catch {
      /* ignore */
    }
  };
}

/**
 * Sign in with email + password.
 * @returns {Promise<{ user: object | null, session: object | null }>}
 * @throws the Supabase error (handled by friendlyAuthError in the UI)
 */
export async function signIn({ email, password }) {
  if (!supabaseEnabled) throw new Error("Authentication is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email || "").trim(),
    password,
  });
  if (error) throw error;
  return { user: data?.user || null, session: data?.session || null };
}

/**
 * Register a new account. The username is stored in user_metadata (a DB trigger
 * copies it into the `profiles` table — see supabase/auth_schema.sql).
 *
 * When the project requires email confirmation, `session` is null and
 * `needsConfirmation` is true so the UI can prompt the user to check their inbox.
 *
 * @returns {Promise<{ user: object|null, session: object|null, needsConfirmation: boolean }>}
 */
export async function signUp({ email, password, username }) {
  if (!supabaseEnabled) throw new Error("Authentication is not configured.");
  const { data, error } = await supabase.auth.signUp({
    email: String(email || "").trim(),
    password,
    options: {
      data: { username: String(username || "").trim() || null },
    },
  });
  if (error) throw error;
  return {
    user: data?.user || null,
    session: data?.session || null,
    needsConfirmation: Boolean(data?.user) && !data?.session,
  };
}

/** Sign the current user out. Safe to call when auth is disabled. */
export async function signOut() {
  if (!supabaseEnabled) return;
  try {
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
}

/**
 * Lightweight client-side validation run before hitting the network.
 * @returns {string} an error message, or "" when the input is valid.
 */
export function validateCredentials(email, password) {
  const e = String(email || "").trim();
  if (!e) return "Please enter your email address.";
  // Simple, permissive email shape check.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return "Please enter a valid email address.";
  }
  if (!password) return "Please enter a password.";
  if (String(password).length < 6) {
    return "Password must be at least 6 characters.";
  }
  return "";
}

/**
 * Turn a raw Supabase/auth error into a short, human-friendly message.
 * @param {unknown} err
 * @returns {string}
 */
export function friendlyAuthError(err) {
  const raw =
    (err && (err.message || err.error_description || err.msg)) ||
    (typeof err === "string" ? err : "") ||
    "";
  const msg = raw.toLowerCase();

  if (!msg) return "Something went wrong. Please try again.";
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "Incorrect email or password.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox for the link.";
  }
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "That email is already registered. Try logging in instead.";
  }
  if (msg.includes("password") && msg.includes("6")) {
    return "Password must be at least 6 characters.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  // Fall back to the raw message (capitalised) rather than a generic string.
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
