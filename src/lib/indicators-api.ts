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

const PROYECCION_FALLBACK_INDICATORS: StrategicIndicator[] = [
  {
    key: "estudiantes_vinculados_practicas_formativas",
    objetivo: "OE3",
    programa: "3. Aliados UAM",
    label: "Estudiantes vinculados a prácticas formativas",
    unit: "numero",
    meta_2030: null,
    meta_2030_nota:
      "Indicador de Proyección; se consolida por aportes registrados por aliado y año.",
    direction_hint: "proyeccion",
  },
];

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
      try {
        let q = supabase.from("strategic_indicators").select("*");
        if (direction !== "all") {
          q = q.eq("direction_hint", direction);
        }
        const { data, error } = await q;
        if (error) throw error;
        if (data && data.length > 0) return data as StrategicIndicator[];
      } catch {
        // Fallback local para no dejar la vista vacía mientras la base no esté aplicada.
      }

      if (direction === "proyeccion") {
        return PROYECCION_FALLBACK_INDICATORS;
      }

      return [];
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

export interface IndicatorWithoutTarget extends StrategicIndicator {
  year: number;
  actual_value: number;
}

export function useIndicatorsWithoutTarget(direction: string, year: number) {
  return useQuery({
    queryKey: ["indicators-no-target", direction, year],
    queryFn: async (): Promise<IndicatorWithoutTarget[]> => {
      try {
        const { data: allInd, error: e1 } = await supabase
          .from("strategic_indicators")
          .select("*")
          .eq("direction_hint", direction);
        if (e1) throw e1;
        if (!allInd || allInd.length === 0) {
          if (direction === "proyeccion") {
            return PROYECCION_FALLBACK_INDICATORS.map((i) => ({ ...i, year, actual_value: 0 }));
          }
          return [];
        }

        const keys = allInd.map((i) => i.key);
        const { data: targets, error: e2 } = await supabase
          .from("strategic_indicator_yearly_targets")
          .select("indicator_key")
          .in("indicator_key", keys);
        if (e2) throw e2;

        const withTarget = new Set((targets ?? []).map((t) => t.indicator_key));
        const noTarget = (allInd as StrategicIndicator[]).filter((i) => !withTarget.has(i.key));
        if (noTarget.length === 0) return [];

        const { data: contribs, error: e3 } = await supabase
          .from("ally_indicator_contributions")
          .select("indicator_key, value")
          .in(
            "indicator_key",
            noTarget.map((i) => i.key),
          )
          .eq("period_year", year);
        if (e3) throw e3;

        const totals: Record<string, number> = {};
        (contribs ?? []).forEach((c) => {
          totals[c.indicator_key] = (totals[c.indicator_key] ?? 0) + Number(c.value);
        });

        return noTarget.map((i) => ({ ...i, year, actual_value: totals[i.key] ?? 0 }));
      } catch {
        if (direction === "proyeccion") {
          return PROYECCION_FALLBACK_INDICATORS.map((i) => ({ ...i, year, actual_value: 0 }));
        }
        return [];
      }
    },
  });
}

export interface AllyPracticeBreakdown {
  year: number;
  ally_id: string;
  ally_name: string;
  direction: string;
  status: string;
  estudiantes: number;
}

export function usePracticasPorAliado(year: number) {
  return useQuery({
    queryKey: ["practicas-por-aliado", year],
    queryFn: async (): Promise<AllyPracticeBreakdown[]> => {
      const { data, error } = await supabase
        .from("v_practicas_por_aliado")
        .select("*")
        .eq("year", year)
        .order("estudiantes", { ascending: false });
      if (error) throw error;
      return data as AllyPracticeBreakdown[];
    },
  });
}
