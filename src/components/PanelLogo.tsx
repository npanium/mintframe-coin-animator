import { useState } from 'react'
import type { LogoSettings } from '../types'
import { SectionLabel, Slider, ColorRow, Advanced, DimBtn } from './ui'

interface Props {
  logo: LogoSettings
  onChange: (l: Partial<LogoSettings>) => void
}

export function PanelLogo({ logo, onChange }: Props) {
  const [draft, setDraft] = useState(logo.svg)

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Logo / Emblem</SectionLabel>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-neutral-500">SVG path or markup</span>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={'<svg>…</svg>  or  d="M…"'}
          rows={3}
          className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 text-sm font-mono rounded px-2 py-1.5 resize-none outline-none focus:border-amber-600"
        />
      </div>

      <DimBtn onClick={() => onChange({ svg: draft })}>Apply Logo</DimBtn>

      <Advanced>
        <ColorRow label="Logo Color" value={logo.color} onChange={v => onChange({ color: v })} />
        <Slider label="Scale"     min={0.2} max={3.0} step={0.05} value={logo.scale} display={v => v.toFixed(1)} onChange={v => onChange({ scale: v })} />
        <Slider label="Depth"     min={0.01} max={0.3} step={0.005} value={logo.depth} display={v => v.toFixed(3)} onChange={v => onChange({ depth: v })} />
        <Slider label="Bevel"     min={0} max={0.05} step={0.001} value={logo.bevel} display={v => v.toFixed(3)} onChange={v => onChange({ bevel: v })} />
        <Slider label="Bevel Segs" min={1} max={8} step={1} value={logo.bevelSegs} display={v => Math.round(v).toString()} onChange={v => onChange({ bevelSegs: Math.round(v) })} />
        <Slider label="Metalness" min={0} max={1} step={0.01} value={logo.metal} display={v => v.toFixed(2)} onChange={v => onChange({ metal: v })} />
        <Slider label="Roughness" min={0} max={1} step={0.01} value={logo.rough} display={v => v.toFixed(2)} onChange={v => onChange({ rough: v })} />
        <Slider label="Opacity"   min={0} max={1} step={0.01} value={logo.opacity} display={v => v.toFixed(2)} onChange={v => onChange({ opacity: v })} />
        <Slider label="Smoothing" min={20} max={200} step={10} value={logo.smooth} display={v => Math.round(v).toString()} onChange={v => onChange({ smooth: Math.round(v) })} />
      </Advanced>
    </div>
  )
}
