import { PricingInput, PricingResult, PricingBreakdown } from "./types";

const BASE_RATE = 70; // $/h
const SHOP_MIN = 20;  // $

const BASE_HOURS: Record<PricingInput["service"], number> = {
  express_manicure: 0.5,
  gel_manicure: 1.0,
  acrylic_fullset: 2.0,
  fill: 1.5,
  gel_pedicure: 1.25,
  express_pedicure: 0.75,
  removal_only: 0.5,
};

const LENGTH_HOURS: Record<PricingInput["length"], number> = {
  short: 0,
  medium: 0.25,
  long: 0.5,
  xlong: 0.8,
};

const SHAPE_HOURS: Record<PricingInput["shape"], number> = {
  square: 0,
  round: 0,
  almond: 0.1,
  coffin: 0.15,
  stiletto: 0.25,
};

const NAIL_ART_PER_NAIL: Record<PricingInput["nail_art_level"], number> = {
  none: 0,
  simple: 5,
  medium: 10,
  complex: 20,
};

function roundToHalf(n: number) {
  return Math.round(n * 2) / 2;
}

export function computePrice(input: PricingInput): PricingResult {
  const rate = input.hourlyRate ?? BASE_RATE;

  const base = BASE_HOURS[input.service];
  const length = LENGTH_HOURS[input.length];
  const shape = SHAPE_HOURS[input.shape];

  let hours = base + length + shape;

  const artUnit = NAIL_ART_PER_NAIL[input.nail_art_level];
  const nailArtTotal = artUnit * Math.max(0, Math.min(10, input.nail_art_count));

  const extrasTotal =
    (input.extras.removal ? 10 : 0) +
    (input.extras.french_tip ? 8 : 0) +
    (input.extras.builder_gel_overlay ? 12 : 0);

  const complexityMultiplier = 0.8 + (input.imageComplexityScore ?? 1) * 0.6; // 0.8..2.0

  hours = hours * complexityMultiplier;

  let feetMultiplierApplied = false;
  if (input.hand_or_feet === 'feet') {
    hours = hours * 1.1;
    feetMultiplierApplied = true;
  }

  hours = roundToHalf(hours);

  const timeSubtotal = hours * rate;

  const raw = timeSubtotal + nailArtTotal + extrasTotal;
  const total = Math.max(raw, SHOP_MIN);
  const deposit = Math.max(10, Math.round(total * 0.2));

  const breakdown: PricingBreakdown = {
    hours,
    hourlyRate: rate,
    baseServiceHours: base,
    lengthHours: length,
    shapeHours: shape,
    nailArtTotal,
    extrasTotal,
    feetMultiplierApplied,
    complexityMultiplier,
    shopMinAdj: Math.max(0, SHOP_MIN - raw),
  };

  return { total: Number(total.toFixed(2)), deposit, breakdown };
}
