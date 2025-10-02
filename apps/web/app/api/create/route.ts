import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createSchema } from "@/lib/validation";
import { computePrice } from "@/lib/price";
import { nanoid } from "nanoid";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "GET,POST,OPTIONS" }});
}

export async function GET() {
  return Response.json({ ok: false, message: "Usa POST" }, { status: 405 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);

    const pricing = computePrice({
      service: parsed.service,
      hand_or_feet: parsed.hand_or_feet,
      length: parsed.length,
      shape: parsed.shape,
      nail_art_level: parsed.nail_art_level,
      nail_art_count: parsed.nail_art_count,
      extras: parsed.extras,
      imageComplexityScore: parsed.image_complexity_score ?? 1
    });

    const public_id = `N-${nanoid(8)}`;

    const supa = getSupabaseAdmin();
    const { error } = await supa.from('nail_requests').insert({
      public_id,
      customer_name: parsed.customer_name,
      email: parsed.email,
      phone: parsed.phone,
      appointment_date: parsed.appointment_date,
      appointment_time: parsed.appointment_time,
      service: parsed.service,
      hand_or_feet: parsed.hand_or_feet,
      length: parsed.length,
      shape: parsed.shape,
      color: parsed.color,
      nail_art_level: parsed.nail_art_level,
      nail_art_count: parsed.nail_art_count,
      extras: parsed.extras,
      image_url: parsed.image_url ?? null,
      image_meta: parsed.image_meta ?? null,
      price: pricing.total,
      breakdown: pricing.breakdown,
      status: 'pending'
    });
    if (error) return new Response(error.message, { status: 500 });

    return Response.json({ id: public_id });
  } catch (e: any) {
    return new Response(e?.message ?? 'Error parsing body', { status: 400 });
  }
}
