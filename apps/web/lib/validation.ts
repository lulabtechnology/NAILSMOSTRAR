import { z } from "zod";

export const createSchema = z.object({
  customer_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  appointment_date: z.string().min(1), // YYYY-MM-DD
  appointment_time: z.string().min(1), // HH:mm
  service: z.enum([
    'express_manicure','gel_manicure','acrylic_fullset','fill','gel_pedicure','express_pedicure','removal_only'
  ]),
  hand_or_feet: z.enum(['hands','feet']),
  length: z.enum(['short','medium','long','xlong']),
  shape: z.enum(['square','round','almond','coffin','stiletto']),
  color: z.string().optional().default('#000000'),
  nail_art_level: z.enum(['none','simple','medium','complex']),
  nail_art_count: z.number().int().min(0).max(10),
  extras: z.object({
    removal: z.boolean().optional().default(false),
    french_tip: z.boolean().optional().default(false),
    builder_gel_overlay: z.boolean().optional().default(false),
  }).default({}),
  image_url: z.string().url().optional().nullable(),
  image_meta: z.any().optional().nullable(),
  image_complexity_score: z.number().int().min(0).max(2).optional().default(1)
});

export type CreatePayload = z.infer<typeof createSchema>;
