"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getInitials, resolveDisplayName } from "@/lib/displayName";

export function useDisplayName() {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfileName(null);
      setLoading(false);
      return;
    }

    const meta = user.user_metadata?.display_name;
    if (typeof meta === "string" && meta.trim()) {
      setProfileName(meta.trim());
    }

    let cancelled = false;
    const supabase = createClient();

    void (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;
        if (data?.display_name?.trim()) {
          setProfileName(data.display_name.trim());
        }
      } catch {
        // profile fetch is best-effort; metadata fallback still works
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = resolveDisplayName(profileName, user);

  const updateDisplayName = async (name: string) => {
    if (!user) throw new Error("Not signed in");

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    const supabase = createClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", user.id);

    if (profileError) throw profileError;

    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: trimmed },
    });

    if (authError) throw authError;

    setProfileName(trimmed);
  };

  return {
    displayName,
    initials: getInitials(displayName),
    loading,
    updateDisplayName,
  };
}
