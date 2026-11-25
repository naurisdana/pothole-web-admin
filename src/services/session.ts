const ONBOARDING_KEY = "roadsafe.onboarding.done";
const SESSION_KEY = "roadsafe.session";
const TOKEN_KEY = "roadsafe.token";
const USER_KEY = "roadsafe.user";

export type SessionUser = {
  nama: string;
  email: string;
  peran: string;
};

export function isOnboarded(): boolean {
  return window.localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function completeOnboarding(): void {
  window.localStorage.setItem(ONBOARDING_KEY, "1");
}

export function readSession(): string | null {
  const email = window.localStorage.getItem(SESSION_KEY);
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!email || !token) return null;
  return email;
}

export function readToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function readUser(): SessionUser | null {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed.email || !parsed.nama) return null;
    return {
      nama: parsed.nama,
      email: parsed.email,
      peran: parsed.peran ?? "verifikator",
    };
  } catch {
    return null;
  }
}

export function startSession(email: string, token?: string, user?: SessionUser): void {
  window.localStorage.setItem(SESSION_KEY, email);
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function endSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
