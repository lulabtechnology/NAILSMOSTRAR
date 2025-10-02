'use client';

import { useEffect, useMemo, useState } from "react";
import { computePrice } from "@/lib/price";
import type { ImageMeta, NailArtLevel, ServiceType, ShapeType, LengthType, HandOrFeet } from "@/lib/types";
import { analyzeImage } from "@/lib/imageAnalysis";
import ColorPicker from "@/components/ColorPicker";
import EstimateCard from "@/components/EstimateCard";
import { formatMoney } from "@/lib/utils";

type FormState = {
  customer_name: string;
  email: string;
  phone?: string;
  appointment_date: string;
  appointment_time: string;
  service: ServiceType;
  hand_or_feet: HandOrFeet;
  length: LengthType;
  shape: ShapeType;
  color: string;
  nail_art_level: NailArtLevel;
  nail_art_count: number;
  extras: { removal?: boolean; french_tip?: boolean; builder_gel_overlay?: boolean; };
};

const initial: FormState = {
  customer_name: "",
  email: "",
  phone: "",
  appointment_date: "",
  appointment_time: "",
  service: "gel_manicure",
  hand_or_feet: "hands",
  length: "short",
  shape: "square",
  color: "#FF69B4",
  nail_art_level: "none",
  nail_art_count: 0,
  extras: {},
};

export default function BookPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const price = useMemo(() => {
    const score = imageMeta?.complexityScore ?? 1;
    return computePrice({
      service: form.service,
      hand_or_feet: form.hand_or_feet,
      length: form.length,
      shape: form.shape,
      nail_art_level: form.nail_art_level,
      nail_art_count: form.nail_art_count,
      extras: form.extras,
      imageComplexityScore: score,
    });
  }, [form, imageMeta]);

  useEffect(()=>{
    if (!imageFile) { setImageMeta(null); setImgPreview(null); return; }
    const url = URL.createObjectURL(imageFile);
    setImgPreview(url);
    analyzeImage(imageFile).then(meta => setImageMeta(meta)).catch(()=>{
      setImageMeta(null);
    });
    return ()=> URL.revokeObjectURL(url);
  }, [imageFile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null); setOk(null);

    try {
      let image_url: string | undefined = undefined;
      let image_meta: ImageMeta | undefined = undefined;

      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        let r = await fetch('/api/upload', { method: 'POST', body: fd });
        if (r.status === 405) r = await fetch('/api/upload', { method: 'POST', body: fd }); // fallback redundante
        if (!r.ok) throw new Error(await r.text());
        const { url } = await r.json();
        image_url = url;
        image_meta = imageMeta ?? undefined;
      }

      const payload = {
        ...form,
        image_url,
        image_meta,
        image_complexity_score: imageMeta?.complexityScore ?? 1,
      };

      const headers = { 'Content-Type': 'application/json' };
      let res = await fetch('/api/create', { method: 'POST', headers, body: JSON.stringify(payload) });
      if (res.status === 405) {
        res = await fetch('/api/submit', { method: 'POST', headers, body: JSON.stringify(payload) });
      }
      if (!res.ok) throw new Error(await res.text());
      const j = await res.json();
      setOk(`Ficha creada: ${j.id}`);
      window.location.href = `/review/${j.id}`;
    } catch (err: any) {
      setError(err?.message ?? 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4 bg-white p-4 rounded-2xl shadow">
        <h1 className="text-xl font-semibold">Reservar</h1>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Nombre</span>
            <input className="border rounded p-2" required
              value={form.customer_name}
              onChange={e=>setForm(f=>({...f, customer_name: e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Email</span>
            <input type="email" className="border rounded p-2" required
              value={form.email}
              onChange={e=>setForm(f=>({...f, email: e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Teléfono (opcional)</span>
            <input className="border rounded p-2"
              value={form.phone ?? ''} onChange={e=>setForm(f=>({...f, phone: e.target.value}))} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Fecha</span>
              <input type="date" className="border rounded p-2" required
                value={form.appointment_date}
                onChange={e=>setForm(f=>({...f, appointment_date: e.target.value}))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Hora</span>
              <input type="time" className="border rounded p-2" required
                value={form.appointment_time}
                onChange={e=>setForm(f=>({...f, appointment_time: e.target.value}))}/>
            </label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Servicio base</span>
            <select className="border rounded p-2" value={form.service}
              onChange={e=>setForm(f=>({...f, service: e.target.value as any}))}>
              <option value="express_manicure">Express Manicure</option>
              <option value="gel_manicure">Gel Manicure</option>
              <option value="acrylic_fullset">Acrylic Fullset</option>
              <option value="fill">Fill</option>
              <option value="gel_pedicure">Gel Pedicure</option>
              <option value="express_pedicure">Express Pedicure</option>
              <option value="removal_only">Removal Only</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Manos / Pies</span>
            <select className="border rounded p-2" value={form.hand_or_feet}
              onChange={e=>setForm(f=>({...f, hand_or_feet: e.target.value as any}))}>
              <option value="hands">Manos</option>
              <option value="feet">Pies</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Largo</span>
            <select className="border rounded p-2" value={form.length}
              onChange={e=>setForm(f=>({...f, length: e.target.value as any}))}>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
              <option value="xlong">X-Long</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Forma</span>
            <select className="border rounded p-2" value={form.shape}
              onChange={e=>setForm(f=>({...f, shape: e.target.value as any}))}>
              <option value="square">Square</option>
              <option value="round">Round</option>
              <option value="almond">Almond</option>
              <option value="coffin">Coffin</option>
              <option value="stiletto">Stiletto</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Nail Art (nivel)</span>
            <select className="border rounded p-2" value={form.nail_art_level}
              onChange={e=>setForm(f=>({...f, nail_art_level: e.target.value as any}))}>
              <option value="none">Sin arte</option>
              <option value="simple">Simple</option>
              <option value="medium">Medio</option>
              <option value="complex">Complejo</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm"># de uñas con arte</span>
            <input type="number" className="border rounded p-2" min={0} max={10}
              value={form.nail_art_count}
              onChange={e=>setForm(f=>({...f, nail_art_count: parseInt(e.target.value||'0')}))}/>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 items-start">
          <div className="grid gap-2">
            <span className="text-sm">Color</span>
            <ColorPicker value={form.color} onChange={(v)=>setForm(f=>({...f, color: v}))}/>
          </div>

          <fieldset className="grid gap-2">
            <legend className="text-sm">Extras</legend>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.extras.removal}
                onChange={e=>setForm(f=>({...f, extras: {...f.extras, removal: e.target.checked}}))}/>
              Retiro (+$10)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.extras.french_tip}
                onChange={e=>setForm(f=>({...f, extras: {...f.extras, french_tip: e.target.checked}}))}/>
              French tip (+$8)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.extras.builder_gel_overlay}
                onChange={e=>setForm(f=>({...f, extras: {...f.extras, builder_gel_overlay: e.target.checked}}))}/>
              Builder gel overlay (+$12)
            </label>
          </fieldset>
        </div>

        <div className="grid gap-2">
          <span className="text-sm">Imagen de referencia (opcional)</span>
          <input type="file" accept="image/*" onChange={e=>{
            const f = e.target.files?.[0] ?? null;
            setImageFile(f);
          }}/>
          {imgPreview && (
            <div className="flex gap-3">
              <img src={imgPreview} alt="preview" className="w-32 h-32 object-cover rounded border" />
              <div className="text-xs text-gray-600">
                {imageMeta ? (
                  <ul className="space-y-1">
                    <li><b>Resolución:</b> {imageMeta.width}×{imageMeta.height} ({imageMeta.megapixels} MP)</li>
                    <li><b>Tamaño:</b> {imageMeta.sizeKB} KB</li>
                    <li><b>Densidad bordes:</b> {imageMeta.edgeDensity}</li>
                    <li><b>Complejidad:</b> {imageMeta.complexityScore} → mult {(0.8 + imageMeta.complexityScore*0.6).toFixed(2)}x</li>
                  </ul>
                ) : 'Analizando imagen...'}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting}
            className="bg-black text-white rounded-lg px-4 py-2">
            {submitting ? 'Creando ficha...' : 'Subir y crear ficha'}
          </button>
          {error && <span className="text-red-600 text-sm">{error}</span>}
          {ok && <span className="text-green-700 text-sm">{ok}</span>}
        </div>
      </form>

      <EstimateCard data={price} />

      <div className="md:col-span-2 text-sm text-gray-600">
        <p>Desglose rápido:</p>
        <ul className="list-disc pl-6">
          <li>Tiempo estimado: <b>{price.breakdown.hours}h</b> @ {formatMoney(price.breakdown.hourlyRate)}/h</li>
          <li>Nail art: <b>{formatMoney(price.breakdown.nailArtTotal)}</b>, Extras: <b>{formatMoney(price.breakdown.extrasTotal)}</b></li>
          <li>Mínimo tienda: {formatMoney(20)} (aplica si corresponde)</li>
        </ul>
      </div>
    </div>
  );
}
