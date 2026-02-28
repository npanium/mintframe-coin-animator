import { useState, useRef } from 'react'
import { SectionLabel, ToggleGroup, CheckRow, DimBtn, PrimaryBtn } from './ui'
import type { CoinEngine } from '../lib/CoinEngine'
import { drawOverlay, createAnimState } from '../lib/overlayUtils'
import { defaultConfetti } from '../lib/confetti'
import { defaultChartAnim } from '../lib/chartAnim'
import type { PostFX, ColorGrade, OverlaySettings, ChartSettings, ChartData, AspectRatio, ExportResolution } from '../types'
import { EXPORT_RESOLUTIONS, ASPECT_RATIOS } from '../lib/presets'

interface Props {
  engine: CoinEngine | null
  fx: PostFX
  grade: ColorGrade
  bgColor: string
  bgImg: HTMLImageElement | null
  overlay: OverlaySettings
  chart: ChartSettings
  chartData: ChartData | null
}

function downloadCanvas(canvas: HTMLCanvasElement, name: string) {
  canvas.toBlob(blob => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name; a.click()
    URL.revokeObjectURL(a.href)
  }, 'image/png')
}

function getExportDims(aspect: AspectRatio, res: ExportResolution): [number, number] {
  const base = parseInt(res)
  if (aspect === '1:1')  return [base, base]
  if (aspect === '9:16') return [base, Math.round(base * 16 / 9)]
  return [Math.round(base * 16 / 9), base]
}

export function ExportPanel({ engine, fx, grade, bgColor, bgImg, overlay, chart, chartData }: Props) {
  const [transparent, setTransparent] = useState(false)
  const [resolution, setResolution]   = useState<ExportResolution>('1080')
  const [aspect, setAspect]           = useState<AspectRatio>('1:1')
  const [seqFrames, setSeqFrames]     = useState(48)
  const [status, setStatus]           = useState('')
  const [recording, setRecording]     = useState(false)
  const [recDuration, setRecDuration] = useState(3)
  const recRef = useRef<MediaRecorder | null>(null)

  const setMsg = (m: string, ms = 3000) => { setStatus(m); if (ms) setTimeout(() => setStatus(''), ms) }

  const savePng = () => {
    if (!engine) return
    const snap = engine.snapshot(transparent, bgColor, bgImg, fx, grade)
    downloadCanvas(snap, transparent ? 'coin_transparent.png' : 'coin.png')
    setMsg('PNG saved ✓')
  }

  const savePost = () => {
    if (!engine) return
    const [W, H] = getExportDims(overlay.aspect, resolution)
    const out = Object.assign(document.createElement('canvas'), { width: W, height: H })
    const ctx = out.getContext('2d')!
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H)
    if (bgImg) ctx.drawImage(bgImg, 0, 0, W, H)
    // Coin centered
    const src = engine.glCanvas
    const ar = src.width / src.height
    const fitW = Math.min(W, H * ar) * 0.75
    const fitH = fitW / ar
    ctx.drawImage(src, (W - fitW) / 2, (H - fitH) / 2 - H * 0.04, fitW, fitH)
    // Overlay
    if (overlay.enabled) drawOverlay(ctx, W, H, overlay, chart, chartData, defaultConfetti(), { ...defaultChartAnim(), duration: 0 }, createAnimState())
    downloadCanvas(out, `coin_post_${overlay.aspect.replace(':', 'x')}_${resolution}p.png`)
    setMsg('Post saved ✓')
  }

  const savePngSeq = async () => {
    if (!engine) return
    const n = seqFrames
    const blobs: Blob[] = []
    setMsg(`Rendering 0/${n}…`, 0)
    const savedAngle = (engine as unknown as { autoAngle: number }).autoAngle
    for (let i = 0; i < n; i++) {
      ;(engine as unknown as { autoAngle: number }).autoAngle = (i / n) * Math.PI * 2
      engine.renderer.render(engine.scene, engine.camera)
      const snap = engine.snapshot(transparent, bgColor, bgImg, fx, grade)
      await new Promise<void>(res => snap.toBlob(b => { if (b) blobs.push(b); res() }, 'image/png'))
      setMsg(`Rendering ${i + 1}/${n}…`, 0)
      await new Promise(r => requestAnimationFrame(r))
    }
    ;(engine as unknown as { autoAngle: number }).autoAngle = savedAngle
    for (let i = 0; i < blobs.length; i++) {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blobs[i])
      a.download = `coin_${String(i).padStart(4, '0')}.png`; a.click()
      URL.revokeObjectURL(a.href)
      await new Promise(r => setTimeout(r, 60))
    }
    setMsg(`${n} frames saved ✓`)
  }

  const toggleRecord = () => {
    if (recording) { recRef.current?.stop(); return }
    if (!engine) return
    const fxCanvas = engine.fxCanvas
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
    const mr = new MediaRecorder(fxCanvas.captureStream(60), { mimeType, videoBitsPerSecond: 12_000_000 })
    const chunks: Blob[] = []
    mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
    mr.onstop = () => {
      setRecording(false)
      const blob = new Blob(chunks, { type: mimeType })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'coin.webm'; a.click()
      URL.revokeObjectURL(a.href); setMsg('WebM saved ✓')
    }
    mr.start(100); recRef.current = mr; setRecording(true)
    setMsg(`Recording ${recDuration}s…`, 0)
    setTimeout(() => { if (mr.state !== 'inactive') mr.stop() }, recDuration * 1000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <SectionLabel>Export Settings</SectionLabel>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-500">Resolution</span>
          <ToggleGroup<ExportResolution>
            options={EXPORT_RESOLUTIONS.map(r => ({ value: r.value as ExportResolution, label: r.label }))}
            value={resolution} onChange={setResolution} cols={3}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-500">Aspect (for Post PNG)</span>
          <ToggleGroup<AspectRatio>
            options={ASPECT_RATIOS.map(a => ({ value: a.value as AspectRatio, label: `${a.label} ${a.hint}` }))}
            value={aspect} onChange={setAspect} cols={3}
          />
        </div>

        <CheckRow label="Transparent Background" checked={transparent} onChange={setTransparent} />
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Save</SectionLabel>

        <div className="flex gap-2">
          <DimBtn onClick={savePng}>📷 PNG Frame</DimBtn>
          <DimBtn onClick={savePngSeq}>🎞 PNG Seq ({seqFrames}f)</DimBtn>
        </div>

        {overlay.enabled && (
          <PrimaryBtn onClick={savePost}>⬇ Save Marketing Post</PrimaryBtn>
        )}

        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>Duration</span>
            <input type="range" min={1} max={20} step={1} value={recDuration}
              onChange={e => setRecDuration(parseInt(e.target.value))}
              className="flex-1 accent-red-500 h-0.5 cursor-pointer" />
            <span className="w-8 text-right text-neutral-200">{recDuration}s</span>
          </div>
          <button onClick={toggleRecord}
            className={`w-full py-2 text-sm font-bold tracking-widest uppercase rounded border transition-all cursor-pointer ${
              recording
                ? 'border-red-500 bg-red-500 text-white animate-pulse'
                : 'border-red-900 bg-red-950 text-red-400 hover:bg-red-500 hover:text-white'
            }`}>
            {recording ? '⏹ Stop Recording' : '⏺ Record WebM'}
          </button>
        </div>

        {status && <p className="text-sm text-center text-neutral-400">{status}</p>}
        <p className="text-xs text-neutral-600">ffmpeg -i coin.webm -c:v libx264 coin.mp4</p>
      </div>
    </div>
  )
}
