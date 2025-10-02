import { describe, it, expect } from "vitest";
import { computePrice } from "@/lib/price";

describe('pricing', () => {
  it('base express manicure', () => {
    const r = computePrice({
      service: 'express_manicure',
      hand_or_feet: 'hands',
      length: 'short',
      shape: 'square',
      nail_art_level: 'none',
      nail_art_count: 0,
      extras: {},
      imageComplexityScore: 1
    });
    // base 0.5h * 1.4 = 0.7 -> round 0.5h (redondeo a 0.5) => 0.5*70=35 => >= shop min 20
    expect(r.total).toBe(35);
    expect(r.deposit).toBe(10); // 20% = 7 -> min 10
  });

  it('full acrylic, long, stiletto, complex art 10 uñas', () => {
    const r = computePrice({
      service: 'acrylic_fullset',
      hand_or_feet: 'hands',
      length: 'long',
      shape: 'stiletto',
      nail_art_level: 'complex',
      nail_art_count: 10,
      extras: { french_tip: true },
      imageComplexityScore: 2
    });
    // hours = (2 + 0.5 + 0.25) * 2.0 = 5.5 -> rounds 5.5
    // timeSubtotal = 5.5*70 = 385
    // nailArt = 10*20 = 200
    // extras = 8
    // total = 593
    expect(r.breakdown.hours).toBe(5.5);
    expect(r.total).toBe(593);
    expect(r.deposit).toBe(Math.max(10, Math.round(593*0.2)));
  });

  it('feet multiplier applies', () => {
    const r = computePrice({
      service: 'gel_pedicure',
      hand_or_feet: 'feet',
      length: 'medium',
      shape: 'almond',
      nail_art_level: 'simple',
      nail_art_count: 4,
      extras: { removal: true },
      imageComplexityScore: 0
    });
    // base 1.25 + 0.25 + 0.1 = 1.6
    // img mult 0.8 -> 1.28
    // feet 1.1 -> 1.408 -> round 1.5
    // time 1.5*70=105
    // art 4*5=20
    // extras 10
    // total 135 >= 20
    expect(r.breakdown.hours).toBe(1.5);
    expect(r.total).toBe(135);
  });
});
