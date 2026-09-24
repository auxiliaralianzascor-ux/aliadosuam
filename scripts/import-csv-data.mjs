import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Pool } from "pg";

const csvDirectory = process.argv[2] ?? "C:\\Users\\diego\\Downloads\\csv";
const projectRef = "jfowusbobebqwendyrqk";

const imports = [
  ["strategic_indicators", "strategic_indicators-export-2026-09-24_13-00-18.csv"],
  ["strategic_indicator_yearly_targets", "strategic_indicator_yearly_targets-export-2026-09-24_12-59-58.csv"],
  ["allies", "allies-export-2026-09-24_12-58-52.csv"],
  ["ally_discounts", "ally_discounts-export-2026-09-24_12-59-21.csv"],
  ["ally_activities", "ally_activities-export-2026-09-24_12-59-07.csv"],
  ["ally_indicator_contributions", "ally_indicator_contributions-export-2026-09-24_12-59-32.csv"],
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (quoted && character === '"' && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && character === ";") {
      row.push(value);
      value = "";
    } else if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(value);
      value = "";
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
    } else {
      value += character;
    }
  }
  if (value !== "" || row.length > 0) {
    row.push(value);
    if (row.some((cell) => cell !== "")) rows.push(row);
  }
  return rows;
}

function quoteIdentifier(identifier) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(identifier)) {
    throw new Error(`Identificador no permitido: ${identifier}`);
  }
  return `"${identifier}"`;
}

function parseJsonValue(value, column) {
  let candidate = value.trim();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const isArray = candidate.startsWith("[") && candidate.endsWith("]");
    const isObject = candidate.startsWith("{") && candidate.endsWith("}");

    if (isArray || isObject) {
      try {
        return JSON.parse(candidate);
      } catch {
        // Continue below and remove an extra level of escaping.
      }
    }

    if (candidate.length >= 2 && candidate.startsWith('"') && candidate.endsWith('"')) {
      const inner = candidate.slice(1, -1);
      try {
        const parsed = JSON.parse(candidate);
        if (typeof parsed !== "string") return parsed;
        candidate = parsed.trim();
        continue;
      } catch {
        candidate = inner;
      }
    }

    // CSV exports can contain JSON escaped once or more than once.
    const unescaped = candidate
      .replaceAll("\\\\", "\\")
      .replaceAll('\\"', '"')
      .trim();

    if (unescaped === candidate) break;
    candidate = unescaped;
  }

  try {
    return JSON.parse(candidate);
  } catch (error) {
    throw new Error(`El valor JSON de ${column} no es válido: ${value}`, { cause: error });
  }
}

function normalizeValue(column, value, columnTypes) {
  if (value === "") return null;
  if (["created_by", "responsible_id"].includes(column)) return null;

  const columnType = columnTypes.get(column);
  if (columnType?.isArray) {
    const parsed = parseJsonValue(value, column);
    if (!Array.isArray(parsed)) {
      throw new Error(`El valor de ${column} debe ser un array JSON: ${value}`);
    }
    return parsed;
  }

  if (columnType?.isJson) {
    return parseJsonValue(value, column);
  }

  return value;
}

async function getTableColumns(client, table) {
  const result = await client.query(
    `select column_name, data_type, udt_name
       from information_schema.columns
      where table_schema = 'public' and table_name = $1
      order by ordinal_position`,
    [table],
  );
  return new Map(
    result.rows.map((row) => [row.column_name, {
      isArray: row.data_type === "ARRAY",
      isJson: row.data_type === "json" || row.data_type === "jsonb",
    }]),
  );
}

async function importTable(client, table, filename) {
  const filePath = path.join(csvDirectory, filename);
  const text = await fs.readFile(filePath, "utf8");
  const parsed = parseCsv(text);
  if (parsed.length < 2) {
    console.log(`${table}: vacío, omitido`);
    return;
  }

  const sourceColumns = parsed[0];
  const tableColumns = await getTableColumns(client, table);
  const columns = sourceColumns.filter((column) => tableColumns.has(column));
  if (columns.length === 0) throw new Error(`No hay columnas compatibles para ${table}`);

  const positions = columns.map((column) => sourceColumns.indexOf(column));
  const columnSql = columns.map(quoteIdentifier).join(", ");
  let imported = 0;

  for (const sourceRow of parsed.slice(1)) {
    const values = positions.map((position, index) =>
      normalizeValue(columns[index], sourceRow[position] ?? "", tableColumns),
    );
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    await client.query(
      `insert into public.${quoteIdentifier(table)} (${columnSql}) values (${placeholders}) on conflict do nothing`,
      values,
    );
    imported += 1;
  }
  console.log(`${table}: ${imported} filas procesadas`);
}

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) throw new Error("Define SUPABASE_DB_PASSWORD en la terminal; no la pongas en el código.");

const encodedPassword = encodeURIComponent(password);
const pool = new Pool({
  connectionString: `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require`,
  ssl: { rejectUnauthorized: false },
});

const client = await pool.connect();
try {
  await client.query("begin");
  for (const [table, filename] of imports) await importTable(client, table, filename);
  await client.query("commit");
  console.log("Importación completada. Las referencias a usuarios antiguos se dejaron en NULL.");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}