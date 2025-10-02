import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { nanoid } from "nanoid";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "POST,OPTIONS" }});
}

export async function GET() {
  return Response.json({ ok: false, message: "Usa POST con FormData(file)" }, { status: 405 });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return new Response("Falta 'file' en FormData", { status: 400 });
    }

    const name = (file.name || 'upload.bin');
    const ext = name.includes('.') ? name.split('.').pop() : 'bin';
    const key = `refs/${nanoid(16)}.${ext}`;

    const supa = getSupabaseAdmin();
    const { data, error } = await supa.storage.from('nail-refs').upload(key, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type || undefined
    });
    if (error) return new Response(error.message, { status: 500 });

    const { data: pub } = supa.storage.from('nail-refs').getPublicUrl(data.path);
    return Response.json({ url: pub.publicUrl });
  } catch (e: any) {
    return new Response(e?.message ?? 'Error desconocido', { status: 500 });
  }
}
