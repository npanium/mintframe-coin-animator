import {
  SectionLabel,
  CheckRow,
  TextInput,
  ColorRow,
  Slider,
  ToggleGroup,
  Select,
  Advanced,
} from "./ui";
import type {
  OverlaySettings,
  ChartSettings,
  ChartData,
  AspectRatio,
  Timeframe,
  ChartMode,
} from "../types";
import { FONTS, ASPECT_RATIOS, TF_OPTIONS } from "../lib/presets";
import { fetchChart, priceChange } from "../lib/chartUtils";
import { useState } from "react";

interface Props {
  overlay: OverlaySettings;
  chart: ChartSettings;
  chartData: ChartData | null;
  onOverlay: (o: OverlaySettings) => void;
  onChart: (c: ChartSettings) => void;
  onChartData: (d: ChartData | null) => void;
}

const CHART_MODES: { value: ChartMode; label: string }[] = [
  { value: "bg", label: "Background" },
  { value: "side", label: "Side Panel" },
];

export function OverlayPanel({
  overlay,
  chart,
  chartData,
  onOverlay,
  onChart,
  onChartData,
}: Props) {
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState("");

  const ov = (k: keyof OverlaySettings) => (v: string | number | boolean) =>
    onOverlay({ ...overlay, [k]: v });
  const ch = (k: keyof ChartSettings) => (v: string | number | boolean) =>
    onChart({ ...chart, [k]: v });

  const doFetch = async () => {
    if (!chart.coinId.trim()) return;
    setFetching(true);
    setFetchErr("");
    try {
      const data = await fetchChart(
        chart.coinId.trim().toLowerCase(),
        chart.tf,
      );
      onChartData(data);
    } catch (e: unknown) {
      setFetchErr(e instanceof Error ? e.message : "Fetch failed");
      onChartData(null);
    }
    setFetching(false);
  };

  const pct = chartData ? priceChange(chartData.prices) : null;
  const pctColor =
    pct === null ? "" : pct >= 0 ? "text-green-400" : "text-rose-400";

  return (
    <div className="flex flex-col gap-4">
      {/* OVERLAY */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Marketing Overlay</SectionLabel>
        <CheckRow
          label="Enable Overlay"
          checked={overlay.enabled}
          onChange={ov("enabled")}
        />

        <TextInput
          label="Token Name"
          value={overlay.tokenName}
          onChange={ov("tokenName")}
          large
        />
        <TextInput
          label="Tagline"
          value={overlay.tagline}
          onChange={ov("tagline")}
        />
        <TextInput
          label="Chain Badge"
          value={overlay.chainBadge}
          onChange={ov("chainBadge")}
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-500">Aspect Ratio</span>
          <ToggleGroup<AspectRatio>
            options={ASPECT_RATIOS.map((a) => ({
              value: a.value as AspectRatio,
              label: a.label,
            }))}
            value={overlay.aspect}
            onChange={ov("aspect")}
            cols={3}
          />
        </div>

        <Advanced>
          <ColorRow
            label="Text Color"
            value={overlay.textColor}
            onChange={ov("textColor")}
          />
          <ColorRow
            label="Accent"
            value={overlay.accent}
            onChange={ov("accent")}
          />
          <ColorRow
            label="Badge BG"
            value={overlay.badgeBg}
            onChange={ov("badgeBg")}
          />
          <Select<string>
            label="Font"
            value={overlay.font}
            options={FONTS}
            onChange={ov("font")}
          />
          <Slider
            label="Bar Opacity"
            value={overlay.bgAlpha}
            min={0}
            max={1}
            step={0.05}
            display={(v) => v.toFixed(2)}
            onChange={ov("bgAlpha")}
          />
        </Advanced>
      </div>

      {/* CHART */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Price Chart</SectionLabel>
        <CheckRow
          label="Enable Chart"
          checked={chart.enabled}
          onChange={ch("enabled")}
        />

        <div className="flex gap-1.5">
          <input
            type="text"
            value={chart.coinId}
            onChange={(e) => onChart({ ...chart, coinId: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && doFetch()}
            placeholder="e.g. bitcoin, algorand"
            className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-100 rounded px-2 py-1.5 text-sm font-mono outline-none focus:border-amber-600"
          />
          <button
            onClick={doFetch}
            disabled={fetching}
            className="px-3 py-1.5 text-sm rounded border border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-amber-600 hover:text-amber-400 transition-all cursor-pointer disabled:opacity-40"
          >
            {fetching ? "…" : "Fetch"}
          </button>
        </div>

        {fetchErr && <p className="text-sm text-rose-400">{fetchErr}</p>}

        {chartData && (
          <p className={`text-sm font-mono ${pctColor}`}>
            {chartData.coinId} ·{" "}
            {TF_OPTIONS.find((t) => t.value === chart.tf)?.label} ·{" "}
            {pct! >= 0 ? "+" : ""}
            {pct!.toFixed(2)}%
          </p>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-500">Timeframe</span>
          <ToggleGroup<Timeframe>
            options={TF_OPTIONS.map((t) => ({
              value: t.value as Timeframe,
              label: t.label,
            }))}
            value={chart.tf}
            onChange={(tf) => {
              onChart({ ...chart, tf });
            }}
            cols={4}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-500">Layout</span>
          <ToggleGroup<ChartMode>
            options={CHART_MODES}
            value={chart.mode}
            onChange={ch("mode")}
            cols={2}
          />
        </div>

        <Advanced>
          <Slider
            label="Opacity"
            value={chart.alpha}
            min={0.05}
            max={1}
            step={0.05}
            display={(v) => v.toFixed(2)}
            onChange={ch("alpha")}
          />
          <Slider
            label="Line Width"
            value={chart.lineW}
            min={1}
            max={6}
            step={0.5}
            display={(v) => v.toFixed(1)}
            onChange={ch("lineW")}
          />
          <CheckRow
            label="Show Price & Change"
            checked={chart.showPrice}
            onChange={ch("showPrice")}
          />
        </Advanced>
      </div>
    </div>
  );
}
