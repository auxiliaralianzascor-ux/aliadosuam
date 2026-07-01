import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AllyDiscount {
  id: string;
  ally_id: string;
  pregrado: string | null;
  posgrado: string | null;
  ingles: string | null;
  econti: string | null;
  created_at: string;
  updated_at: string;
}

export const DISCOUNT_CATEGORIES = [
  { key: "pregrado", label: "Pregrado" },
  { key: "posgrado", label: "Posgrado" },
  { key: "econti", label: "Econti" },
  { key: "ingles", label: "Inglés" },
] as const;

export type DiscountCategory = (typeof DISCOUNT_CATEGORIES)[number]["key"];

export function useAllDiscounts() {
  return useQuery({
    queryKey: ["discounts"],
    queryFn: async (): Promise<AllyDiscount[]> => {
      const { data, error } = await supabase.from("ally_discounts").select("*");
      if (error) throw error;
      return data as AllyDiscount[];
    },
  });
}

export function useAllyDiscount(allyId: string | undefined) {
  return useQuery({
    queryKey: ["discount", allyId],
    enabled: !!allyId,
    queryFn: async (): Promise<AllyDiscount | null> => {
      const { data, error } = await supabase
        .from("ally_discounts")
        .select("*")
        .eq("ally_id", allyId!)
        .maybeSingle();
      if (error) throw error;
      return (data as AllyDiscount | null) ?? null;
    },
  });
}

export function useSaveDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      ally_id: string;
      pregrado: string | null;
      posgrado: string | null;
      ingles: string | null;
      econti: string | null;
    }) => {
      const { data, error } = await supabase
        .from("ally_discounts")
        .upsert(input as never, { onConflict: "ally_id" })
        .select()
        .single();
      if (error) throw error;
      return data as AllyDiscount;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["discounts"] });
      qc.invalidateQueries({ queryKey: ["discount", vars.ally_id] });
    },
  });
}

export function useDeleteDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ally_id: string) => {
      const { error } = await supabase.from("ally_discounts").delete().eq("ally_id", ally_id);
      if (error) throw error;
    },
    onSuccess: (_d, ally_id) => {
      qc.invalidateQueries({ queryKey: ["discounts"] });
      qc.invalidateQueries({ queryKey: ["discount", ally_id] });
    },
  });
}
