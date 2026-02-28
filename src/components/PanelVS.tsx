import { useState } from "react";
import type {
  VsSettings,
  ChartData,
  Timeframe,
  CoinSettings,
  LogoSettings,
} from "../types";
import { TOKEN_PRESETS, MATERIAL_PRESETS } from "../lib/presets";
import { fetchChart, priceChange } from "../lib/chartUtils";
import { TF_OPTIONS } from "../lib/presets";
import {
  SectionLabel,
  Slider,
  ColorRow,
  CheckRow,
  TextInput,
  ToggleGroup,
  DimBtn,
  Advanced,
} from "./ui";

interface Props {
  vs: VsSettings;
  vsChartData: ChartData | null;
  onVs: (v: Partial<VsSettings>) => void;
  onVsChartData: (d: ChartData | null) => void;
  onApplyRightPreset: (id: string) => void;
}

const ACCENT_MAP: Record<string, string> = {
  bitcoin: "border-orange-500/50 bg-orange-950/20 text-orange-400",
  ethereum: "border-indigo-500/50 bg-indigo-950/20 text-indigo-400",
  solana: "border-violet-500/50 bg-violet-950/20 text-violet-400",
  algorand: "border-cyan-500/50   bg-cyan-950/20   text-cyan-400",
  avalanche: "border-red-500/50    bg-red-950/20    text-red-400",
  chainlink: "border-blue-500/50   bg-blue-950/20   text-blue-400",
};

const TF_OPTS: { value: Timeframe; label: string }[] = TF_OPTIONS.map((t) => ({
  value: t.value as Timeframe,
  label: t.label,
}));

const MATERIAL_PRESET_OPTS = MATERIAL_PRESETS.map((m) => ({
  value: m.id,
  label: m.label,
}));

export function PanelVS({
  vs,
  vsChartData,
  onVs,
  onVsChartData,
  onApplyRightPreset,
}: Props) {
  const [fetchStatus, setFetchStatus] = useState<{
    msg: string;
    ok: boolean;
  } | null>(null);
  const [fetching, setFetching] = useState(false);

  async function fetchVsChart(coinId: string, tf: Timeframe) {
    if (!coinId.trim()) return;
    setFetching(true);
    setFetchStatus({ msg: "Fetching…", ok: true });
    try {
      const data = await fetchChart(coinId.trim().toLowerCase(), tf);
      onVsChartData(data);
      const pct = priceChange(data.prices);
      setFetchStatus({
        msg: `${data.coinId} · ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
        ok: pct >= 0,
      });
    } catch (e: unknown) {
      setFetchStatus({ msg: (e as Error).message, ok: false });
    } finally {
      setFetching(false);
    }
  }

  function applyMaterialPreset(id: string) {
    const p = MATERIAL_PRESETS.find((m) => m.id === id);
    if (!p) return;
    onVs({
      rightCoin: {
        ...vs.rightCoin,
        color: p.coinColor,
        metalness: p.metalness,
        roughness: p.roughness,
      },
      rightLogo: { ...vs.rightLogo, color: p.logoColor },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Enable */}
      <div className="flex flex-col gap-1">
        <SectionLabel>VS Mode</SectionLabel>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Side-by-side comparison. Two independent coins — left coin uses the
          main Coin &amp; Logo tabs.
        </p>
      </div>

      <CheckRow
        label="Enable VS Mode"
        checked={vs.enabled}
        onChange={(v) => onVs({ enabled: v })}
      />

      {/* Camera zoom — always visible */}
      <Slider
        label="Camera Zoom"
        min={0.6}
        max={2.5}
        step={0.05}
        value={vs.cameraZoom}
        display={(v) => `${v.toFixed(2)}×`}
        onChange={(v) => onVs({ cameraZoom: v })}
      />

      {/* ── LEFT COIN OVERLAY ── */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/60">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          Left Coin · Overlay
        </span>
        <TextInput
          label="Token Name"
          value={vs.leftTokenName}
          onChange={(v) => onVs({ leftTokenName: v })}
          large
        />
        <TextInput
          label="Tagline"
          value={vs.leftTagline}
          onChange={(v) => onVs({ leftTagline: v })}
        />
        <TextInput
          label="Chain"
          value={vs.leftChainBadge}
          onChange={(v) => onVs({ leftChainBadge: v })}
        />
        <ColorRow
          label="Accent"
          value={vs.leftAccent}
          onChange={(v) => onVs({ leftAccent: v })}
        />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">Chart ID</span>
          <input
            type="text"
            value={vs.leftCoinId}
            onChange={(e) => onVs({ leftCoinId: e.target.value })}
            placeholder="bitcoin"
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm font-mono rounded px-2 py-1.5 outline-none focus:border-amber-600"
          />
        </div>
      </div>

      {/* ── RIGHT COIN ── */}
      <div className="flex flex-col gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/60">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          Right Coin · Preset
        </span>

        {/* Token quick-pick */}
        <div className="grid grid-cols-3 gap-1.5">
          {TOKEN_PRESETS.filter((t) => t.id !== "custom").map((t) => {
            const cls =
              ACCENT_MAP[t.id] ?? "border-neutral-700 text-neutral-400";
            const isActive = vs.rightTokenId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onApplyRightPreset(t.id)}
                className={`flex flex-col items-start gap-0.5 p-2 rounded border transition-all cursor-pointer text-left
                  ${isActive ? `${cls} ring-1 ring-white/10` : "border-neutral-800 bg-neutral-950 text-neutral-500 hover:border-neutral-600"}`}
              >
                <span
                  className={`text-xs font-bold font-mono ${isActive ? "" : "text-neutral-400"}`}
                >
                  {t.ticker}
                </span>
                <span className="text-[10px] text-neutral-600">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Material preset strip */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">Material</span>
          <div className="flex gap-1.5 flex-wrap">
            {MATERIAL_PRESETS.map((m) => (
              <button
                key={m.id}
                onClick={() => applyMaterialPreset(m.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded border border-neutral-800 bg-neutral-950 hover:border-neutral-600 cursor-pointer transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full border border-neutral-700"
                  style={{ background: m.coinColor }}
                />
                <span className="text-xs text-neutral-400">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right coin color/material */}
        <ColorRow
          label="Coin Color"
          value={vs.rightCoin.color}
          onChange={(v) => onVs({ rightCoin: { ...vs.rightCoin, color: v } })}
        />
        <Slider
          label="Metalness"
          min={0}
          max={1}
          step={0.01}
          value={vs.rightCoin.metalness}
          display={(v) => v.toFixed(2)}
          onChange={(v) =>
            onVs({ rightCoin: { ...vs.rightCoin, metalness: v } })
          }
        />
        <Slider
          label="Roughness"
          min={0}
          max={1}
          step={0.01}
          value={vs.rightCoin.roughness}
          display={(v) => v.toFixed(2)}
          onChange={(v) =>
            onVs({ rightCoin: { ...vs.rightCoin, roughness: v } })
          }
        />
      </div>

      {/* ── RIGHT LOGO ── */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/60">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          Right Coin · Logo
        </span>
        <ColorRow
          label="Logo Color"
          value={vs.rightLogo.color}
          onChange={(v) => onVs({ rightLogo: { ...vs.rightLogo, color: v } })}
        />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">SVG</span>
          <textarea
            value={vs.rightLogo.svg}
            onChange={(e) =>
              onVs({ rightLogo: { ...vs.rightLogo, svg: e.target.value } })
            }
            placeholder="Paste SVG or path data…"
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono rounded px-2 py-1.5 outline-none focus:border-amber-600 resize-none"
          />
        </div>
        <Advanced>
          <Slider
            label="Scale"
            min={0.1}
            max={3}
            step={0.05}
            value={vs.rightLogo.scale}
            display={(v) => v.toFixed(2)}
            onChange={(v) => onVs({ rightLogo: { ...vs.rightLogo, scale: v } })}
          />
          <Slider
            label="Depth"
            min={0.01}
            max={0.3}
            step={0.01}
            value={vs.rightLogo.depth}
            display={(v) => v.toFixed(2)}
            onChange={(v) => onVs({ rightLogo: { ...vs.rightLogo, depth: v } })}
          />
          <Slider
            label="Bevel"
            min={0}
            max={0.05}
            step={0.002}
            value={vs.rightLogo.bevel}
            display={(v) => v.toFixed(3)}
            onChange={(v) => onVs({ rightLogo: { ...vs.rightLogo, bevel: v } })}
          />
        </Advanced>
      </div>

      {/* ── RIGHT OVERLAY ── */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/60">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          Right Coin · Overlay
        </span>
        <TextInput
          label="Token Name"
          value={vs.rightTokenName}
          onChange={(v) => onVs({ rightTokenName: v })}
          large
        />
        <TextInput
          label="Tagline"
          value={vs.rightTagline}
          onChange={(v) => onVs({ rightTagline: v })}
        />
        <TextInput
          label="Chain"
          value={vs.rightChainBadge}
          onChange={(v) => onVs({ rightChainBadge: v })}
        />
        <ColorRow
          label="Accent"
          value={vs.rightAccent}
          onChange={(v) => onVs({ rightAccent: v })}
        />
      </div>

      {/* ── RIGHT CHART ── */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/60">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          Right Coin · Chart
        </span>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={vs.rightCoinId}
            onChange={(e) => onVs({ rightCoinId: e.target.value })}
            placeholder="ethereum"
            className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm font-mono rounded px-2 py-1.5 outline-none focus:border-amber-600"
          />
          <DimBtn
            onClick={() => fetchVsChart(vs.rightCoinId, "1d")}
            disabled={fetching}
          >
            {fetching ? "…" : "Fetch"}
          </DimBtn>
        </div>
        {vsChartData && (
          <p className="text-xs text-neutral-600">
            {vsChartData.coinId} · {vsChartData.prices.length} pts
          </p>
        )}
        {fetchStatus && (
          <p
            className={`text-xs font-mono ${fetchStatus.ok ? "text-emerald-400" : "text-red-400"}`}
          >
            {fetchStatus.msg}
          </p>
        )}
      </div>

      {/* ── DIVIDER ── */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/60">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          Divider
        </span>
        <TextInput
          label="Label"
          value={vs.label}
          onChange={(v) => onVs({ label: v })}
        />
        <ColorRow
          label="Color"
          value={vs.dividerColor}
          onChange={(v) => onVs({ dividerColor: v })}
        />
      </div>
    </div>
  );
}
