import type { OverlaySettings, ChartSettings, ChartData, ConfettiSettings, ChartAnimSettings, VsSettings } from '../types'
import { drawChart, priceChange, formatPrice } from './chartUtils'
import { drawAnimatedChart, computeProgress } from './chartAnim'
import { drawParticles, updateParticles, spawnParticles, type Particle } from './confetti'
import { TF_OPTIONS } from './presets'

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
}

// ─── Mutable animation state (lives in CoinCanvas ref) ────────────
export interface OverlayAnimState {
  particles: Particle[]
  chartElapsed: number     // seconds since chart anim started
  chartStarted: boolean
  lastFrameTime: number
  burstDone: boolean
}

export function createAnimState(): OverlayAnimState {
  return { particles: [], chartElapsed: 0, chartStarted: false, lastFrameTime: performance.now(), burstDone: false }
}

// ─── Main draw function ───────────────────────────────────────────
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  overlay: OverlaySettings,
  chart: ChartSettings,
  chartData: ChartData | null,
  confetti: ConfettiSettings,
  chartAnim: ChartAnimSettings,
  animState: OverlayAnimState,
  vs?: { rightData: ChartData | null; settings: VsSettings },
) {
  const now = performance.now()
  const dt  = Math.min((now - animState.lastFrameTime) / 1000, 0.1)
  animState.lastFrameTime = now

  const scale  = W / 800
  const pad    = 28 * scale
  const barH   = H * 0.30
  const barTop = H - barH

  const fontFam = `'${overlay.font}', 'Courier New', monospace`

  // ── Chart anim progress ──
  if (chart.enabled && chartData) {
    if (!animState.chartStarted) {
      animState.chartElapsed = 0
      animState.chartStarted = true
    }
    animState.chartElapsed += dt
  } else {
    animState.chartStarted = false
    animState.chartElapsed = 0
  }
  const chartProgress = chart.enabled && chartData
    ? computeProgress(animState.chartElapsed, chartAnim)
    : 1

  // ── Confetti ──
  if (confetti.enabled) {
    if (confetti.burst && !animState.burstDone) {
      animState.particles = spawnParticles(W, H, confetti, animState.particles, true)
      animState.burstDone = true
    } else if (!confetti.burst) {
      animState.particles = spawnParticles(W, H, confetti, animState.particles, false)
    }
    animState.particles = updateParticles(animState.particles, confetti.gravity, dt)
  } else {
    animState.particles  = []
    animState.burstDone  = false
  }

  // ── BG chart (behind everything) ──
  if (chart.enabled && chartData && chart.mode === 'bg') {
    drawChartAnimated(ctx, W, H, chartData, chart, chartAnim, chartProgress, overlay.font, barH)
  }

  // ── Gradient bar ──
  const grad = ctx.createLinearGradient(0, barTop, 0, H)
  grad.addColorStop(0,   `rgba(0,0,0,0)`)
  grad.addColorStop(0.4, `rgba(0,0,0,${overlay.bgAlpha})`)
  grad.addColorStop(1,   `rgba(0,0,0,${Math.min(overlay.bgAlpha + 0.35, 0.95)})`)
  ctx.fillStyle = grad; ctx.fillRect(0, barTop, W, barH)

  // ── Text elements ──
  const tokenY   = barTop + 56 * scale
  const taglineY = barTop + 82 * scale
  const dividerY = barTop + 100 * scale
  const badgeY   = dividerY + 12 * scale

  ctx.save()
  ctx.font = `bold ${Math.round(52 * scale)}px ${fontFam}`
  ctx.fillStyle = overlay.textColor; ctx.shadowColor = overlay.accent; ctx.shadowBlur = 18 * scale
  ctx.fillText(overlay.tokenName, pad, tokenY)
  ctx.restore()

  ctx.save()
  ctx.font = `${Math.round(17 * scale)}px ${fontFam}`
  ctx.fillStyle = overlay.accent
  ctx.fillText(overlay.tagline.toUpperCase(), pad, taglineY)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = overlay.accent; ctx.lineWidth = Math.max(1, 1 * scale); ctx.globalAlpha = 0.5
  ctx.beginPath(); ctx.moveTo(pad, dividerY); ctx.lineTo(W - pad, dividerY); ctx.stroke()
  ctx.restore()

  if (overlay.chainBadge) {
    const bPad = 10 * scale; const bH = 26 * scale
    ctx.save()
    ctx.font = `bold ${Math.round(13 * scale)}px ${fontFam}`
    const tw = ctx.measureText(overlay.chainBadge.toUpperCase()).width
    const bW = tw + bPad * 2.5
    ctx.fillStyle = overlay.badgeBg
    roundRect(ctx, pad, badgeY, bW, bH, 4 * scale); ctx.fill()
    ctx.fillStyle = '#000'
    ctx.fillText(overlay.chainBadge.toUpperCase(), pad + bPad, badgeY + bH - 8 * scale)
    ctx.restore()
  }

  // ── Side chart (over gradient bar) ──
  if (chart.enabled && chartData && chart.mode === 'side') {
    drawChartAnimated(ctx, W, H, chartData, chart, chartAnim, chartProgress, overlay.font, barH)
  }

  // ── VS divider ──
  if (vs?.settings.enabled) {
    drawVsDivider(ctx, W, H, vs.settings, scale, fontFam)
  }

  // ── Confetti on top of everything ──
  if (confetti.enabled && animState.particles.length > 0) {
    drawParticles(ctx, animState.particles, confetti.fadeOut)
  }
}

// ─── Animated chart wrapper ───────────────────────────────────────
function drawChartAnimated(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  data: ChartData,
  chart: ChartSettings,
  anim: ChartAnimSettings,
  progress: number,
  font: string,
  overlayBarH: number,
) {
  if (progress >= 1) {
    // Full draw — use original drawChart for pixel-perfect result
    drawChart(ctx, W, H, data, chart, font, overlayBarH)
    return
  }

  const vals   = data.prices.map(p => p[1])
  const minV   = Math.min(...vals)
  const maxV   = Math.max(...vals)
  const pct    = priceChange(data.prices)
  const isUp   = pct >= 0
  const lineCol = isUp ? '#44cc88' : '#ff4466'
  const fillCol = isUp ? 'rgba(68,204,136,' : 'rgba(255,68,102,'
  const scale  = W / 800
  const isGlitch = anim.preset === 'glitch'

  if (chart.mode === 'bg') {
    const padX = W * 0.07; const padT = H * 0.12
    const padB = overlayBarH + H * 0.04
    const cW = W - padX * 2; const cH = H - padT - padB

    drawAnimatedChart(ctx, W, H, vals, minV, maxV, progress, progress, lineCol, fillCol, anim,
      padX, padT, cW, cH, scale, isGlitch)

    // Price label fades in with chart
    if (chart.showPrice && progress > 0.6) {
      const a = (progress - 0.6) / 0.4
      const barTop = H - overlayBarH
      const sign = pct >= 0 ? '+' : ''
      const tfLabel = TF_OPTIONS.find(t => t.value === data.tf)?.label ?? ''
      const fontFam = `'${font}', 'Courier New', monospace`
      ctx.save()
      ctx.globalAlpha = a
      ctx.textAlign   = 'right'
      ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 6 * scale
      ctx.font = `bold ${Math.round(22 * scale)}px ${fontFam}`
      ctx.fillStyle = '#fff'
      ctx.fillText(formatPrice(vals.at(-1)!), W - 28*scale, barTop - 28*scale)
      ctx.font = `${Math.round(15 * scale)}px ${fontFam}`
      ctx.fillStyle = lineCol
      ctx.fillText(`${sign}${pct.toFixed(2)}%  ${tfLabel}`, W - 28*scale, barTop - 10*scale)
      ctx.textAlign = 'left'; ctx.restore()
    }
  } else {
    // side mode — just use full draw, animation is less meaningful here
    drawChart(ctx, W, H, data, chart, font, overlayBarH)
  }
}

// ─── VS divider ───────────────────────────────────────────────────
function drawVsDivider(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  vs: import('../types').VsSettings,
  scale: number,
  fontFam: string,
) {
  const cx = W / 2
  // Vertical line
  ctx.save()
  ctx.strokeStyle = vs.dividerColor
  ctx.lineWidth   = 1 * scale
  ctx.globalAlpha = 0.4
  ctx.setLineDash([6 * scale, 6 * scale])
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H * 0.75); ctx.stroke()
  ctx.restore()

  // VS badge
  const label = vs.label || 'VS'
  const bH    = 36 * scale
  const bW    = 48 * scale
  const bY    = H * 0.38

  ctx.save()
  ctx.fillStyle   = vs.dividerColor
  ctx.shadowColor = vs.dividerColor
  ctx.shadowBlur  = 12 * scale
  roundRect(ctx, cx - bW/2, bY - bH/2, bW, bH, 6*scale); ctx.fill()
  ctx.font      = `bold ${Math.round(18 * scale)}px ${fontFam}`
  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'
  ctx.fillText(label, cx, bY + 6*scale)
  ctx.restore()
}
