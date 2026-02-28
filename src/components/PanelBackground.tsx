import { useRef } from 'react'
import { SectionLabel, ColorRow } from './ui'

interface Props {
  bgColor: string
  bgImg: HTMLImageElement | null
  onBgColor: (v: string) => void
  onBgImg: (img: HTMLImageElement | null) => void
}

export function PanelBackground({ bgColor, bgImg, onBgColor, onBgImg }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => { onBgImg(img); URL.revokeObjectURL(url) }
    img.src = url
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Background</SectionLabel>
      <ColorRow label="Color" value={bgColor} onChange={onBgColor} />
      <div className="flex gap-2 items-center">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 py-1.5 text-sm border border-dashed border-neutral-700 text-neutral-500 rounded hover:border-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer">
          {bgImg ? '📷 Change image' : '+ Upload image'}
        </button>
        {bgImg && (
          <button onClick={() => onBgImg(null)} className="text-sm text-neutral-500 hover:text-red-400 cursor-pointer transition-colors">✕</button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <p className="text-sm text-neutral-600">Tip: use #00ff00 for green screen / chroma key</p>
    </div>
  )
}
