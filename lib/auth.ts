export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  district: string;
  state: string;
  taluk: string;
  assignedTaluks: string[];
}

export function getLoggedInUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}
