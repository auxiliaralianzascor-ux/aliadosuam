import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AllyDirection, FollowupArea } from "./allies-types";

export type AppRole = "admin" | "member";

export interface MyPermissions {
  userId: string | null;
  isAdmin: boolean;
  isMember: boolean;
  areas: FollowupArea[];
  directions: AllyDirection[];
}

export function useMyPermissions() {
  return useQuery({
    queryKey: ["my-permissions"],
    staleTime: 60_000,
    queryFn: async (): Promise<MyPermissions> => {
      const { data: u } = await supabase.auth.getUser();
      const user = u.user;
      if (!user) return { userId: null, isAdmin: false, isMember: false, areas: [], directions: [] };
      const [{ data: roles }, { data: areas }, { data: directions }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("user_areas").select("area").eq("user_id", user.id),
        (supabase.from as unknown as (t: string) => { select: (c: string) => { eq: (k: string, v: string) => Promise<{ data: { direction: string }[] | null }> } })("user_directions").select("direction").eq("user_id", user.id),
      ]);
      const roleSet = new Set((roles ?? []).map((r) => r.role as AppRole));
      return {
        userId: user.id,
        isAdmin: roleSet.has("admin"),
        isMember: roleSet.has("member"),
        areas: (areas ?? []).map((a) => a.area as FollowupArea),
        directions: (directions ?? []).map((d) => d.direction as AllyDirection),
      };
    },
  });
}

export function canEditArea(perms: MyPermissions | undefined, area: FollowupArea) {
  if (!perms) return false;
  if (perms.isAdmin) return true;
  return perms.areas.includes(area);
}

export function canEditDirection(perms: MyPermissions | undefined, direction: AllyDirection) {
  if (!perms) return false;
  if (perms.isAdmin) return true;
  return perms.directions.includes(direction);
}

// --- Admin: user management ---

export interface ManagedUser {
  id: string;
  email: string | null;
  display_name: string | null;
  roles: AppRole[];
  areas: FollowupArea[];
  directions: AllyDirection[];
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["managed-users"],
    queryFn: async (): Promise<ManagedUser[]> => {
      const [{ data: profiles, error: pe }, { data: roles, error: re }, { data: areas, error: ae }, dirsRes] = await Promise.all([
        supabase.from("profiles").select("id, email, display_name"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("user_areas").select("user_id, area"),
        (supabase.from as unknown as (t: string) => { select: (c: string) => Promise<{ data: { user_id: string; direction: string }[] | null; error: unknown }> })("user_directions").select("user_id, direction"),
      ]);
      if (pe) throw pe;
      if (re) throw re;
      if (ae) throw ae;
      if (dirsRes.error) throw dirsRes.error;
      const rolesByUser = new Map<string, AppRole[]>();
      (roles ?? []).forEach((r) => {
        const arr = rolesByUser.get(r.user_id) ?? [];
        arr.push(r.role as AppRole);
        rolesByUser.set(r.user_id, arr);
      });
      const areasByUser = new Map<string, FollowupArea[]>();
      (areas ?? []).forEach((a) => {
        const arr = areasByUser.get(a.user_id) ?? [];
        arr.push(a.area as FollowupArea);
        areasByUser.set(a.user_id, arr);
      });
      const dirsByUser = new Map<string, AllyDirection[]>();
      (dirsRes.data ?? []).forEach((d) => {
        const arr = dirsByUser.get(d.user_id) ?? [];
        arr.push(d.direction as AllyDirection);
        dirsByUser.set(d.user_id, arr);
      });
      return (profiles ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        display_name: p.display_name,
        roles: rolesByUser.get(p.id) ?? [],
        areas: areasByUser.get(p.id) ?? [],
        directions: dirsByUser.get(p.id) ?? [],
      }));
    },
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role, enabled }: { userId: string; role: AppRole; enabled: boolean }) => {
      if (enabled) {
        const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role } as never, { onConflict: "user_id,role" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managed-users"] });
      qc.invalidateQueries({ queryKey: ["my-permissions"] });
    },
  });
}

export function useToggleUserArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, area, enabled }: { userId: string; area: FollowupArea; enabled: boolean }) => {
      if (enabled) {
        const { error } = await supabase.from("user_areas").upsert({ user_id: userId, area } as never, { onConflict: "user_id,area" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_areas").delete().eq("user_id", userId).eq("area", area);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managed-users"] });
      qc.invalidateQueries({ queryKey: ["my-permissions"] });
    },
  });
}

export function useToggleUserDirection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, direction, enabled }: { userId: string; direction: AllyDirection; enabled: boolean }) => {
      const table = (supabase.from as unknown as (t: string) => {
        upsert: (row: unknown, opts: { onConflict: string }) => Promise<{ error: unknown }>;
        delete: () => { eq: (k: string, v: string) => { eq: (k: string, v: string) => Promise<{ error: unknown }> } };
      })("user_directions");
      if (enabled) {
        const { error } = await table.upsert({ user_id: userId, direction }, { onConflict: "user_id,direction" });
        if (error) throw error;
      } else {
        const { error } = await table.delete().eq("user_id", userId).eq("direction", direction);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managed-users"] });
      qc.invalidateQueries({ queryKey: ["my-permissions"] });
    },
  });
}
