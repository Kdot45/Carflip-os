/**
 * Official NHTSA recalls data (api.nhtsa.gov) — free, public, government-run.
 * This is a live lookup by year/make/model, never a scrape of a listing site,
 * and it's the one place in the app where "manufacturer knowledge" is real
 * published safety data instead of something the AI might misremember.
 */

const NHTSA_RECALLS_URL = "https://api.nhtsa.gov/recalls/recallsByVehicle";

export interface RecallRecord {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportedDate: string | null;
}

interface NhtsaRecallApiResult {
  NHTSACampaignNumber?: string;
  Component?: string;
  Summary?: string;
  Consequence?: string;
  Remedy?: string;
  ReportReceivedDate?: string;
}

export async function fetchOpenRecalls(
  year: number,
  make: string,
  model: string
): Promise<RecallRecord[]> {
  const url = new URL(NHTSA_RECALLS_URL);
  url.searchParams.set("make", make);
  url.searchParams.set("model", model);
  url.searchParams.set("modelYear", String(year));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`NHTSA recalls API returned ${res.status}`);
  }

  const data = (await res.json()) as { results?: NhtsaRecallApiResult[] };
  const results = Array.isArray(data.results) ? data.results : [];

  return results.map((r) => ({
    campaignNumber: r.NHTSACampaignNumber ?? "",
    component: r.Component ?? "Unknown component",
    summary: r.Summary ?? "",
    consequence: r.Consequence ?? "",
    remedy: r.Remedy ?? "",
    reportedDate: r.ReportReceivedDate ?? null,
  }));
}
