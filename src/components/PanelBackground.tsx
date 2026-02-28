import { useRef } from "react";
import type { BgGradient, BgMode } from "../types";
import { SectionLabel, ColorRow, Slider, ToggleGroup } from "./ui";

interface Props {
  bgColor: string;
  bgGradient: BgGradient;
  bgImg: HTMLImageElement | null;
  onBgColor: (v: string) => void;
  onBgGradient: (g: Partial<BgGradient>) => void;
  onBgImg: (img: HTMLImageElement | null) => void;
}

const BG_MODE_OPTS: { value: BgMode; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "linear", label: "Linear" },
  { value: "radial", label: "Radial" },
  { value: "mesh", label: "Mesh" },
];

// Quick gradient presets
const GRADIENT_PRESETS: {
  label: string;
  colorA: string;
  colorB: string;
  angle: number;
}[] = [
  { label: "Midnight", colorA: "#0a0a1a", colorB: "#1a0a2e", angle: 135 },
  { label: "Dusk", colorA: "#1a0522", colorB: "#0a0a14", angle: 160 },
  { label: "Gold Mist", colorA: "#1a1200", colorB: "#0a0800", angle: 120 },
  { label: "Deep Sea", colorA: "#001a1a", colorB: "#000a14", angle: 145 },
  { label: "Ember", colorA: "#1a0800", colorB: "#0a0000", angle: 110 },
  { label: "Void", colorA: "#080810", colorB: "#000000", angle: 180 },
];

export function PanelBackground({
  bgColor,
  bgGradient,
  bgImg,
  onBgColor,
  onBgGradient,
  onBgImg,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      onBgImg(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  const isGradient = bgGradient.mode !== "solid";

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Background</SectionLabel>

      {/* Mode selector */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-neutral-500">Mode</span>
        <ToggleGroup
          options={BG_MODE_OPTS}
          value={bgGradient.mode}
          onChange={(v) => onBgGradient({ mode: v })}
          cols={4}
        />
      </div>

      {/* Solid color */}
      {!isGradient && (
        <ColorRow label="Color" value={bgColor} onChange={onBgColor} />
      )}

      {/* Gradient colors */}
      {isGradient && (
        <>
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/60">
            <ColorRow
              label={bgGradient.mode === "radial" ? "Center" : "Color A"}
              value={bgGradient.colorA}
              onChange={(v) => onBgGradient({ colorA: v })}
            />
            <ColorRow
              label={bgGradient.mode === "radial" ? "Edge" : "Color B"}
              value={bgGradient.colorB}
              onChange={(v) => onBgGradient({ colorB: v })}
            />
          </div>

          {/* Angle — only for linear */}
          {bgGradient.mode === "linear" && (
            <Slider
              label="Angle"
              min={0}
              max={360}
              step={5}
              value={bgGradient.angle}
              display={(v) => `${Math.round(v)}°`}
              onChange={(v) => onBgGradient({ angle: v })}
            />
          )}

          {/* Gradient preview strip */}
          <div
            className="h-8 rounded-lg border border-neutral-800/60"
            style={{
              background:
                bgGradient.mode === "linear"
                  ? `linear-gradient(${bgGradient.angle}deg, ${bgGradient.colorA}, ${bgGradient.colorB})`
                  : bgGradient.mode === "radial"
                    ? `radial-gradient(circle, ${bgGradient.colorA}, ${bgGradient.colorB})`
                    : `linear-gradient(135deg, ${bgGradient.colorA} 0%, ${bgGradient.colorB} 50%, ${bgGradient.colorA} 100%)`,
            }}
          />

          {/* Quick presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-neutral-600 uppercase tracking-wide">
              Presets
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {GRADIENT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() =>
                    onBgGradient({
                      colorA: p.colorA,
                      colorB: p.colorB,
                      angle: p.angle,
                    })
                  }
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <div
                    className="w-full h-8 rounded border border-neutral-800 group-hover:border-neutral-600 transition-colors"
                    style={{
                      background: `linear-gradient(${p.angle}deg, ${p.colorA}, ${p.colorB})`,
                    }}
                  />
                  <span className="text-[10px] text-neutral-600 group-hover:text-neutral-400 transition-colors">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Image upload */}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 py-1.5 text-xs border border-dashed border-neutral-700 text-neutral-500 rounded hover:border-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          {bgImg ? "📷 Change image" : "+ Upload image"}
        </button>
        {bgImg && (
          <button
            onClick={() => onBgImg(null)}
            className="text-sm text-neutral-500 hover:text-red-400 cursor-pointer transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <p className="text-xs text-neutral-500">
        Tip: #00ff00 = green screen / chroma key
      </p>
    </div>
  );
}
