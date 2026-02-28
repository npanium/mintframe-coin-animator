import type { ConfettiSettings, ConfettiPresetId } from '../types'

// ─── Presets ──────────────────────────────────────────────────────
export const CONFETTI_PRESETS: Record<ConfettiPresetId, Omit<ConfettiSettings, 'enabled' | 'preset'>> = {
  gold: {
    particleCount: 80,
    speed: 3.5,
    spread: 0.9,
    size: 7,
    gravity: 0.18,
    colors: ['#f7931a', '#ffd27a', '#ffb347', '#ffe066', '#c8860b'],
    shapes: ['rect', 'diamond'],
    fadeOut: true,
    burst: false,
  },
  moon: {
    particleCount: 120,
    speed: 5.0,
    spread: 1.2,
    size: 6,
    gravity: 0.08,
    colors: ['#ffffff', '#c4d0ff', '#a0b4ff', '#627eea', '#14f195'],
    shapes: ['star', 'circle'],
    fadeOut: true,
    burst: false,
  },
  diamond: {
    particleCount: 60,
    speed: 2.8,
    spread: 0.7,
    size: 10,
    gravity: 0.22,
    colors: ['#b9f2ff', '#ffffff', '#88ccff', '#aaddff', '#00eaff'],
    shapes: ['diamond'],
    fadeOut: false,
    burst: false,
  },
  fire: {
    particleCount: 100,
    speed: 4.0,
    spread: 0.5,
    size: 8,
    gravity: -0.12, // rises
    colors: ['#ff4400', '#ff8800', '#ffcc00', '#ff2200', '#ff6600'],
    shapes: ['circle', 'rect'],
    fadeOut: true,
    burst: false,
  },
  custom: {
    particleCount: 80,
    speed: 3.0,
    spread: 0.8,
    size: 7,
    gravity: 0.15,
    colors: ['#c8960e', '#ffffff', '#ffcc44'],
    shapes: ['rect', 'circle'],
    fadeOut: true,
    burst: false,
  },
}

export function defaultConfetti(): ConfettiSettings {
  return { enabled: false, preset: 'gold', ...CONFETTI_PRESETS.gold }
}

// ─── Particle ─────────────────────────────────────────────────────
export interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  color: string
  shape: ConfettiSettings['shapes'][number]
  rotation: number
  rotSpeed: number
  life: number      // 0-1, starts at 1, decays
  maxLife: number
}

export function spawnParticles(
  W: number, H: number,
  settings: ConfettiSettings,
  existing: Particle[],
  burst: boolean,
): Particle[] {
  const count = burst ? settings.particleCount : Math.ceil(settings.particleCount / 30)
  const newOnes: Particle[] = []

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * settings.spread
    const spd   = settings.speed * (0.5 + Math.random() * 0.8)
    const col   = settings.colors[Math.floor(Math.random() * settings.colors.length)]
    const shp   = settings.shapes[Math.floor(Math.random() * settings.shapes.length)]

    // Spawn from top (rain) or center-bottom (burst)
    const spawnX = burst
      ? W * 0.5 + (Math.random() - 0.5) * W * 0.3
      : Math.random() * W
    const spawnY = burst ? H * 0.85 : -10

    newOnes.push({
      x: spawnX, y: spawnY,
      vx: Math.cos(angle) * spd,
      vy: burst ? Math.sin(angle) * spd : settings.speed * (0.3 + Math.random() * 0.7),
      size: settings.size * (0.6 + Math.random() * 0.8),
      color: col,
      shape: shp,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      life: 1,
      maxLife: burst ? 0.008 + Math.random() * 0.004 : 0.003 + Math.random() * 0.004,
    })
  }

  // Cap total particles
  return [...existing, ...newOnes].slice(-300)
}

export function updateParticles(particles: Particle[], gravity: number, dt: number): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x:  p.x + p.vx,
      y:  p.y + p.vy,
      vy: p.vy + gravity,
      vx: p.vx * 0.995,
      rotation: p.rotation + p.rotSpeed,
      life: p.life - p.maxLife,
    }))
    .filter(p => p.life > 0 && p.y < 1200 && p.y > -200)
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  fadeOut: boolean,
) {
  for (const p of particles) {
    const alpha = fadeOut ? Math.max(0, p.life) : 1
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle   = p.color
    ctx.strokeStyle = p.color
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)

    switch (p.shape) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'rect':
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        break

      case 'diamond': {
        const h = p.size * 0.6
        ctx.beginPath()
        ctx.moveTo(0, -h); ctx.lineTo(p.size / 2, 0)
        ctx.lineTo(0, h);  ctx.lineTo(-p.size / 2, 0)
        ctx.closePath(); ctx.fill()
        break
      }

      case 'star': {
        const r1 = p.size / 2, r2 = p.size / 5, spikes = 5
        ctx.beginPath()
        for (let i = 0; i < spikes * 2; i++) {
          const r   = i % 2 === 0 ? r1 : r2
          const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2
          i === 0 ? ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r)
                  : ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r)
        }
        ctx.closePath(); ctx.fill()
        break
      }
    }

    ctx.restore()
  }
}
