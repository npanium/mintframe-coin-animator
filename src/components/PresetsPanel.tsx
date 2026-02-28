import { TOKEN_PRESETS, MATERIAL_PRESETS } from '../lib/presets'
import { SectionLabel, ToggleGroup, Advanced } from './ui'
import type { RenderStyle } from '../types'

interface Props {
  tokenPreset: string
  materialPreset: string
  renderStyle: RenderStyle
  onTokenPreset: (id: string) => void
  onMaterialPreset: (id: string) => void
  onRenderStyle: (s: RenderStyle) => void
}

const RENDER_STYLES = [
  { value: 'pbr'  as RenderStyle, label: 'Photorealistic' },
  { value: 'flat' as RenderStyle, label: 'Flat' },
  { value: 'cel'  as RenderStyle, label: 'Cel Shaded' },
  { value: 'clay' as RenderStyle, label: 'Clay' },
]

export function PresetsPanel({ tokenPreset, materialPreset, renderStyle, onTokenPreset, onMaterialPreset, onRenderStyle }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Token Presets</SectionLabel>
      <div className="grid grid-cols-2 gap-1.5">
        {TOKEN_PRESETS.map(t => (
          <button key={t.id} onClick={() => onTokenPreset(t.id)}
            className={`flex flex-col items-start px-3 py-2 rounded border text-left transition-all cursor-pointer ${
              tokenPreset === t.id
                ? 'border-amber-500 bg-amber-950 text-amber-300'
                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
            }`}>
            <span className="text-sm font-bold">{t.ticker}</span>
            <span className="text-xs text-neutral-500 truncate w-full">{t.label}</span>
          </button>
        ))}
      </div>

      <Advanced>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-500">Material</span>
          <ToggleGroup
            options={MATERIAL_PRESETS.map(m => ({ value: m.id, label: m.label }))}
            value={materialPreset}
            onChange={onMaterialPreset}
            cols={3}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-500">Render Style</span>
          <ToggleGroup
            options={RENDER_STYLES}
            value={renderStyle}
            onChange={onRenderStyle}
            cols={2}
          />
        </div>
      </Advanced>
    </div>
  )
}
