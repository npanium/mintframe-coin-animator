import type { PostFX, ColorGrade } from '../types'
import { SectionLabel, Slider, ColorRow, FxToggle, Advanced } from './ui'

interface Props {
  fx: PostFX
  grade: ColorGrade
  onFx: (f: Partial<PostFX>) => void
  onGrade: (g: Partial<ColorGrade>) => void
  onResetGrade: () => void
}

export function PanelFX({ fx, grade, onFx, onGrade, onResetGrade }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Post FX</SectionLabel>

      <div className="grid grid-cols-2 gap-1.5">
        <FxToggle label="Glow"     active={fx.glow}     onClick={() => onFx({ glow:     !fx.glow })} />
        <FxToggle label="Outline"  active={fx.outline}  onClick={() => onFx({ outline:  !fx.outline })} />
        <FxToggle label="Grain"    active={fx.grain}    onClick={() => onFx({ grain:    !fx.grain })} />
        <FxToggle label="Vignette" active={fx.vignette} onClick={() => onFx({ vignette: !fx.vignette })} />
      </div>

      {fx.glow    && <Slider label="Glow Str."  min={0.2} max={3} step={0.1} value={fx.glowStr}      display={v => v.toFixed(1)} onChange={v => onFx({ glowStr: v })} />}
      {fx.outline && <>
        <Slider label="Outline W." min={0.5} max={8} step={0.5} value={fx.outlineW}     display={v => v.toFixed(1)} onChange={v => onFx({ outlineW: v })} />
        <ColorRow label="Outline Color" value={fx.outlineColor}   onChange={v => onFx({ outlineColor: v })} />
        <Slider label="Opacity"   min={0} max={1} step={0.05} value={fx.outlineOpacity} display={v => v.toFixed(2)} onChange={v => onFx({ outlineOpacity: v })} />
      </>}
      {fx.grain   && <Slider label="Grain Amt." min={0.01} max={0.2} step={0.01} value={fx.grainAmt} display={v => v.toFixed(2)} onChange={v => onFx({ grainAmt: v })} />}

      <SectionLabel>Color Grade</SectionLabel>
      <Slider label="Hue"        min={-180} max={180} step={1}   value={grade.hue} display={v => Math.round(v) + '°'} onChange={v => onGrade({ hue: v })} />
      <Slider label="Saturation" min={0}    max={300}  step={5}   value={grade.sat} display={v => Math.round(v) + '%'} onChange={v => onGrade({ sat: v })} />
      <Slider label="Brightness" min={50}   max={200}  step={5}   value={grade.bri} display={v => Math.round(v) + '%'} onChange={v => onGrade({ bri: v })} />
      <Slider label="Contrast"   min={50}   max={250}  step={5}   value={grade.con} display={v => Math.round(v) + '%'} onChange={v => onGrade({ con: v })} />
      <button onClick={onResetGrade} className="text-sm text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors text-left">
        ↺ Reset grade
      </button>

      <Advanced>
        <p className="text-sm text-neutral-500">Color grade applied as CSS filter on live preview. Baked via offscreen canvas on export.</p>
      </Advanced>
    </div>
  )
}
