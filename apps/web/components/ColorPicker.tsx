'use client';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

const presets = ['#000000','#FFFFFF','#FF385C','#FF8A00','#FFD60A','#00C2A8','#7C3AED','#FF69B4','#87CEEB'];

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="grid gap-2">
      <input
        type="color"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-16 h-10 rounded border"
      />
      <div className="flex flex-wrap gap-2">
        {presets.map(c => (
          <button key={c}
            type="button"
            onClick={()=>onChange(c)}
            style={{ backgroundColor: c }}
            className="w-8 h-8 rounded-full border"
            aria-label={`color ${c}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">{value}</span>
      </div>
    </div>
  );
}
