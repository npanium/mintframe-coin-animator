import { SectionLabel, Slider, ColorRow, FxToggle, Advanced } from './ui'
import type { PostFX, ColorGrade } from '../types'

interface Props {
  fx: PostFX
  grade: ColorGrade
  onFx: (fx: PostFX) => void
  onGrade: (g: ColorGrade) => void
}

export function FxPanel({ fx, grade, onFx, onGrade }: Props) {
  const toggle = (k: 'glow' | 'outline' | 'grain' | 'vignette') => onFx({ ...fx, [k]: !fx[k] })
  const f = (k: keyof PostFX) => (v: number | string) => onFx({ ...fx, [k]: v })
  const g = (k: keyof ColorGrade) => (v: number) => onGrade({ ...grade, [k]: v })

  const needGrade = grade.hue !== 0 || grade.sat !== 100 || grade.bri !== 100 || grade.con !== 100

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <SectionLabel>Post FX</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          <FxToggle label="✦ Glow"      active={fx.glow}     onClick={() => toggle('glow')} />
          <FxToggle label="◻ Outline"   active={fx.outline}  onClick={() => toggle('outline')} />
          <FxToggle label="⣿ Grain"     active={fx.grain}    onClick={() => toggle('grain')} />
          <FxToggle label="◉ Vignette"  active={fx.vignette} onClick={() => toggle('vignette')} />
        </div>
        <Advanced>
          <Slider label="Glow Str"     value={fx.glowStr}       min={0.5} max={4}   step={0.1}  display={v => v.toFixed(1)} onChange={f('glowStr')} />
          <Slider label="Outline W"    value={fx.outlineW}      min={0.5} max={8}   step={0.5}  display={v => v.toFixed(1)} onChange={f('outlineW')} />
          <ColorRow label="Outline Color" value={fx.outlineColor} onChange={f('outlineColor')} />
          <Slider label="Outline Opacity" value={fx.outlineOpacity} min={0.1} max={1} step={0.05} display={v => v.toFixed(2)} onChange={f('outlineOpacity')} />
          <Slider label="Grain Amt"    value={fx.grainAmt}      min={0.01} max={0.2} step={0.01} display={v => v.toFixed(2)} onChange={f('grainAmt')} />
        </Advanced>
      </div>

      <div className="flex flex-col gap-3">
        <SectionLabel>Color Grade</SectionLabel>
        <Slider label="Hue"        value={grade.hue} min={-180} max={180} step={1}  display={v => v + '°'} onChange={g('hue')} />
        <Slider label="Saturation" value={grade.sat} min={0}    max={300} step={1}  display={v => v + '%'} onChange={g('sat')} />
        <Slider label="Brightness" value={grade.bri} min={50}   max={200} step={1}  display={v => v + '%'} onChange={g('bri')} />
        <Slider label="Contrast"   value={grade.con} min={50}   max={250} step={1}  display={v => v + '%'} onChange={g('con')} />
        {needGrade && (
          <button onClick={() => onGrade({ hue: 0, sat: 100, bri: 100, con: 100 })}
            className="text-sm text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors text-left">
            ↺ Reset grade
          </button>
        )}
      </div>
    </div>
  )
}
