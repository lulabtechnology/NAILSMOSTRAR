import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { nanoid } from "nanoid";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supa = getSupabaseAdmin();
    const public_id = `TEST_${nanoid(6)}`;
    const { error } = await supa.from('nail_requests').insert({
      public_id,
      customer_name: 'Test User',
      email: 'test@example.com',
      phone: null,
      appointment_date: new Date().toISOString().slice(0,10),
      appointment_time: '10:00',
      service: 'express_manicure',
      hand_or_feet: 'hands',
      length: 'short',
      shape: 'square',
      color: '#000000',
      nail_art_level: 'none',
      nail_art_count: 0,
      extras: {},
      image_url: null,
      image_meta: null,
      price: 35,
      breakdown: { hours: 0.5, hourlyRate: 70, baseServiceHours:0.5, lengthHours:0, shapeHours:0, nailArtTotal:0, extrasTotal:0, feetMultiplierApplied:false, complexityMultiplier:1.4, shopMinAdj:0 },
      status: 'pending'
    });

    if (error) throw error;
    return Response.json({ ok: true, id: public_id });
  } catch (e: any) {
    return new Response(e?.message ?? 'Error', { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: false, message: "Usa POST" }, { status: 405 });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "POST,OPTIONS" }});
}
