import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "moderator" | "author" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: string[];
  editorRole: UserRole;
  isAdmin: boolean;
  isModerator: boolean;
  isAuthor: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  roles: [],
  editorRole: null,
  isAdmin: false,
  isModerator: false,
  isAuthor: false,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async (userId: string | null) => {
    if (!userId) {
      setRoles([]);
      return [];
    }
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
        return [];
      }
      const fetchedRoles = (data || []).map((r) => r.role);
      setRoles(fetchedRoles);
      return fetchedRoles;
    } catch (err) {
      console.error("Failed to load user roles:", err);
      setRoles([]);
      return [];
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user?.id) {
        await fetchRoles(data.session.user.id);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error("Failed to refresh auth state:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  useEffect(() => {
    // Safety timer to prevent any stuck loading spinner if network/storage stalls
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 4000);

    refresh().finally(() => clearTimeout(timeout));

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user?.id) {
        await fetchRoles(newSession.user.id);
      } else {
        setRoles([]);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, [refresh, fetchRoles]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoles([]);
  }, []);

  const editorRole: UserRole = useMemo(() => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("moderator")) return "moderator";
    if (roles.includes("author")) return "author";
    return null;
  }, [roles]);

  const value = useMemo(
    () => ({
      user,
      session,
      roles,
      editorRole,
      isAdmin: roles.includes("admin"),
      isModerator: roles.includes("moderator") || roles.includes("admin"),
      isAuthor: roles.includes("author") || roles.includes("admin"),
      loading,
      signOut,
      refresh,
    }),
    [user, session, roles, editorRole, loading, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
