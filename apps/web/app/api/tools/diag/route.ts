import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supa = getSupabaseAdmin();
    const { data: buckets, error: bErr } = await supa.storage.listBuckets();
    if (bErr) throw bErr;
    const hasBucket = !!buckets?.find(b => b.id === 'nail-refs');

    const { count, error: cErr } = await supa
      .from('nail_requests')
      .select('id', { count: 'exact', head: true });
    if (cErr) throw cErr;

    return Response.json({
      ok: true,
      storage: { hasBucket, buckets: buckets?.map(b=>b.id) },
      db: { table: 'nail_requests', count }
    });
  } catch (e: any) {
    return new Response(e?.message ?? 'Diag error', { status: 500 });
  }
}
