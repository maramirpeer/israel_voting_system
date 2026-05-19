import type { Express, Request, Response } from "express";

type CsvRow = Record<string, string>;

type KnessetMember = {
  id: number;
  name: string;
  faction: string;
  email: string;
};

const membersUrl = "https://production.oknesset.org/pipelines/data/members/mk_individual/mk_individual.csv";
const factionsUrl = "https://production.oknesset.org/pipelines/data/members/mk_individual/faction_memberships.csv";
const cacheTtlMs = 6 * 60 * 60 * 1000;

let cache: { members: KnessetMember[]; updatedAt: number } | null = null;

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  if (row.some((cell) => cell.length > 0)) rows.push(row);

  const headers = rows.shift() ?? [];
  return rows.map((cells) =>
    headers.reduce<CsvRow>((record, header, index) => {
      record[header] = cells[index] ?? "";
      return record;
    }, {})
  );
}

async function fetchCsv(url: string): Promise<CsvRow[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Knesset data request failed with ${response.status}`);
  }
  return parseCsv(await response.text());
}

function extractMemberIds(value: string): string[] {
  return Array.from(value.matchAll(/\d+/g)).map((match) => match[0]);
}

function isOfficialKnessetEmail(email: string) {
  return /^[^\s@]+@knesset\.gov\.il$/i.test(email);
}

function getLatestFullFactionMap(factions: CsvRow[]) {
  const knesset25 = factions.filter((row) => row.knesset === "25");
  const finishDates = Array.from(new Set(knesset25.map((row) => row.finish_date).filter(Boolean))).sort().reverse();

  for (const finishDate of finishDates) {
    const rowsForDate = knesset25.filter((row) => row.finish_date === finishDate);
    const memberIds = new Set<string>();
    rowsForDate.forEach((row) => {
      extractMemberIds(row.member_mk_ids).forEach((id) => memberIds.add(id));
    });

    if (memberIds.size >= 100) {
      const factionByMemberId = new Map<string, string>();
      rowsForDate.forEach((row) => {
        extractMemberIds(row.member_mk_ids).forEach((id) => {
          factionByMemberId.set(id, row.faction_name.trim());
        });
      });
      return factionByMemberId;
    }
  }

  return new Map<string, string>();
}

async function getCurrentKnessetMembers(): Promise<KnessetMember[]> {
  if (cache && Date.now() - cache.updatedAt < cacheTtlMs) {
    return cache.members;
  }

  const [memberRows, factionRows] = await Promise.all([fetchCsv(membersUrl), fetchCsv(factionsUrl)]);
  const factionByMemberId = getLatestFullFactionMap(factionRows);

  const members = Array.from(factionByMemberId.entries())
    .map(([id, faction]) => {
      const row = memberRows.find((member) => member.mk_individual_id === id);
      const email = (row?.Email || row?.mk_individual_email || "").trim();
      return {
        id: Number(id),
        name: `${row?.FirstName ?? ""} ${row?.LastName ?? ""}`.trim(),
        faction,
        email,
      };
    })
    .filter((member) => member.name && isOfficialKnessetEmail(member.email))
    .sort((a, b) => a.name.localeCompare(b.name, "he"));

  cache = { members, updatedAt: Date.now() };
  return members;
}

export function registerKnessetMemberRoutes(app: Express) {
  app.get("/api/knesset-members", async (_req: Request, res: Response) => {
    try {
      const members = await getCurrentKnessetMembers();
      res.json({ ok: true, members, updatedAt: cache?.updatedAt ?? Date.now() });
    } catch (error) {
      console.error("[KnessetMembers] Failed loading members:", error);
      res.status(500).json({
        ok: false,
        error: "טעינת רשימת חברי הכנסת נכשלה כרגע",
        members: cache?.members ?? [],
      });
    }
  });
}
