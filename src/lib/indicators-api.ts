import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IndicatorProgress {
  indicator_key: string;
  label: string;
  objetivo: string;
  programa: string;
  direction_hint: string | null;
  year: number;
  target_value: number;
  actual_value: number;
}

export interface StrategicIndicator {
  key: string;
  objetivo: string;
  programa: string;
  label: string;
  unit: string;
  meta_2030: number | null;
  meta_2030_nota: string | null;
  direction_hint: string | null;
}

export interface IndicatorContribution {
  id: string;
  ally_id: string;
  indicator_key: string;
  proyecto_estrategico: string | null;
  period_year: number;
  value: number;
  notes: string | null;
  created_at: string;
}

export function useIndicatorsProgress(direction: string, year: number) {
  return useQuery({
    queryKey: ["indicator-progress", direction, year],
    queryFn: async (): Promise<IndicatorProgress[]> => {
      let q = supabase.from("v_indicator_progress").select("*").eq("year", year);
      if (direction !== "all") {
        q = q.eq("direction_hint", direction);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data as IndicatorProgress[];
    },
  });
}

export function useStrategicIndicators(direction: string) {
  return useQuery({
    queryKey: ["strategic-indicators", direction],
    queryFn: async (): Promise<StrategicIndicator[]> => {
      let q = supabase.from("strategic_indicators").select("*");
      if (direction !== "all") {
        q = q.eq("direction_hint", direction);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data as StrategicIndicator[];
    },
  });
}

export function useAllyContributions(allyId: string, year: number) {
  return useQuery({
    queryKey: ["ally-contributions", allyId, year],
    enabled: !!allyId,
    queryFn: async (): Promise<IndicatorContribution[]> => {
      const { data, error } = await supabase
        .from("ally_indicator_contributions")
        .select("*")
        .eq("ally_id", allyId)
        .eq("period_year", year)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as IndicatorContribution[];
    },
  });
}

export function useSaveContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      ally_id: string;
      indicator_key: string;
      proyecto_estrategico?: string;
      period_year: number;
      value: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("ally_indicator_contributions")
        .insert(payload as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["ally-contributions", v.ally_id] });
      qc.invalidateQueries({ queryKey: ["indicator-progress"] });
    },
  });
}

export function useDeleteContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ally_id }: { id: string; ally_id: string }) => {
      const { error } = await supabase.from("ally_indicator_contributions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["ally-contributions", v.ally_id] });
      qc.invalidateQueries({ queryKey: ["indicator-progress"] });
    },
  });
}
