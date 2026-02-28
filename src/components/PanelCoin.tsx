import type { CoinSettings, RenderStyle } from '../types'
import { MATERIAL_PRESETS } from '../lib/presets'
import { SectionLabel, Slider, ColorRow, Advanced, ToggleGroup } from './ui'

interface Props {
  coin: CoinSettings
  renderStyle: RenderStyle
  materialPreset: string
  onChange: (c: Partial<CoinSettings>) => void
  onRenderStyle: (s: RenderStyle) => void
  onMaterialPreset: (id: string) => void
}

const RS_OPTIONS: { value: RenderStyle; label: string }[] = [
  { value: 'pbr',  label: 'PBR' },
  { value: 'flat', label: 'Flat' },
  { value: 'cel',  label: 'Cel' },
  { value: 'clay', label: 'Clay' },
]

export function PanelCoin({ coin, renderStyle, materialPreset, onChange, onRenderStyle, onMaterialPreset }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Material</SectionLabel>

      {/* Material presets */}
      <div className="grid grid-cols-5 gap-1">
        {MATERIAL_PRESETS.map(p => (
          <button key={p.id} onClick={() => onMaterialPreset(p.id)}
            className={`py-1.5 text-sm rounded border transition-all cursor-pointer
              ${materialPreset === p.id
                ? 'border-amber-500 text-amber-400 bg-amber-950'
                : 'border-neutral-800 text-neutral-500 bg-neutral-950 hover:border-neutral-600 hover:text-neutral-300'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Render style */}
      <ToggleGroup options={RS_OPTIONS} value={renderStyle} onChange={onRenderStyle} cols={4} />

      <Advanced>
        <ColorRow label="Coin Color" value={coin.color} onChange={v => onChange({ color: v })} />
        <Slider label="Metalness" min={0} max={1} step={0.01} value={coin.metalness} display={v => v.toFixed(2)} onChange={v => onChange({ metalness: v })} />
        <Slider label="Roughness" min={0} max={1} step={0.01} value={coin.roughness} display={v => v.toFixed(2)} onChange={v => onChange({ roughness: v })} />
        <Slider label="Opacity"   min={0} max={1} step={0.01} value={coin.opacity}   display={v => v.toFixed(2)} onChange={v => onChange({ opacity: v })} />
        <Slider label="Thickness" min={0.04} max={0.40} step={0.01} value={coin.thickness} display={v => v.toFixed(2)} onChange={v => onChange({ thickness: v })} />
        <Slider label="Rim Width" min={0.01} max={0.25} step={0.005} value={coin.rimWidth} display={v => v.toFixed(3)} onChange={v => onChange({ rimWidth: v })} />
        <Slider label="Rim Step"  min={0.002} max={0.05} step={0.001} value={coin.rimStep}  display={v => v.toFixed(3)} onChange={v => onChange({ rimStep: v })} />
      </Advanced>
    </div>
  )
}
