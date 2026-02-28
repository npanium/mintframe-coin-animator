import type {
  ConfettiSettings,
  ChartAnimSettings,
  ConfettiPresetId,
  ChartAnimPresetId,
} from "../types";
import { CONFETTI_PRESETS } from "../lib/confetti";
import { CHART_ANIM_PRESETS } from "../lib/chartAnim";
import {
  SectionLabel,
  Slider,
  CheckRow,
  Advanced,
  ToggleGroup,
  DimBtn,
} from "./ui";

interface Props {
  confetti: ConfettiSettings;
  chartAnim: ChartAnimSettings;
  onConfetti: (c: Partial<ConfettiSettings>) => void;
  onChartAnim: (a: Partial<ChartAnimSettings>) => void;
  onRetraceChart: () => void;
}

const CONFETTI_PRESETS_UI: {
  id: ConfettiPresetId;
  label: string;
  emoji: string;
}[] = [
  { id: "gold", label: "Gold Rain", emoji: "🪙" },
  { id: "moon", label: "Moon Blast", emoji: "🌙" },
  { id: "diamond", label: "Diamond", emoji: "💎" },
  { id: "fire", label: "Fire Rise", emoji: "🔥" },
  { id: "custom", label: "Custom", emoji: "✦" },
];

const CHART_ANIM_UI: { id: ChartAnimPresetId; label: string; hint: string }[] =
  [
    { id: "instant", label: "Instant", hint: "No animation" },
    { id: "smooth", label: "Smooth", hint: "Clean ease-out" },
    { id: "dramatic", label: "Dramatic", hint: "Slow build" },
    { id: "glitch", label: "Glitch", hint: "Cyberpunk jitter" },
    { id: "custom", label: "Custom", hint: "Fine-tune below" },
  ];

const EASING_OPTS: { value: ChartAnimSettings["easing"]; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "bounce", label: "Bounce" },
];

export function PanelEffects({
  confetti,
  chartAnim,
  onConfetti,
  onChartAnim,
  onRetraceChart,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* ── CONFETTI ── */}
      <SectionLabel>Confetti</SectionLabel>

      <CheckRow
        label="Enable"
        checked={confetti.enabled}
        onChange={(v) => onConfetti({ enabled: v })}
      />

      <div className="flex flex-col gap-1.5">
        {CONFETTI_PRESETS_UI.map((p) => (
          <button
            key={p.id}
            onClick={() =>
              onConfetti({ preset: p.id, ...CONFETTI_PRESETS[p.id] })
            }
            className={`flex items-center gap-3 px-3 py-2 rounded border transition-all cursor-pointer text-left
              ${
                confetti.preset === p.id
                  ? "border-amber-500 bg-amber-950/40 text-amber-300"
                  : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
              }`}
          >
            <span className="text-base">{p.emoji}</span>
            <span className="text-sm font-mono">{p.label}</span>
          </button>
        ))}
      </div>

      <CheckRow
        label="Burst mode"
        checked={confetti.burst}
        onChange={(v) => onConfetti({ burst: v })}
      />

      <Advanced>
        <Slider
          label="Particles"
          min={20}
          max={300}
          step={10}
          value={confetti.particleCount}
          display={(v) => Math.round(v).toString()}
          onChange={(v) =>
            onConfetti({ particleCount: Math.round(v), preset: "custom" })
          }
        />
        <Slider
          label="Speed"
          min={0.5}
          max={10}
          step={0.5}
          value={confetti.speed}
          display={(v) => v.toFixed(1)}
          onChange={(v) => onConfetti({ speed: v, preset: "custom" })}
        />
        <Slider
          label="Spread"
          min={0.1}
          max={2}
          step={0.1}
          value={confetti.spread}
          display={(v) => v.toFixed(1)}
          onChange={(v) => onConfetti({ spread: v, preset: "custom" })}
        />
        <Slider
          label="Size"
          min={2}
          max={20}
          step={1}
          value={confetti.size}
          display={(v) => Math.round(v).toString()}
          onChange={(v) => onConfetti({ size: v, preset: "custom" })}
        />
        <Slider
          label="Gravity"
          min={-0.5}
          max={0.5}
          step={0.02}
          value={confetti.gravity}
          display={(v) => v.toFixed(2)}
          onChange={(v) => onConfetti({ gravity: v, preset: "custom" })}
        />
        <CheckRow
          label="Fade Out"
          checked={confetti.fadeOut}
          onChange={(v) => onConfetti({ fadeOut: v, preset: "custom" })}
        />
      </Advanced>

      {/* ── CHART ANIMATION ── */}
      <SectionLabel>Chart Animation</SectionLabel>

      <div className="flex flex-col gap-1.5">
        {CHART_ANIM_UI.map((p) => (
          <button
            key={p.id}
            onClick={() =>
              onChartAnim({ preset: p.id, ...CHART_ANIM_PRESETS[p.id] })
            }
            className={`flex items-center justify-between px-3 py-2 rounded border transition-all cursor-pointer
              ${
                chartAnim.preset === p.id
                  ? "border-amber-500 bg-amber-950/40 text-amber-300"
                  : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
              }`}
          >
            <span className="text-sm font-mono">{p.label}</span>
            <span className="text-xs text-neutral-500">{p.hint}</span>
          </button>
        ))}
      </div>

      <DimBtn onClick={onRetraceChart}>↺ Retrace Chart</DimBtn>

      <Advanced>
        <Slider
          label="Duration"
          min={0}
          max={8}
          step={0.5}
          value={chartAnim.duration}
          display={(v) => v.toFixed(1) + "s"}
          onChange={(v) => onChartAnim({ duration: v, preset: "custom" })}
        />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">Easing</span>
          <ToggleGroup
            options={EASING_OPTS}
            value={chartAnim.easing}
            onChange={(v) => onChartAnim({ easing: v, preset: "custom" })}
            cols={2}
          />
        </div>
        <CheckRow
          label="Trail Glow"
          checked={chartAnim.trailGlow}
          onChange={(v) => onChartAnim({ trailGlow: v, preset: "custom" })}
        />
        <Slider
          label="Trail Length"
          min={0.01}
          max={1}
          step={0.01}
          value={chartAnim.trailLength}
          display={(v) => Math.round(v * 100) + "%"}
          onChange={(v) => onChartAnim({ trailLength: v, preset: "custom" })}
        />
        <CheckRow
          label="Dot Pulse"
          checked={chartAnim.dotPulse}
          onChange={(v) => onChartAnim({ dotPulse: v, preset: "custom" })}
        />
      </Advanced>
    </div>
  );
}
