/**
 * Pure calculation functions for repair estimates and the max-bid / profit
 * calculator. Kept framework- and DB-free so they're easy to unit test and
 * easy to mirror on the frontend for optimistic UI updates.
 *
 * Money is plain `number` here (dollars, not cents) — callers convert
 * Prisma `Decimal` values with `Number(...)` before calling in, and round
 * results with `round2` before persisting/returning.
 */

export interface LineItemInput {
  partsCost: number;
  laborHours: number;
  laborRate: number;
}

export interface RepairEstimateInputs {
  lineItems: LineItemInput[];
  diagnosticsTotal: number;
  consumablesTotal: number;
  feesTotal: number;
  contingencyPct: number;
}

export interface RepairEstimateTotals {
  partsTotal: number;
  laborTotal: number;
  diagnosticsTotal: number;
  consumablesTotal: number;
  feesTotal: number;
  contingencyPct: number;
  contingencyTotal: number;
  totalLow: number;
  totalExpected: number;
  totalWorst: number;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Assumptions (surfaced in the UI so they're never a black box):
 * - `total_low` is the identified-work subtotal with no contingency buffer —
 *   the best case where nothing beyond the checklist turns up.
 * - `total_expected` adds one contingency buffer (contingency_pct of the
 *   subtotal) for the usual "one extra thing" that shows up once you're in.
 * - `total_worst` doubles the contingency buffer, for a rougher-than-expected
 *   job. This is a heuristic, not a statistical model — treat it as a sanity
 *   range, not a guarantee.
 */
export function calculateRepairTotals(inputs: RepairEstimateInputs): RepairEstimateTotals {
  const partsTotal = inputs.lineItems.reduce((sum, item) => sum + item.partsCost, 0);
  const laborTotal = inputs.lineItems.reduce(
    (sum, item) => sum + item.laborHours * item.laborRate,
    0
  );

  const subtotal =
    partsTotal +
    laborTotal +
    inputs.diagnosticsTotal +
    inputs.consumablesTotal +
    inputs.feesTotal;

  const contingencyTotal = subtotal * (inputs.contingencyPct / 100);

  return {
    partsTotal: round2(partsTotal),
    laborTotal: round2(laborTotal),
    diagnosticsTotal: round2(inputs.diagnosticsTotal),
    consumablesTotal: round2(inputs.consumablesTotal),
    feesTotal: round2(inputs.feesTotal),
    contingencyPct: inputs.contingencyPct,
    contingencyTotal: round2(contingencyTotal),
    totalLow: round2(subtotal),
    totalExpected: round2(subtotal + contingencyTotal),
    totalWorst: round2(subtotal + contingencyTotal * 2),
  };
}

export interface MaxBidInputs {
  askingPrice: number;
  purchasePrice: number | null;
  totalExpectedRepair: number;
  sellingCosts: number;
  expectedResalePrice: number | null;
  targetProfitAmount: number | null;
  targetMarginPct: number | null;
  /** Falls back to this when neither target above is set. */
  fallbackMarginPct: number;
}

export type DealLabel = "good" | "marginal" | "bad" | "unknown";

export interface MaxBidResult {
  totalExpectedCostAtAsking: number;
  suggestedMaxBid: number | null;
  expectedProfitAtAsking: number | null;
  expectedProfitAtMaxBid: number | null;
  marginAtAskingPct: number | null;
  dealLabel: DealLabel;
}

/**
 * Assumptions:
 * - `total_expected_cost` uses purchase_price when the car has actually been
 *   bought, otherwise asking_price (per spec).
 * - When both target_profit_amount and target_margin_pct are set, we solve
 *   for both and take the LOWER resulting max bid (more conservative — it's
 *   easier to walk away from a good deal than to eat a loss).
 * - "margin" = profit / expected_resale_price (not markup on cost).
 * - Deal label thresholds: good if margin at asking >= target margin;
 *   marginal if it's at least half the target; bad otherwise, or if resale
 *   price / repair data isn't in yet ("unknown").
 */
export function calculateMaxBid(inputs: MaxBidInputs): MaxBidResult {
  const costBasis = inputs.purchasePrice ?? inputs.askingPrice;
  const totalExpectedCostAtAsking = round2(
    costBasis + inputs.totalExpectedRepair + inputs.sellingCosts
  );

  if (inputs.expectedResalePrice === null || inputs.expectedResalePrice <= 0) {
    return {
      totalExpectedCostAtAsking,
      suggestedMaxBid: null,
      expectedProfitAtAsking: null,
      expectedProfitAtMaxBid: null,
      marginAtAskingPct: null,
      dealLabel: "unknown",
    };
  }

  const resale = inputs.expectedResalePrice;
  const targetMarginPct = inputs.targetMarginPct ?? inputs.fallbackMarginPct;

  const candidates: number[] = [];
  if (inputs.targetProfitAmount !== null) {
    candidates.push(resale - inputs.sellingCosts - inputs.totalExpectedRepair - inputs.targetProfitAmount);
  }
  if (inputs.targetMarginPct !== null || candidates.length === 0) {
    const requiredProfit = resale * (targetMarginPct / 100);
    candidates.push(resale - inputs.sellingCosts - inputs.totalExpectedRepair - requiredProfit);
  }
  const suggestedMaxBid = round2(Math.min(...candidates));

  const expectedProfitAtAsking = round2(
    resale - inputs.sellingCosts - inputs.totalExpectedRepair - inputs.askingPrice
  );
  const expectedProfitAtMaxBid = round2(
    resale - inputs.sellingCosts - inputs.totalExpectedRepair - suggestedMaxBid
  );
  const marginAtAskingPct = round2((expectedProfitAtAsking / resale) * 100);

  let dealLabel: DealLabel;
  if (marginAtAskingPct >= targetMarginPct) {
    dealLabel = "good";
  } else if (marginAtAskingPct >= targetMarginPct / 2) {
    dealLabel = "marginal";
  } else {
    dealLabel = "bad";
  }

  return {
    totalExpectedCostAtAsking,
    suggestedMaxBid,
    expectedProfitAtAsking,
    expectedProfitAtMaxBid,
    marginAtAskingPct,
    dealLabel,
  };
}
