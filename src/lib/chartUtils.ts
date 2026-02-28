import type { ChartData, ChartSettings, Timeframe } from '../types'
import { TF_OPTIONS } from './presets'

const cache = new Map<string, { data: ChartData; ts: number }>()
const CACHE_TTL = 60_000 // 1 min

export async function fetchChart(coinId: string, tf: Timeframe): Promise<ChartData> {
  const key = `${coinId}:${tf}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const tfOpt = TF_OPTIONS.find(t => t.value === tf)!
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${tfOpt.days}&precision=4`

  // Retry with backoff on 429
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url)
    if (res.status === 429) {
      if (attempt < 2) await sleep((attempt + 1) * 2000)
      else throw new Error('Rate limited — try again in a moment')
      continue
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    let prices: [number, number][] = json.prices
    if (!prices?.length) throw new Error('No price data returned')
    if (tfOpt.slice) prices = prices.slice(-tfOpt.slice)
    const data: ChartData = { prices, coinId, tf }
    cache.set(key, { data, ts: Date.now() })
    return data
  }
  throw new Error('Failed after retries')
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export function priceChange(prices: [number, number][]): number {
  if (prices.length < 2) return 0
  return ((prices.at(-1)![1] - prices[0][1]) / prices[0][1]) * 100
}

export function formatPrice(p: number): string {
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (p >= 1) return '$' + p.toFixed(4)
  return '$' + p.toFixed(6)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function drawChart(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  data: ChartData,
  settings: ChartSettings,
  font: string,
  overlayBarH: number,
) {
  const vals = data.prices.map(p => p[1])
  const minV = Math.min(...vals), maxV = Math.max(...vals)
  const range = maxV - minV || 1
  const pct   = priceChange(data.prices)
  const isUp  = pct >= 0
  const lineCol = isUp ? '#44cc88' : '#ff4466'
  const fillCol = isUp ? 'rgba(68,204,136,' : 'rgba(255,68,102,'
  const scale = W / 800
  const fontFam = `'${font}', 'Courier New', monospace`
  const sign = pct >= 0 ? '+' : ''
  const tfLabel = TF_OPTIONS.find(t => t.value === settings.tf)?.label ?? ''

  if (settings.mode === 'bg') {
    const padX = W * 0.07
    const padT = H * 0.12
    const padB = overlayBarH + H * 0.04
    const cW   = W - padX * 2
    const cH   = H - padT - padB

    ctx.save()
    ctx.globalAlpha = settings.alpha

    ctx.beginPath()
    vals.forEach((v, i) => {
      const x = padX + (i / (vals.length - 1)) * cW
      const y = padT + (1 - (v - minV) / range) * cH
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.lineTo(padX + cW, padT + cH); ctx.lineTo(padX, padT + cH); ctx.closePath()
    const ag = ctx.createLinearGradient(0, padT, 0, padT + cH)
    ag.addColorStop(0, fillCol + '0.4)'); ag.addColorStop(1, fillCol + '0)')
    ctx.fillStyle = ag; ctx.fill()

    ctx.beginPath()
    vals.forEach((v, i) => {
      const x = padX + (i / (vals.length - 1)) * cW
      const y = padT + (1 - (v - minV) / range) * cH
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = lineCol; ctx.lineWidth = settings.lineW * scale
    ctx.lineJoin = 'round'; ctx.shadowColor = lineCol; ctx.shadowBlur = 8 * scale
    ctx.stroke()
    ctx.restore()

    if (settings.showPrice) {
      const barTop = H - overlayBarH
      ctx.save()
      ctx.textAlign = 'right'
      ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 6 * scale
      ctx.font = `bold ${Math.round(22 * scale)}px ${fontFam}`
      ctx.fillStyle = '#fff'
      ctx.fillText(formatPrice(vals.at(-1)!), W - 28 * scale, barTop - 28 * scale)
      ctx.font = `${Math.round(15 * scale)}px ${fontFam}`
      ctx.fillStyle = lineCol
      ctx.fillText(`${sign}${pct.toFixed(2)}%  ${tfLabel}`, W - 28 * scale, barTop - 10 * scale)
      ctx.textAlign = 'left'; ctx.restore()
    }

  } else {
    // Side panel
    const barTop = H - overlayBarH
    const pad    = 28 * scale
    const sideW  = W * 0.40
    const sideX  = W - sideW - pad
    const sideT  = barTop + 10 * scale
    const sideH  = overlayBarH - 20 * scale

    ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = '#fff'
    roundRect(ctx, sideX, sideT, sideW, sideH, 6 * scale); ctx.fill(); ctx.restore()

    ctx.save(); ctx.globalAlpha = settings.alpha
    ctx.beginPath()
    vals.forEach((v, i) => {
      const x = sideX + (i / (vals.length - 1)) * sideW
      const y = sideT + (1 - (v - minV) / range) * sideH
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.lineTo(sideX + sideW, sideT + sideH); ctx.lineTo(sideX, sideT + sideH); ctx.closePath()
    const sg = ctx.createLinearGradient(0, sideT, 0, sideT + sideH)
    sg.addColorStop(0, fillCol + '0.6)'); sg.addColorStop(1, fillCol + '0)')
    ctx.fillStyle = sg; ctx.fill()
    ctx.beginPath()
    vals.forEach((v, i) => {
      const x = sideX + (i / (vals.length - 1)) * sideW
      const y = sideT + (1 - (v - minV) / range) * sideH
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = lineCol; ctx.lineWidth = settings.lineW * scale
    ctx.lineJoin = 'round'; ctx.shadowColor = lineCol; ctx.shadowBlur = 6 * scale; ctx.stroke()
    ctx.restore()

    const lastI = vals.length - 1
    const dotX = sideX + sideW
    const dotY = sideT + (1 - (vals[lastI] - minV) / range) * sideH
    ctx.save(); ctx.fillStyle = lineCol; ctx.shadowColor = lineCol; ctx.shadowBlur = 10 * scale
    ctx.beginPath(); ctx.arc(dotX, dotY, 4 * scale, 0, Math.PI * 2); ctx.fill(); ctx.restore()

    if (settings.showPrice) {
      ctx.save()
      ctx.font = `bold ${Math.round(13 * scale)}px ${fontFam}`
      ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 4 * scale
      ctx.fillText(formatPrice(vals.at(-1)!), sideX + 6 * scale, sideT + 16 * scale)
      ctx.font = `${Math.round(11 * scale)}px ${fontFam}`
      ctx.fillStyle = lineCol
      ctx.fillText(`${sign}${pct.toFixed(2)}% · ${tfLabel}`, sideX + 6 * scale, sideT + 30 * scale)
      ctx.restore()
    }
  }
}
