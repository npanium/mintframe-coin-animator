import type { ChartAnimSettings, ChartAnimPresetId } from '../types'

// ─── Presets ──────────────────────────────────────────────────────
export const CHART_ANIM_PRESETS: Record<ChartAnimPresetId, Omit<ChartAnimSettings, 'preset'>> = {
  instant: {
    duration: 0,
    easing: 'linear',
    trailGlow: false,
    trailLength: 1,
    dotPulse: false,
  },
  smooth: {
    duration: 2.5,
    easing: 'ease-out',
    trailGlow: true,
    trailLength: 0.15,
    dotPulse: true,
  },
  dramatic: {
    duration: 4.0,
    easing: 'ease-in',
    trailGlow: true,
    trailLength: 0.08,
    dotPulse: true,
  },
  glitch: {
    duration: 3.0,
    easing: 'linear',
    trailGlow: true,
    trailLength: 0.05,
    dotPulse: false,
  },
  custom: {
    duration: 2.0,
    easing: 'ease-out',
    trailGlow: true,
    trailLength: 0.12,
    dotPulse: true,
  },
}

export function defaultChartAnim(): ChartAnimSettings {
  return { preset: 'smooth', ...CHART_ANIM_PRESETS.smooth }
}

// ─── Easing functions ─────────────────────────────────────────────
function applyEasing(t: number, easing: ChartAnimSettings['easing']): number {
  switch (easing) {
    case 'ease-in':  return t * t
    case 'ease-out': return 1 - (1 - t) * (1 - t)
    case 'bounce': {
      if (t < 0.75) return (1 - Math.pow(1 - t / 0.75, 2)) * 0.75
      const t2 = (t - 0.75) / 0.25
      return 0.75 + Math.sin(t2 * Math.PI * 2) * 0.04 * (1 - t2)
    }
    default: return t
  }
}

// ─── Glitch effect helper ─────────────────────────────────────────
function glitchOffset(progress: number): number {
  // occasional horizontal jitter near the draw head
  if (Math.random() < 0.05) return (Math.random() - 0.5) * 8
  return 0
}

// ─── Draw chart with animated progress (0=nothing, 1=full) ────────
export function drawAnimatedChart(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  vals: number[],
  minV: number, maxV: number,
  progress: number,           // 0 → 1
  rawProgress: number,        // uneasedm for glitch
  lineCol: string,
  fillCol: string,
  anim: ChartAnimSettings,
  // layout
  padX: number, padT: number, cW: number, cH: number,
  scale: number,
  isGlitch: boolean,
) {
  if (progress <= 0 || vals.length < 2) return

  const range    = maxV - minV || 1
  const count    = vals.length
  const endIdx   = Math.min(count - 1, Math.floor(progress * (count - 1)))
  const subProg  = (progress * (count - 1)) - endIdx  // fractional within segment

  const ptX = (i: number) => padX + (i / (count - 1)) * cW
  const ptY = (v: number) => padT + (1 - (v - minV) / range) * cH

  // ── Area fill (only drawn portion) ──
  ctx.save()
  ctx.globalAlpha = 0.4
  ctx.beginPath()
  for (let i = 0; i <= endIdx; i++) {
    const x = ptX(i) + (isGlitch ? glitchOffset(rawProgress) : 0)
    const y = ptY(vals[i])
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  // interpolate to sub-segment end
  if (endIdx < count - 1 && subProg > 0) {
    const x = ptX(endIdx) + (ptX(endIdx + 1) - ptX(endIdx)) * subProg
    const y = ptY(vals[endIdx]) + (ptY(vals[endIdx + 1]) - ptY(vals[endIdx])) * subProg
    ctx.lineTo(x, y)
  }
  ctx.lineTo(ptX(Math.min(endIdx, count - 1)), padT + cH)
  ctx.lineTo(padX, padT + cH)
  ctx.closePath()
  const ag = ctx.createLinearGradient(0, padT, 0, padT + cH)
  ag.addColorStop(0, fillCol + '0.5)'); ag.addColorStop(1, fillCol + '0)')
  ctx.fillStyle = ag; ctx.fill()
  ctx.restore()

  // ── Trail glow (faded history) ──
  if (anim.trailGlow && anim.trailLength < 1 && endIdx > 0) {
    const trailStart = Math.max(0, endIdx - Math.floor(anim.trailLength * count))
    ctx.save()
    ctx.beginPath()
    for (let i = trailStart; i <= endIdx; i++) {
      const x = ptX(i)
      const y = ptY(vals[i])
      i === trailStart ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.strokeStyle = lineCol
    ctx.lineWidth   = 2.5 * scale
    ctx.globalAlpha = 0.25
    ctx.lineJoin    = 'round'
    ctx.shadowColor = lineCol
    ctx.shadowBlur  = 20 * scale
    ctx.stroke()
    ctx.restore()
  }

  // ── Main line (drawn portion) ──
  ctx.save()
  ctx.beginPath()
  const lineStart = anim.trailGlow
    ? Math.max(0, endIdx - Math.floor(anim.trailLength * count))
    : 0
  for (let i = lineStart; i <= endIdx; i++) {
    const jitter = isGlitch ? glitchOffset(rawProgress) : 0
    const x = ptX(i) + jitter
    const y = ptY(vals[i])
    i === lineStart ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  if (endIdx < count - 1 && subProg > 0) {
    const x = ptX(endIdx) + (ptX(endIdx + 1) - ptX(endIdx)) * subProg
    const y = ptY(vals[endIdx]) + (ptY(vals[endIdx + 1]) - ptY(vals[endIdx])) * subProg
    ctx.lineTo(x, y)
  }
  ctx.strokeStyle = lineCol
  ctx.lineWidth   = 2 * scale
  ctx.lineJoin    = 'round'
  ctx.shadowColor = lineCol
  ctx.shadowBlur  = 8 * scale
  ctx.stroke()
  ctx.restore()

  // ── Pulsing dot at draw head ──
  if (anim.dotPulse && progress < 1) {
    let headX: number, headY: number
    if (endIdx < count - 1 && subProg > 0) {
      headX = ptX(endIdx) + (ptX(endIdx + 1) - ptX(endIdx)) * subProg
      headY = ptY(vals[endIdx]) + (ptY(vals[endIdx + 1]) - ptY(vals[endIdx])) * subProg
    } else {
      headX = ptX(endIdx); headY = ptY(vals[endIdx])
    }
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008)
    ctx.save()
    ctx.fillStyle   = lineCol
    ctx.shadowColor = lineCol
    ctx.shadowBlur  = (12 + pulse * 10) * scale
    ctx.globalAlpha = 0.6 + pulse * 0.4
    ctx.beginPath()
    ctx.arc(headX, headY, (3 + pulse * 2) * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// ─── Compute eased progress from elapsed time ─────────────────────
export function computeProgress(elapsed: number, anim: ChartAnimSettings): number {
  if (anim.duration <= 0) return 1
  const raw = Math.min(1, elapsed / anim.duration)
  return applyEasing(raw, anim.easing)
}
