import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, UserCog, Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/admin/users")({
  beforeLoad: async ({ location }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname + location.search + location.hash },
      });
    }

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);

    const list = (roles || []).map((r) => r.role);
    if (!list.includes("admin")) {
      throw redirect({
        to: "/admin/queue",
        replace: true,
      });
    }
  },
  component: AdminUsers,
});

type AppRole = "admin" | "moderator" | "author" | "reader";

interface Profile {
  id: string;
  full_name: string | null;
  institution: string | null;
  country: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

const AVAILABLE_ROLES: AppRole[] = ["admin", "moderator", "author", "reader"];

function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUserId(session.user.id);

      // Fetch all profiles
      const { data: profs, error: profsErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (profsErr) throw profsErr;

      // Fetch all roles
      const { data: roles, error: rolesErr } = await supabase.from("user_roles").select("*");
      if (rolesErr) throw rolesErr;

      setProfiles(profs || []);
      setUserRoles(roles || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users and roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleRole = async (userId: string, roleName: AppRole, hasRole: boolean) => {
    if (userId === currentUserId && roleName === "admin" && hasRole) {
      toast.error("You cannot demote yourself from admin to prevent accidental lockout!");
      return;
    }

    try {
      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", roleName);
        if (error) throw error;
        toast.success(`Removed role '${roleName}'`);
      } else {
        // Add role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: roleName });
        if (error) throw error;
        toast.success(`Assigned role '${roleName}'`);
      }
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  // Helper to get roles for a user
  const getUserRolesList = (userId: string): AppRole[] => {
    if (!userRoles) return [];
    return userRoles.filter((r) => r.user_id === userId).map((r) => r.role);
  };

  if (loading && !profiles) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange" />
        <span className="ml-3 text-sm text-muted-foreground">Loading users console...</span>
      </div>
    );
  }

  // Filter profiles based on search query
  const filteredProfiles = (profiles || []).filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameMatch = (p.full_name || "").toLowerCase().includes(query);
    const institutionMatch = (p.institution || "").toLowerCase().includes(query);
    const countryMatch = (p.country || "").toLowerCase().includes(query);

    // Check if roles match search query
    const roles = getUserRolesList(p.id);
    const roleMatch = roles.some((r) => r.toLowerCase().includes(query));

    return nameMatch || institutionMatch || countryMatch || roleMatch;
  });

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-50";
      case "moderator":
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50";
      case "author":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50";
      case "reader":
        return "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-50";
      default:
        return "bg-secondary text-secondary-foreground border-transparent";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">User & Role Manager</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Manage system permissions, view user profiles, and promote or demote moderators and
          admins.
        </p>
      </div>

      <div className="flex items-center gap-3 max-w-md" role="search" aria-label="Search users">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, institution, country, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-paper border-rule focus-visible:ring-orange"
          />
        </div>
      </div>

      <div className="border border-rule rounded-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] font-condensed uppercase tracking-wider text-xs px-4 py-3">
                  Profile
                </TableHead>
                <TableHead className="font-condensed uppercase tracking-wider text-xs px-4 py-3">
                  Institution
                </TableHead>
                <TableHead className="font-condensed uppercase tracking-wider text-xs px-4 py-3">
                  Country
                </TableHead>
                <TableHead className="font-condensed uppercase tracking-wider text-xs px-4 py-3">
                  Current Roles
                </TableHead>
                <TableHead className="w-[120px] text-right font-condensed uppercase tracking-wider text-xs px-4 py-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No profiles found matching search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((p) => {
                  const roles = getUserRolesList(p.id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-display text-sm text-ink shrink-0 font-medium">
                            {(p.full_name || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-display font-medium text-ink truncate text-sm">
                              {p.full_name || "Unnamed User"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Joined {new Date(p.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-ink font-sans truncate max-w-[200px]">
                        {p.institution || <span className="text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-ink font-sans">
                        {p.country || <span className="text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {roles.length === 0 ? (
                            <Badge
                              variant="outline"
                              className="bg-slate-50 text-slate-400 border-slate-200"
                            >
                              No Role
                            </Badge>
                          ) : (
                            roles.map((r) => (
                              <Badge key={r} variant="outline" className={getRoleBadgeColor(r)}>
                                {r}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-rule text-xs uppercase tracking-wider font-condensed"
                            >
                              <UserCog className="h-3.5 w-3.5 mr-1.5" /> Roles
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-popover border-rule">
                            <DropdownMenuLabel className="font-condensed text-xs uppercase tracking-wide">
                              Modify Roles
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-rule" />
                            {AVAILABLE_ROLES.map((r) => {
                              const isAssigned = roles.includes(r);
                              const isSelfAdmin = p.id === currentUserId && r === "admin";
                              return (
                                <DropdownMenuCheckboxItem
                                  key={r}
                                  checked={isAssigned}
                                  disabled={isSelfAdmin}
                                  onCheckedChange={() => toggleRole(p.id, r, isAssigned)}
                                  className="text-xs font-sans cursor-pointer focus:bg-secondary focus:text-ink"
                                >
                                  {r.charAt(0).toUpperCase() + r.slice(1)}
                                </DropdownMenuCheckboxItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
