import { useEffect, useRef, useCallback } from 'react'
import { CoinEngine } from '../lib/CoinEngine'
import { drawOverlay, createAnimState, type OverlayAnimState } from '../lib/overlayUtils'
import type {
  CoinSettings, LogoSettings, LightSettings, PostFX, ColorGrade,
  RenderStyle, RotationMode, OverlaySettings, ChartSettings, ChartData,
  ConfettiSettings, ChartAnimSettings, VsSettings,
} from '../types'

interface Props {
  coin: CoinSettings
  logo: LogoSettings
  light: LightSettings
  fx: PostFX
  grade: ColorGrade
  renderStyle: RenderStyle
  rotMode: RotationMode
  rotSpeed: number
  tiltX: number
  bgColor: string
  bgImg: HTMLImageElement | null
  overlay: OverlaySettings
  chart: ChartSettings
  chartData: ChartData | null
  confetti: ConfettiSettings
  chartAnim: ChartAnimSettings
  vs: VsSettings
  vsChartData: ChartData | null
  onEngineReady?: (engine: CoinEngine) => void
}

const PREVIEW_W = 480
const PREVIEW_H = 480

export function CoinCanvas({
  coin, logo, light, fx, grade, renderStyle, rotMode, rotSpeed, tiltX,
  bgColor, bgImg, overlay, chart, chartData, confetti, chartAnim, vs, vsChartData,
  onEngineReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const glCanvasRef  = useRef<HTMLCanvasElement>(null)
  const fxCanvasRef  = useRef<HTMLCanvasElement>(null)
  const mCanvasRef   = useRef<HTMLCanvasElement>(null)
  const engineRef    = useRef<CoinEngine | null>(null)
  const animStateRef = useRef<OverlayAnimState>(createAnimState())

  // Keep all overlay-related props in a ref so the RAF loop always sees fresh values
  const overlayRef = useRef({ overlay, chart, chartData, confetti, chartAnim, vs, vsChartData })
  overlayRef.current = { overlay, chart, chartData, confetti, chartAnim, vs, vsChartData }

  // Init engine once
  useEffect(() => {
    const gl  = glCanvasRef.current!
    const fxC = fxCanvasRef.current!
    const engine = new CoinEngine(gl, fxC)
    engineRef.current = engine
    engine.resize(PREVIEW_W, PREVIEW_H)
    engine.attachDrag(containerRef.current!)
    onEngineReady?.(engine)
    engine.start()
    return () => { engine.dispose() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Post-FX + overlay RAF loop
  useEffect(() => {
    let rafId = 0
    const fxC  = fxCanvasRef.current!
    const mCv  = mCanvasRef.current!
    const fxCtx = fxC.getContext('2d')!
    const mCtx  = mCv.getContext('2d')!

    const loop = () => {
      rafId = requestAnimationFrame(loop)
      const engine = engineRef.current; if (!engine) return
      engine.applyPostFX(fxCtx, fxC.width, fxC.height, fx, bgColor, bgImg, grade)

      mCtx.clearRect(0, 0, mCv.width, mCv.height)
      const { overlay: ov, chart: ch, chartData: cd, confetti: cf, chartAnim: ca, vs: v, vsChartData: vcd } = overlayRef.current
      if (ov.enabled) {
        drawOverlay(mCtx, mCv.width, mCv.height, ov, ch, cd, cf, ca, animStateRef.current,
          v.enabled ? { rightData: vcd, settings: v } : undefined)
      } else if (cf.enabled) {
        // Confetti can run without overlay
        drawOverlay(mCtx, mCv.width, mCv.height,
          { ...ov, enabled: true, bgAlpha: 0, chainBadge: '', tokenName: '', tagline: '' },
          ch, null, cf, ca, animStateRef.current)
      }
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [fx, grade, bgColor, bgImg])

  useEffect(() => { engineRef.current?.applyCoinSettings(coin) }, [coin])
  useEffect(() => {
    engineRef.current?.rebuildLogo(logo.svg, logo, coin.thickness, coin.rimStep)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logo])
  useEffect(() => { engineRef.current?.applyLightSettings(light) }, [light])
  useEffect(() => { engineRef.current?.applyRenderStyle(renderStyle) }, [renderStyle])
  useEffect(() => { engineRef.current?.setRotation(rotMode, rotSpeed, tiltX) }, [rotMode, rotSpeed, tiltX])

  // Reset chart anim when chart data changes
  useEffect(() => {
    animStateRef.current.chartStarted = false
    animStateRef.current.chartElapsed = 0
  }, [chartData])

  // Reset confetti burst when re-enabled
  useEffect(() => {
    if (confetti.burst) animStateRef.current.burstDone = false
  }, [confetti.enabled, confetti.burst])

  const cursor = rotMode === 'drag' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'

  return (
    <div className="relative" style={{ width: PREVIEW_W, height: PREVIEW_H }}>
      <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${cursor}`}>
        <canvas ref={glCanvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />
        <canvas ref={fxCanvasRef} className="absolute inset-0" width={PREVIEW_W} height={PREVIEW_H} style={{ width: PREVIEW_W, height: PREVIEW_H }} />
        <canvas ref={mCanvasRef}  className="absolute inset-0 pointer-events-none" width={PREVIEW_W} height={PREVIEW_H} style={{ width: PREVIEW_W, height: PREVIEW_H }} />
      </div>
    </div>
  )
}
