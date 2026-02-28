import { useState } from 'react'
import type { OverlaySettings, ChartSettings, ChartData, AspectRatio, Timeframe } from '../types'
import { FONTS, ASPECT_RATIOS, TF_OPTIONS } from '../lib/presets'
import { fetchChart, priceChange } from '../lib/chartUtils'
import {
  SectionLabel, Slider, ColorRow, CheckRow, TextInput,
  Select, ToggleGroup, Advanced, DimBtn,
} from './ui'

interface Props {
  overlay: OverlaySettings
  chart: ChartSettings
  chartData: ChartData | null
  onOverlay: (o: Partial<OverlaySettings>) => void
  onChart: (c: Partial<ChartSettings>) => void
  onChartData: (d: ChartData | null) => void
}

const ASPECT_OPTS: { value: AspectRatio; label: string }[] = ASPECT_RATIOS.map(a => ({ value: a.value as AspectRatio, label: `${a.label} ${a.hint}` }))
const CHART_MODE_OPTS = [
  { value: 'bg'   as const, label: 'Background' },
  { value: 'side' as const, label: 'Side Panel' },
]
const TF_OPTS: { value: Timeframe; label: string }[] = TF_OPTIONS.map(t => ({ value: t.value as Timeframe, label: t.label }))

export function PanelOverlay({ overlay, chart, chartData, onOverlay, onChart, onChartData }: Props) {
  const [fetchStatus, setFetchStatus] = useState<{ msg: string; ok: boolean } | null>(null)
  const [fetching, setFetching] = useState(false)

  async function handleFetch() {
    if (!chart.coinId.trim()) return
    setFetching(true)
    setFetchStatus({ msg: 'Fetching…', ok: true })
    try {
      const data = await fetchChart(chart.coinId.trim().toLowerCase(), chart.tf)
      onChartData(data)
      const pct  = priceChange(data.prices)
      const sign = pct >= 0 ? '+' : ''
      setFetchStatus({ msg: `${data.coinId} · ${sign}${pct.toFixed(2)}%`, ok: pct >= 0 })
    } catch (e: unknown) {
      setFetchStatus({ msg: (e as Error).message, ok: false })
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── Overlay ── */}
      <SectionLabel>Marketing Overlay</SectionLabel>

      <CheckRow label="Enable Overlay" checked={overlay.enabled} onChange={v => onOverlay({ enabled: v })} />

      {overlay.enabled && <>
        <TextInput label="Token Name" value={overlay.tokenName} onChange={v => onOverlay({ tokenName: v })} large />
        <TextInput label="Tagline"    value={overlay.tagline}   onChange={v => onOverlay({ tagline: v })} />
        <TextInput label="Chain Badge" value={overlay.chainBadge} onChange={v => onOverlay({ chainBadge: v })} />

        <ColorRow label="Text"   value={overlay.textColor} onChange={v => onOverlay({ textColor: v })} />
        <ColorRow label="Accent" value={overlay.accent}    onChange={v => onOverlay({ accent: v })} />
        <ColorRow label="Badge"  value={overlay.badgeBg}   onChange={v => onOverlay({ badgeBg: v })} />

        <Select label="Font" value={overlay.font} options={FONTS.map(f => ({ value: f.value, label: f.label }))} onChange={v => onOverlay({ font: v })} />

        <div className="flex flex-col gap-1">
          <span className="text-sm text-neutral-500">Aspect Ratio</span>
          <ToggleGroup options={ASPECT_OPTS} value={overlay.aspect} onChange={v => onOverlay({ aspect: v })} cols={3} />
        </div>

        <Advanced>
          <Slider label="Bar Alpha" min={0} max={1} step={0.05} value={overlay.bgAlpha} display={v => v.toFixed(2)} onChange={v => onOverlay({ bgAlpha: v })} />
        </Advanced>

        {/* ── Chart ── */}
        <SectionLabel>Price Chart</SectionLabel>

        <CheckRow label="Enable Chart" checked={chart.enabled} onChange={v => onChart({ enabled: v })} />

        {chart.enabled && <>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={chart.coinId}
              onChange={e => onChart({ coinId: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="bitcoin"
              className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm font-mono rounded px-2 py-1.5 outline-none focus:border-amber-600"
            />
            <DimBtn onClick={handleFetch} disabled={fetching}>
              {fetching ? '…' : 'Fetch'}
            </DimBtn>
          </div>

          {fetchStatus && (
            <p className={`text-sm font-mono ${fetchStatus.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {fetchStatus.msg}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-500">Timeframe</span>
            <ToggleGroup options={TF_OPTS} value={chart.tf} onChange={v => { onChart({ tf: v }); if (chartData) onChartData(null) }} cols={4} />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-500">Layout</span>
            <ToggleGroup options={CHART_MODE_OPTS} value={chart.mode} onChange={v => onChart({ mode: v })} cols={2} />
          </div>

          <CheckRow label="Show Price & Change" checked={chart.showPrice} onChange={v => onChart({ showPrice: v })} />

          <Advanced>
            <Slider label="Chart Alpha" min={0.05} max={1} step={0.05} value={chart.alpha} display={v => v.toFixed(2)} onChange={v => onChart({ alpha: v })} />
            <Slider label="Line Width"  min={1} max={6} step={0.5} value={chart.lineW}  display={v => v.toFixed(1)} onChange={v => onChart({ lineW: v })} />
          </Advanced>
        </>}
      </>}
    </div>
  )
}
