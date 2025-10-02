import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import EstimateCard from "@/components/EstimateCard";
import { computePrice } from "@/lib/price";
import { formatMoney } from "@/lib/utils";

export const dynamic = 'force-dynamic';

async function fetchByPublicId(id: string) {
  const supa = getSupabaseAdmin();
  const { data, error } = await supa.from('nail_requests').select('*').eq('public_id', id).limit(1).single();
  if (error) throw new Error(error.message);
  return data;
}

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const row = await fetchByPublicId(params.id);

  const recomputed = computePrice({
    service: row.service,
    hand_or_feet: row.hand_or_feet,
    length: row.length,
    shape: row.shape,
    nail_art_level: row.nail_art_level,
    nail_art_count: row.nail_art_count ?? 0,
    extras: row.extras ?? {},
    imageComplexityScore: row.image_meta?.complexityScore ?? 1
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-2xl shadow grid gap-3">
        <h1 className="text-xl font-semibold">Ficha de Reserva</h1>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div><b>Cliente:</b> {row.customer_name}</div>
          <div><b>Email:</b> {row.email}</div>
          {row.phone && <div><b>Tel:</b> {row.phone}</div>}
          <div><b>Fecha:</b> {row.appointment_date}</div>
          <div><b>Hora:</b> {row.appointment_time}</div>
          <div><b>Servicio:</b> {row.service}</div>
          <div><b>Manos/Pies:</b> {row.hand_or_feet}</div>
          <div><b>Largo:</b> {row.length}</div>
          <div><b>Forma:</b> {row.shape}</div>
          <div><b>Color:</b> <span className="inline-block w-4 h-4 rounded align-middle mr-1" style={{backgroundColor: row.color}}></span>{row.color}</div>
          <div><b>Nail art:</b> {row.nail_art_level} ({row.nail_art_count}/10)</div>
          <div><b>Extras:</b> {Object.entries(row.extras ?? {}).filter(([,v])=>v).map(([k])=>k).join(', ') || 'N/A'}</div>
          <div><b>Estado:</b> {row.status}</div>
        </div>
        {row.image_url && (
          <div className="grid gap-1">
            <img src={row.image_url} alt="ref" className="w-60 h-60 object-cover rounded border" />
            {row.image_meta && (
              <div className="text-xs text-gray-600">
                {row.image_meta.width}×{row.image_meta.height}px · {row.image_meta.megapixels}MP · {row.image_meta.sizeKB}KB · Edge {row.image_meta.edgeDensity} · Score {row.image_meta.complexityScore}
              </div>
            )}
          </div>
        )}
        <div className="text-sm text-gray-600">
          Precio guardado: <b>{formatMoney(row.price ?? recomputed.total)}</b>
        </div>
      </div>

      <EstimateCard data={recomputed} />

      <div className="md:col-span-2 text-xs text-gray-500">
        Estimado ±15%. Esta ficha es para uso interno de la técnica.
      </div>
    </div>
  );
}
