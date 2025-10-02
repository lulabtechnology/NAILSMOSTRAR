export type ServiceType =
  | 'express_manicure'
  | 'gel_manicure'
  | 'acrylic_fullset'
  | 'fill'
  | 'gel_pedicure'
  | 'express_pedicure'
  | 'removal_only';

export type HandOrFeet = 'hands' | 'feet';
export type LengthType = 'short' | 'medium' | 'long' | 'xlong';
export type ShapeType = 'square' | 'round' | 'almond' | 'coffin' | 'stiletto';
export type NailArtLevel = 'none' | 'simple' | 'medium' | 'complex';

export type Extras = {
  removal?: boolean;
  french_tip?: boolean;
  builder_gel_overlay?: boolean;
};

export interface PricingInput {
  service: ServiceType;
  hand_or_feet: HandOrFeet;
  length: LengthType;
  shape: ShapeType;
  nail_art_level: NailArtLevel;
  nail_art_count: number; // 0..10
  extras: Extras;
  hourlyRate?: number; // default 70
  imageComplexityScore?: 0 | 1 | 2; // default 1
}

export interface PricingBreakdown {
  hours: number;
  hourlyRate: number;
  baseServiceHours: number;
  lengthHours: number;
  shapeHours: number;
  nailArtTotal: number;
  extrasTotal: number;
  feetMultiplierApplied: boolean;
  complexityMultiplier: number;
  shopMinAdj: number;
}

export interface PricingResult {
  total: number;
  deposit: number;
  breakdown: PricingBreakdown;
}

export interface ImageMeta {
  width: number;
  height: number;
  megapixels: number;
  sizeKB: number;
  edgeDensity: number; // 0..255 avg gradient magnitude
  complexityScore: 0 | 1 | 2;
}
