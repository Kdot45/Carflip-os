import { describe, expect, it } from "vitest";
import { calculateMaxBid, calculateRepairTotals, round2 } from "./calculations";

describe("round2", () => {
  it("rounds to two decimal places", () => {
    expect(round2(1.005)).toBe(1.01); // classic floating-point rounding trap
    expect(round2(19.999)).toBe(20);
    expect(round2(0)).toBe(0);
  });
});

describe("calculateRepairTotals", () => {
  it("sums parts and labor across line items and applies one contingency buffer for the expected case", () => {
    const totals = calculateRepairTotals({
      lineItems: [
        { partsCost: 500, laborHours: 2, laborRate: 80 }, // 500 + 160 = 660
        { partsCost: 120, laborHours: 1, laborRate: 80 }, // 120 + 80 = 200
      ],
      diagnosticsTotal: 100,
      consumablesTotal: 50,
      feesTotal: 25,
      contingencyPct: 15,
    });

    // subtotal = 660 + 200 + 100 + 50 + 25 = 1035
    expect(totals.partsTotal).toBe(620);
    expect(totals.laborTotal).toBe(240);
    expect(totals.totalLow).toBe(1035);
    expect(totals.contingencyTotal).toBe(round2(1035 * 0.15));
    expect(totals.totalExpected).toBe(round2(1035 + 1035 * 0.15));
    expect(totals.totalWorst).toBe(round2(1035 + 1035 * 0.15 * 2));
  });

  it("returns all zeros for an empty checklist", () => {
    const totals = calculateRepairTotals({
      lineItems: [],
      diagnosticsTotal: 0,
      consumablesTotal: 0,
      feesTotal: 0,
      contingencyPct: 15,
    });
    expect(totals.totalLow).toBe(0);
    expect(totals.totalExpected).toBe(0);
    expect(totals.totalWorst).toBe(0);
  });

  it("total_low, total_expected, and total_worst collapse to the same value when contingency is 0%", () => {
    const totals = calculateRepairTotals({
      lineItems: [{ partsCost: 300, laborHours: 1, laborRate: 100 }],
      diagnosticsTotal: 0,
      consumablesTotal: 0,
      feesTotal: 0,
      contingencyPct: 0,
    });
    expect(totals.totalLow).toBe(400);
    expect(totals.totalExpected).toBe(400);
    expect(totals.totalWorst).toBe(400);
  });
});

describe("calculateMaxBid", () => {
  const base = {
    askingPrice: 6500,
    purchasePrice: null as number | null,
    totalExpectedRepair: 667,
    sellingCosts: 300,
    targetProfitAmount: null as number | null,
    targetMarginPct: null as number | null,
    fallbackMarginPct: 20,
  };

  it("returns 'unknown' with null bid figures when no resale price is set yet", () => {
    const result = calculateMaxBid({ ...base, expectedResalePrice: null });
    expect(result.dealLabel).toBe("unknown");
    expect(result.suggestedMaxBid).toBeNull();
    expect(result.expectedProfitAtAsking).toBeNull();
  });

  it("solves for target margin % when no explicit target is set (uses fallback)", () => {
    // resale 9500, sellingCosts 300, repair 667, margin 20% of resale = 1900
    // maxBid = 9500 - 300 - 667 - 1900 = 6633
    const result = calculateMaxBid({ ...base, expectedResalePrice: 9500 });
    expect(result.suggestedMaxBid).toBe(6633);
    expect(result.expectedProfitAtAsking).toBe(2033); // 9500-300-667-6500
    expect(result.expectedProfitAtMaxBid).toBe(1900);
    expect(result.marginAtAskingPct).toBeCloseTo(21.4, 1);
    expect(result.dealLabel).toBe("good"); // 21.4% >= 20% target
  });

  it("solves for an explicit target profit amount, overriding the fallback margin", () => {
    // maxBid = 9500 - 300 - 667 - 1000 (flat target profit) = 7533
    const result = calculateMaxBid({
      ...base,
      expectedResalePrice: 9500,
      targetProfitAmount: 1000,
    });
    expect(result.suggestedMaxBid).toBe(7533);
  });

  it("takes the lower (more conservative) of the two bids when both targets are set", () => {
    // margin-based: 9500-300-667-1900 = 6633
    // profit-based (higher target): 9500-300-667-3000 = 5533 <- lower, should win
    const result = calculateMaxBid({
      ...base,
      expectedResalePrice: 9500,
      targetMarginPct: 20,
      targetProfitAmount: 3000,
    });
    expect(result.suggestedMaxBid).toBe(5533);
  });

  it("uses purchase_price instead of asking_price for total_expected_cost once the car is bought", () => {
    const result = calculateMaxBid({ ...base, expectedResalePrice: 9500, purchasePrice: 6000 });
    expect(result.totalExpectedCostAtAsking).toBe(round2(6000 + 667 + 300));
  });

  it("labels a deal 'bad' when margin at asking price is well under target", () => {
    // asking price way above resale minus costs -> negative/low profit
    const result = calculateMaxBid({
      ...base,
      askingPrice: 9000,
      expectedResalePrice: 9500,
      targetMarginPct: 20,
    });
    // profit = 9500-300-667-9000 = -467, margin negative -> bad
    expect(result.dealLabel).toBe("bad");
  });

  it("labels a deal 'marginal' when margin is between half the target and the target", () => {
    // Pick an asking price that lands margin between 10% and 20% of resale.
    // resale 10000, sellingCosts 0, repair 0 -> profit = 10000 - asking
    // margin% = (10000-asking)/10000*100. Want ~15% -> asking = 8500
    const result = calculateMaxBid({
      askingPrice: 8500,
      purchasePrice: null,
      totalExpectedRepair: 0,
      sellingCosts: 0,
      expectedResalePrice: 10000,
      targetProfitAmount: null,
      targetMarginPct: 20,
      fallbackMarginPct: 20,
    });
    expect(result.marginAtAskingPct).toBe(15);
    expect(result.dealLabel).toBe("marginal");
  });
});
