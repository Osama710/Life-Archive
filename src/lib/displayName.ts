import type { User } from "@supabase/supabase-js";

export function resolveDisplayName(
  profileName: string | null | undefined,
  user: User | null | undefined,
): string {
  if (profileName?.trim()) return profileName.trim();

  const meta = user?.user_metadata?.display_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();

  const email = user?.email;
  if (email) return email.split("@")[0] ?? "friend";

  return "friend";
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}
