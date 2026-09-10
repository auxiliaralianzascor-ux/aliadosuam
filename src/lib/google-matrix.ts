import { useQuery } from "@tanstack/react-query";

export const GOOGLE_MATRIX_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vROmvtvjL6N8IQMLm3NYQnGVmGV4fnhHJxBiKaGDkhG0c1DwOvNIk8jx5-w9bebHw/pub?output=csv&gid=894660896";

export interface GoogleMatrixRow {
  name: string;
  nit: string | null;
  category: "latente" | "emergente" | "activo" | "estrategico" | null;
  ivc_total: number | null;
  c1_economic: number | null;
  c2_services: number | null;
  c3_trust: number | null;
  c4_cocreated_impact: number | null;
  c5_coherence: number | null;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function numberValue(value: string | undefined) {
  if (!value) return null;
  const normalized = value.replace(/\$/g, "").replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function categoryValue(value: string | undefined): GoogleMatrixRow["category"] {
  const normalized = value?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (normalized?.includes("estrateg")) return "estrategico";
  if (normalized?.includes("activo")) return "activo";
  if (normalized?.includes("emergente")) return "emergente";
  if (normalized?.includes("latente")) return "latente";
  return null;
}

export function parseGoogleMatrixCsv(csv: string): GoogleMatrixRow[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  const headerIndex = lines.findIndex((line) => line.startsWith("NIT / ID,"));
  if (headerIndex < 0) throw new Error("No se encontró la pestaña Matriz Aliados publicada.");

  return lines.slice(headerIndex + 1).map(parseCsvLine).filter((cells) => cells[1]).map((cells) => ({
    nit: cells[0] || null,
    name: cells[1],
    c1_economic: numberValue(cells[4]),
    c2_services: numberValue(cells[6]),
    c3_trust: numberValue(cells[10]),
    c4_cocreated_impact: numberValue(cells[14]),
    c5_coherence: numberValue(cells[18]),
    ivc_total: numberValue(cells[19]),
    category: categoryValue(cells[20]),
  }));
}

async function fetchGoogleMatrix() {
  const response = await fetch(`${GOOGLE_MATRIX_CSV_URL}&_=${Date.now()}`);
  if (!response.ok) throw new Error(`No se pudo leer la matriz publicada (${response.status}).`);
  return parseGoogleMatrixCsv(await response.text());
}

export function useGoogleMatrix() {
  return useQuery({
    queryKey: ["google-matrix-aliados"],
    queryFn: fetchGoogleMatrix,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 1,
  });
}
