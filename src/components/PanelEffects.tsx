import { useState } from 'react'
import type { ConfettiSettings, ChartAnimSettings, VsSettings, ChartData, Timeframe, ConfettiPresetId, ChartAnimPresetId } from '../types'
import { CONFETTI_PRESETS } from '../lib/confetti'
import { CHART_ANIM_PRESETS } from '../lib/chartAnim'
import { fetchChart, priceChange } from '../lib/chartUtils'
import { TOKEN_PRESETS, TF_OPTIONS } from '../lib/presets'
import { SectionLabel, Slider, ColorRow, CheckRow, Advanced, ToggleGroup, DimBtn } from './ui'

interface Props {
  confetti: ConfettiSettings
  chartAnim: ChartAnimSettings
  vs: VsSettings
  vsChartData: ChartData | null
  onConfetti: (c: Partial<ConfettiSettings>) => void
  onChartAnim: (a: Partial<ChartAnimSettings>) => void
  onVs: (v: Partial<VsSettings>) => void
  onVsChartData: (d: ChartData | null) => void
  // trigger chart retrace
  onRetraceChart: () => void
}

const CONFETTI_PRESET_LABELS: { id: ConfettiPresetId; label: string; emoji: string }[] = [
  { id: 'gold',    label: 'Gold Rain',     emoji: '🪙' },
  { id: 'moon',    label: 'Moon Blast',    emoji: '🌙' },
  { id: 'diamond', label: 'Diamond',       emoji: '💎' },
  { id: 'fire',    label: 'Fire Rise',     emoji: '🔥' },
  { id: 'custom',  label: 'Custom',        emoji: '✦'  },
]

const CHART_ANIM_LABELS: { id: ChartAnimPresetId; label: string; hint: string }[] = [
  { id: 'instant',  label: 'Instant',  hint: 'No animation'      },
  { id: 'smooth',   label: 'Smooth',   hint: 'Clean ease-out'     },
  { id: 'dramatic', label: 'Dramatic', hint: 'Slow build'         },
  { id: 'glitch',   label: 'Glitch',   hint: 'Cyberpunk jitter'   },
  { id: 'custom',   label: 'Custom',   hint: 'Fine-tune below'    },
]

const EASING_OPTS: { value: ChartAnimSettings['easing']; label: string }[] = [
  { value: 'linear',   label: 'Linear'   },
  { value: 'ease-in',  label: 'Ease In'  },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'bounce',   label: 'Bounce'   },
]

const TF_OPTS: { value: Timeframe; label: string }[] = TF_OPTIONS.map(t => ({ value: t.value as Timeframe, label: t.label }))

const VS_TOKEN_OPTS = TOKEN_PRESETS.filter(t => t.id !== 'custom').map(t => ({ value: t.id, label: t.label }))

export function PanelEffects({ confetti, chartAnim, vs, vsChartData, onConfetti, onChartAnim, onVs, onVsChartData, onRetraceChart }: Props) {
  const [vsFetchStatus, setVsFetchStatus] = useState<{ msg: string; ok: boolean } | null>(null)
  const [vsFetching, setVsFetching] = useState(false)

  function applyConfettiPreset(id: ConfettiPresetId) {
    const p = CONFETTI_PRESETS[id]
    onConfetti({ preset: id, ...p })
  }

  function applyChartAnimPreset(id: ChartAnimPresetId) {
    const p = CHART_ANIM_PRESETS[id]
    onChartAnim({ preset: id, ...p })
  }

  async function fetchVsChart(coinId: string, tf: Timeframe) {
    if (!coinId.trim()) return
    setVsFetching(true)
    setVsFetchStatus({ msg: 'Fetching…', ok: true })
    try {
      const data = await fetchChart(coinId.trim().toLowerCase(), tf)
      onVsChartData(data)
      const pct  = priceChange(data.prices)
      const sign = pct >= 0 ? '+' : ''
      setVsFetchStatus({ msg: `${coinId} · ${sign}${pct.toFixed(2)}%`, ok: pct >= 0 })
    } catch (e: unknown) {
      setVsFetchStatus({ msg: (e as Error).message, ok: false })
    } finally {
      setVsFetching(false)
    }
  }

  function handleVsTokenChange(id: string) {
    const t = TOKEN_PRESETS.find(p => p.id === id)
    if (!t) return
    onVs({ rightTokenId: id, rightCoinId: t.coinGeckoId })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Confetti ── */}
      <SectionLabel>Confetti</SectionLabel>

      <CheckRow label="Enable Confetti" checked={confetti.enabled} onChange={v => onConfetti({ enabled: v })} />

      {/* Preset cards */}
      <div className="grid grid-cols-1 gap-1.5">
        {CONFETTI_PRESET_LABELS.map(p => (
          <button key={p.id} onClick={() => applyConfettiPreset(p.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded border transition-all cursor-pointer text-left
              ${confetti.preset === p.id
                ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'}`}>
            <span className="text-lg">{p.emoji}</span>
            <span className="text-sm font-mono">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <CheckRow label="Burst mode" checked={confetti.burst} onChange={v => onConfetti({ burst: v, ...(v ? {} : { enabled: confetti.enabled }) })} />
      </div>

      <Advanced>
        <Slider label="Particles" min={20} max={300} step={10} value={confetti.particleCount} display={v => Math.round(v).toString()} onChange={v => onConfetti({ particleCount: Math.round(v), preset: 'custom' })} />
        <Slider label="Speed"     min={0.5} max={10} step={0.5} value={confetti.speed}          display={v => v.toFixed(1)} onChange={v => onConfetti({ speed: v, preset: 'custom' })} />
        <Slider label="Spread"    min={0.1} max={2}  step={0.1} value={confetti.spread}         display={v => v.toFixed(1)} onChange={v => onConfetti({ spread: v, preset: 'custom' })} />
        <Slider label="Size"      min={2}   max={20} step={1}   value={confetti.size}           display={v => Math.round(v).toString()} onChange={v => onConfetti({ size: v, preset: 'custom' })} />
        <Slider label="Gravity"   min={-0.5} max={0.5} step={0.02} value={confetti.gravity}    display={v => v.toFixed(2)} onChange={v => onConfetti({ gravity: v, preset: 'custom' })} />
        <CheckRow label="Fade Out" checked={confetti.fadeOut} onChange={v => onConfetti({ fadeOut: v, preset: 'custom' })} />
      </Advanced>

      {/* ── Chart Animation ── */}
      <SectionLabel>Chart Animation</SectionLabel>

      <div className="grid grid-cols-1 gap-1.5">
        {CHART_ANIM_LABELS.map(p => (
          <button key={p.id} onClick={() => applyChartAnimPreset(p.id)}
            className={`flex items-center justify-between px-3 py-2 rounded border transition-all cursor-pointer
              ${chartAnim.preset === p.id
                ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'}`}>
            <span className="text-sm font-mono">{p.label}</span>
            <span className="text-xs text-neutral-600">{p.hint}</span>
          </button>
        ))}
      </div>

      <DimBtn onClick={onRetraceChart}>↺ Retrace Chart</DimBtn>

      <Advanced>
        <Slider label="Duration"     min={0} max={8} step={0.5} value={chartAnim.duration}    display={v => v.toFixed(1) + 's'} onChange={v => onChartAnim({ duration: v, preset: 'custom' })} />
        <div className="flex flex-col gap-1">
          <span className="text-sm text-neutral-500">Easing</span>
          <ToggleGroup options={EASING_OPTS} value={chartAnim.easing} onChange={v => onChartAnim({ easing: v, preset: 'custom' })} cols={2} />
        </div>
        <CheckRow label="Trail Glow"  checked={chartAnim.trailGlow} onChange={v => onChartAnim({ trailGlow: v, preset: 'custom' })} />
        <Slider label="Trail Length"  min={0.01} max={1} step={0.01} value={chartAnim.trailLength} display={v => Math.round(v*100) + '%'} onChange={v => onChartAnim({ trailLength: v, preset: 'custom' })} />
        <CheckRow label="Dot Pulse"   checked={chartAnim.dotPulse}  onChange={v => onChartAnim({ dotPulse: v, preset: 'custom' })} />
      </Advanced>

      {/* ── VS Mode ── */}
      <SectionLabel>VS Mode</SectionLabel>

      <CheckRow label="Enable VS Mode" checked={vs.enabled} onChange={v => onVs({ enabled: v })} />

      {vs.enabled && <>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-neutral-500">Right Token</span>
          <ToggleGroup
            options={VS_TOKEN_OPTS}
            value={vs.rightTokenId}
            onChange={handleVsTokenChange}
            cols={3}
          />
        </div>

        <div className="flex gap-1.5">
          <select
            value={vs.rightCoinId}
            onChange={e => onVs({ rightCoinId: e.target.value })}
            className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm font-mono rounded px-2 py-1.5 outline-none"
          >
            {TOKEN_PRESETS.filter(t => t.coinGeckoId).map(t => (
              <option key={t.id} value={t.coinGeckoId}>{t.label} ({t.coinGeckoId})</option>
            ))}
          </select>
          <DimBtn onClick={() => fetchVsChart(vs.rightCoinId, '1d')} disabled={vsFetching}>
            {vsFetching ? '…' : 'Fetch'}
          </DimBtn>
        </div>

        {vsFetchStatus && (
          <p className={`text-sm font-mono ${vsFetchStatus.ok ? 'text-emerald-400' : 'text-red-400'}`}>
            {vsFetchStatus.msg}
          </p>
        )}

        <Advanced>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-500">Divider Label</span>
            <input type="text" value={vs.label} onChange={e => onVs({ label: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm font-mono rounded px-2 py-1.5 outline-none focus:border-amber-600" />
          </div>
          <ColorRow label="Divider Color" value={vs.dividerColor} onChange={v => onVs({ dividerColor: v })} />
        </Advanced>
      </>}

    </div>
  )
}
