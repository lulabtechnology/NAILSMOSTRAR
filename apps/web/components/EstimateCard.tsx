'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { PricingResult } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export default function EstimateCard({ data }: { data: PricingResult }) {
  const items = [
    { name: 'Tiempo', value: +(data.breakdown.hours * data.breakdown.hourlyRate).toFixed(2) },
    { name: 'Nail Art', value: data.breakdown.nailArtTotal },
    { name: 'Extras', value: data.breakdown.extrasTotal },
    { name: 'Mínimo', value: data.breakdown.shopMinAdj },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-4 sticky top-4">
      <h3 className="font-semibold mb-2">Estimado</h3>
      <div className="text-3xl font-bold">{formatMoney(data.total)}</div>
      <div className="text-sm text-gray-500 mb-2">Depósito sugerido: <b>{formatMoney(data.deposit)}</b></div>
      <div className="text-xs text-gray-500 mb-4">
        Horas: <b>{data.breakdown.hours}</b> @ {formatMoney(data.breakdown.hourlyRate)}/h ·
        Complejidad img: <b>{data.breakdown.complexityMultiplier.toFixed(2)}x</b>
        {data.breakdown.feetMultiplierApplied ? ' · Feet 1.1x' : ''}
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 mt-2">Estimado ±15%.</p>
    </div>
  );
}
