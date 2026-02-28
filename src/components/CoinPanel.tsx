import { SectionLabel, Slider, ColorRow, Advanced, ToggleGroup, Select } from './ui'
import type { CoinSettings, LogoSettings, LightSettings, RotationMode } from '../types'

const ROT_MODES: { value: RotationMode; label: string }[] = [
  { value: 'y',    label: 'Y Spin'  },
  { value: 'x',    label: 'X Flip'  },
  { value: 'z',    label: 'Z Roll'  },
  { value: 'xy',   label: 'Tumble'  },
  { value: 'drag', label: 'Drag'    },
]

interface Props {
  coin: CoinSettings
  logo: LogoSettings
  light: LightSettings
  rotMode: RotationMode
  rotSpeed: number
  tiltX: number
  bgColor: string
  onCoin: (c: CoinSettings) => void
  onLogo: (l: LogoSettings) => void
  onLight: (l: LightSettings) => void
  onRotMode: (m: RotationMode) => void
  onRotSpeed: (v: number) => void
  onTiltX: (v: number) => void
  onBgColor: (v: string) => void
  onBgImg: (img: HTMLImageElement | null) => void
}

export function CoinPanel({ coin, logo, light, rotMode, rotSpeed, tiltX, bgColor, onCoin, onLogo, onLight, onRotMode, onRotSpeed, onTiltX, onBgColor, onBgImg }: Props) {
  const c = (k: keyof CoinSettings) => (v: number | string) => onCoin({ ...coin, [k]: v })
  const l = (k: keyof LogoSettings) => (v: number | string) => onLogo({ ...logo, [k]: v })
  const li = (k: keyof LightSettings) => (v: number | string) => onLight({ ...light, [k]: v })

  return (
    <div className="flex flex-col gap-4">
      {/* ROTATION */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Rotation</SectionLabel>
        <ToggleGroup options={ROT_MODES} value={rotMode} onChange={onRotMode} cols={3} />
        <Slider label="Speed"  value={rotSpeed} min={0} max={5}    step={0.05} display={v => v.toFixed(2)} onChange={onRotSpeed} />
        <Slider label="Tilt"   value={tiltX}    min={-180} max={180} step={1}  display={v => v + '°'} onChange={onTiltX} />
      </div>

      {/* LIGHTING */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Lighting</SectionLabel>
        <ColorRow label="Hue" value={light.hue} onChange={li('hue')} />
        <Slider label="Key"      value={light.keyIntensity} min={0} max={6}   step={0.1}  display={v => v.toFixed(1)} onChange={li('keyIntensity')} />
        <Slider label="Ambient"  value={light.ambIntensity} min={0} max={2}   step={0.05} display={v => v.toFixed(2)} onChange={li('ambIntensity')} />
        <Slider label="Rim"      value={light.rimIntensity} min={0} max={8}   step={0.1}  display={v => v.toFixed(1)} onChange={li('rimIntensity')} />
        <Slider label="Exposure" value={light.exposure}     min={0.5} max={3} step={0.05} display={v => v.toFixed(2)} onChange={li('exposure')} />
      </div>

      {/* COIN */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Coin Material</SectionLabel>
        <ColorRow label="Color" value={coin.color} onChange={c('color')} />
        <Slider label="Metalness" value={coin.metalness} min={0} max={1}    step={0.01} display={v => v.toFixed(2)} onChange={c('metalness')} />
        <Slider label="Roughness" value={coin.roughness} min={0} max={1}    step={0.01} display={v => v.toFixed(2)} onChange={c('roughness')} />
        <Advanced>
          <Slider label="Opacity"   value={coin.opacity}   min={0} max={1}    step={0.01} display={v => v.toFixed(2)} onChange={c('opacity')} />
          <Slider label="Thickness" value={coin.thickness} min={0.04} max={0.5} step={0.005} display={v => v.toFixed(3)} onChange={c('thickness')} />
          <Slider label="Rim Width" value={coin.rimWidth}  min={0.02} max={0.25} step={0.005} display={v => v.toFixed(3)} onChange={c('rimWidth')} />
          <Slider label="Rim Step"  value={coin.rimStep}   min={0.005} max={0.06} step={0.002} display={v => v.toFixed(3)} onChange={c('rimStep')} />
        </Advanced>
      </div>

      {/* LOGO */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Logo SVG</SectionLabel>
        <textarea
          value={logo.svg}
          onChange={e => onLogo({ ...logo, svg: e.target.value })}
          placeholder='Paste <svg>…</svg> or path d="…"'
          className="w-full h-16 bg-neutral-950 border border-neutral-800 text-neutral-300 text-sm px-2 py-1.5 rounded resize-none font-mono outline-none focus:border-amber-600"
        />
        <ColorRow label="Color" value={logo.color} onChange={l('color')} />
        <Slider label="Scale" value={logo.scale} min={0.1} max={2.5} step={0.05} display={v => v.toFixed(1)} onChange={l('scale')} />
        <Advanced>
          <Slider label="Depth"      value={logo.depth}     min={0.005} max={0.4}  step={0.005} display={v => v.toFixed(3)} onChange={l('depth')} />
          <Slider label="Bevel"      value={logo.bevel}     min={0}     max={0.06} step={0.001} display={v => v.toFixed(3)} onChange={l('bevel')} />
          <Slider label="Bevel Segs" value={logo.bevelSegs} min={0}     max={8}    step={1}     display={v => String(Math.round(v))} onChange={l('bevelSegs')} />
          <Slider label="Metalness"  value={logo.metal}     min={0}     max={1}    step={0.01}  display={v => v.toFixed(2)} onChange={l('metal')} />
          <Slider label="Roughness"  value={logo.rough}     min={0}     max={1}    step={0.01}  display={v => v.toFixed(2)} onChange={l('rough')} />
          <Slider label="Smooth"     value={logo.smooth}    min={8}     max={400}  step={4}     display={v => String(Math.round(v))} onChange={l('smooth')} />
        </Advanced>
      </div>

      {/* BACKGROUND */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Background</SectionLabel>
        <ColorRow label="Color" value={bgColor} onChange={onBgColor} />
        <label className="text-sm text-center border border-dashed border-neutral-700 text-neutral-500 rounded py-2 cursor-pointer hover:border-neutral-500 hover:text-neutral-300 transition-colors">
          ⬆ Upload Image
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            const file = e.target.files?.[0]; if (!file) return
            const url = URL.createObjectURL(file)
            const img = new Image(); img.src = url; img.onload = () => onBgImg(img)
          }} />
        </label>
        <button onClick={() => onBgImg(null)}
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer">
          ✕ Clear image
        </button>
      </div>
    </div>
  )
}
