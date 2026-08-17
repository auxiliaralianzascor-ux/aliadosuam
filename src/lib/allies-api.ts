import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Ally, AllyActivity, AllyDirection } from "./allies-types";

export function useAllies(direction?: AllyDirection) {
  return useQuery({
    queryKey: ["allies", direction ?? "all"],
    queryFn: async (): Promise<Ally[]> => {
      let q = supabase.from("allies").select("*").order("updated_at", { ascending: false });
      if (direction) {
        q = q.or(`direction.eq.${direction},shared_with_directions.cs.{${direction}}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as Ally[];
    },
  });
}

export function useAlly(id: string | undefined) {
  return useQuery({
    queryKey: ["ally", id],
    enabled: !!id,
    queryFn: async (): Promise<Ally> => {
      const { data, error } = await supabase.from("allies").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Ally;
    },
  });
}

export function useActivities(allyId: string | undefined) {
  return useQuery({
    queryKey: ["activities", allyId],
    enabled: !!allyId,
    queryFn: async (): Promise<AllyActivity[]> => {
      const { data, error } = await supabase
        .from("ally_activities")
        .select("*")
        .eq("ally_id", allyId!)
        .order("activity_date", { ascending: false });
      if (error) throw error;
      return data as AllyActivity[];
    },
  });
}

export function useSaveAlly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Ally> & { id?: string }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      const { id, ...rest } = input;
      if (id) {
        const { data, error } = await supabase
          .from("allies")
          .update(rest as never)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const insertPayload = { ...rest, created_by: user?.id ?? null } as never;
      const { data, error } = await supabase.from("allies").insert(insertPayload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["allies"] });
      if (vars.id) qc.invalidateQueries({ queryKey: ["ally", vars.id] });
    },
  });
}

export function useDeleteAlly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("allies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allies"] }),
  });
}

export function useAddActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<AllyActivity, "id" | "created_at" | "responsible_id" | "responsible_name"> & { responsible_name?: string }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      let responsible_name = input.responsible_name;
      if (!responsible_name && user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();
        responsible_name = profile?.display_name || user.email || "Usuario";
      }
      const payload = {
        ally_id: input.ally_id,
        area: input.area,
        activity_type: input.activity_type,
        description: input.description,
        activity_date: input.activity_date,
        responsible_id: user?.id ?? null,
        responsible_name: responsible_name || "Usuario",
      };
      const { data, error } = await supabase.from("ally_activities").insert(payload as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["activities", vars.ally_id] });
      qc.invalidateQueries({ queryKey: ["allies"] });
    },
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; ally_id: string }) => {
      const { error } = await supabase.from("ally_activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["activities", vars.ally_id] }),
  });
}
