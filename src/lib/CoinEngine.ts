import * as THREE from 'three'
import type { CoinSettings, LogoSettings, LightSettings, PostFX, ColorGrade, RenderStyle, RotationMode } from '../types'

export class CoinEngine {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  private coinGroup: THREE.Group
  private coinMesh: THREE.Mesh | null = null
  private logoGroup: THREE.Group | null = null
  private coinMat: THREE.MeshStandardMaterial
  private logoColor: THREE.Color
  private lights: {
    amb: THREE.AmbientLight
    key: THREE.DirectionalLight
    key2: THREE.DirectionalLight
    rim: THREE.PointLight
    fill: THREE.PointLight
  }
  private renderStyle: RenderStyle = 'pbr'
  private rotMode: RotationMode = 'y'
  private autoAngle = 0
  private lastTime = performance.now()
  private baseQuat = new THREE.Quaternion()
  private isDragging = false
  private dragPrev = { x: 0, y: 0 }
  private rotSpeed = 0.8
  private tiltXDeg = 18
  private animFrameId = 0
  private onFrame?: () => void

  // Offscreen canvases for outline FX
  _outBlur: HTMLCanvasElement | null = null
  _outDiff: HTMLCanvasElement | null = null
  _outW = 0; _outH = 0

  constructor(public glCanvas: HTMLCanvasElement, public fxCanvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.4
    this.renderer.setClearColor(0x000000, 0)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    this.camera.position.set(0, 0, 4.5)

    this.coinGroup = new THREE.Group()
    this.scene.add(this.coinGroup)

    this.coinMat = new THREE.MeshStandardMaterial({ color: 0xd4900a, metalness: 0.88, roughness: 0.18 })
    this.logoColor = new THREE.Color('#c8860b')

    this.lights = {
      amb:  new THREE.AmbientLight(0xffffff, 0.7),
      key:  new THREE.DirectionalLight(0xffffff, 2.2),
      key2: new THREE.DirectionalLight(0xffffff, 0.35),
      rim:  new THREE.PointLight(0xffcc44, 2.5, 14),
      fill: new THREE.PointLight(0xffcc44, 0.8, 10),
    }
    this.lights.key.position.set(3, 5, 3); this.lights.key.castShadow = true
    this.lights.key2.position.set(-4, -2, 2)
    this.lights.rim.position.set(-2.5, 1, -2)
    this.lights.fill.position.set(2.5, -1.5, 2)
    Object.values(this.lights).forEach(l => this.scene.add(l))

    this.buildCoin()
    this.rebuildLogo('')
  }

  // ── RESIZE ──
  resize(w: number, h: number) {
    this.renderer.setSize(w, h)
    const dpr = Math.min(window.devicePixelRatio, 2)
    this.fxCanvas.width = w * dpr; this.fxCanvas.height = h * dpr
    this.fxCanvas.style.width = w + 'px'; this.fxCanvas.style.height = h + 'px'
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this._outW = 0 // invalidate outline cache
  }

  // ── COIN PROFILE ──
  private buildProfile(thick: number, rw: number, rs: number): THREE.Vector2[] {
    const H = thick / 2, R = 1.0
    const B = Math.min(thick * 0.22, 0.045)
    const RW = Math.min(rw, R * 0.38)
    const RS = Math.min(rs, H * 0.65)
    const rimInner = R - B - RW
    const chamfer = Math.min(B * 0.45, RS * 0.85)
    const N = 14; const pts: THREE.Vector2[] = []
    pts.push(new THREE.Vector2(0, -H + RS))
    pts.push(new THREE.Vector2(rimInner - 0.001, -H + RS))
    pts.push(new THREE.Vector2(rimInner, -H + chamfer))
    pts.push(new THREE.Vector2(rimInner + B * 0.4, -H))
    for (let i = 1; i <= N; i++) { const a = (Math.PI / 2) * (i / N); pts.push(new THREE.Vector2(R - B + B * Math.sin(a), -H + B - B * Math.cos(a))) }
    pts.push(new THREE.Vector2(R, H - B))
    for (let i = 1; i <= N; i++) { const a = (Math.PI / 2) * (i / N); pts.push(new THREE.Vector2(R - B + B * Math.cos(a), H - B + B * Math.sin(a))) }
    pts.push(new THREE.Vector2(rimInner + B * 0.4, H))
    pts.push(new THREE.Vector2(rimInner, H - chamfer))
    pts.push(new THREE.Vector2(rimInner - 0.001, H - RS))
    pts.push(new THREE.Vector2(0, H - RS))
    return pts
  }

  buildCoin(settings?: Partial<CoinSettings>) {
    const thick = settings?.thickness ?? 0.14
    const rw = settings?.rimWidth ?? 0.09
    const rs = settings?.rimStep ?? 0.018
    if (this.coinMesh) { this.coinGroup.remove(this.coinMesh); this.coinMesh.geometry.dispose() }
    if (settings?.color) this.coinMat.color.set(settings.color)
    if (settings?.metalness !== undefined) this.coinMat.metalness = settings.metalness
    if (settings?.roughness !== undefined) this.coinMat.roughness = settings.roughness
    if (settings?.opacity !== undefined) { this.coinMat.transparent = settings.opacity < 1; this.coinMat.opacity = settings.opacity }
    this.coinMesh = new THREE.Mesh(new THREE.LatheGeometry(this.buildProfile(thick, rw, rs), 128), this.coinMat)
    this.coinMesh.castShadow = true
    this.coinGroup.add(this.coinMesh)
  }

  applyCoinSettings(s: CoinSettings) {
    this.coinMat.color.set(s.color)
    this.coinMat.metalness = s.metalness
    this.coinMat.roughness = s.roughness
    this.coinMat.transparent = s.opacity < 1; this.coinMat.opacity = s.opacity
    this.buildCoin(s)
    if (this.logoGroup) this.placeLogoGroup(this.logoGroup, s.thickness, s.rimStep)
  }

  // ── LOGO ──
  private makeLogoMat() {
    const c = this.logoColor.clone()
    if (this.renderStyle === 'flat') return new THREE.MeshBasicMaterial({ color: c })
    if (this.renderStyle === 'cel') return new THREE.MeshToonMaterial({ color: c })
    if (this.renderStyle === 'clay') return new THREE.MeshStandardMaterial({ color: new THREE.Color('#b09080'), metalness: 0, roughness: 0.95 })
    return new THREE.MeshStandardMaterial({ color: c, metalness: 0.6, roughness: 0.15 })
  }

  private makeDefaultLogo(logoP: LogoSettings): THREE.Group {
    const g = new THREE.Group()
    const { depth, bevel, bevelSegs } = logoP
    const ring = (outer: number, inner: number) => {
      const shape = new THREE.Shape()
      shape.moveTo(-outer, -outer); shape.lineTo(outer, -outer); shape.lineTo(outer, outer); shape.lineTo(-outer, outer); shape.closePath()
      const hole = new THREE.Path()
      hole.moveTo(-inner, -inner); hole.lineTo(inner, -inner); hole.lineTo(inner, inner); hole.lineTo(-inner, inner); hole.closePath()
      shape.holes.push(hole)
      return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: bevelSegs }), this.makeLogoMat())
    }
    g.add(ring(0.46, 0.32)); g.add(ring(0.26, 0.12))
    return g
  }

  private placeLogoGroup(g: THREE.Group, thick = 0.14, rs = 0.018) {
    g.rotation.set(-Math.PI / 2, 0, 0)
    g.position.set(0, thick / 2 - rs, 0)
  }

  rebuildLogo(svgStr: string, logoP?: LogoSettings, coinThick = 0.14, coinRS = 0.018) {
    if (this.logoGroup) { this.coinGroup.remove(this.logoGroup); this.logoGroup = null }
    const p: LogoSettings = logoP ?? { svg: '', color: '#c8860b', scale: 1, depth: 0.07, bevel: 0.008, bevelSegs: 3, metal: 0.6, rough: 0.15, opacity: 1, smooth: 80 }
    this.logoColor.set(p.color)

    if (!svgStr.trim()) {
      this.logoGroup = this.makeDefaultLogo(p)
      this.placeLogoGroup(this.logoGroup, coinThick, coinRS)
      this.logoGroup.scale.setScalar(p.scale)
      this.coinGroup.add(this.logoGroup)
      return { count: 0, error: null }
    }

    try {
      let input = svgStr.trim()
      if (!input.startsWith('<')) input = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${input}"/></svg>`
      const svgDoc = new DOMParser().parseFromString(input, 'image/svg+xml')
      if (svgDoc.querySelector('parsererror')) throw new Error('parse error')
      const paths = [...svgDoc.querySelectorAll('path')]
      if (!paths.length) throw new Error('no paths')
      const svgEl = svgDoc.querySelector('svg')
      let vb = [0, 0, 100, 100]
      if (svgEl?.getAttribute('viewBox')) vb = svgEl.getAttribute('viewBox')!.split(/[\s,]+/).map(Number)
      const [, , vw, vh] = vb; const normScale = 1.4 / Math.max(vw, vh)
      const g = new THREE.Group(); let count = 0
      const ns = 'http://www.w3.org/2000/svg'
      for (const pathEl of paths) {
        const d = pathEl.getAttribute('d'); if (!d) continue
        const tmpSvg = document.createElementNS(ns, 'svg') as SVGSVGElement
        tmpSvg.style.cssText = 'position:absolute;visibility:hidden;top:0;left:0;width:1px;height:1px;'
        const tmpP = document.createElementNS(ns, 'path') as SVGPathElement
        tmpP.setAttribute('d', d); tmpSvg.appendChild(tmpP); document.body.appendChild(tmpSvg)
        let len: number
        try { len = tmpP.getTotalLength() } catch { document.body.removeChild(tmpSvg); continue }
        if (len < 1) { document.body.removeChild(tmpSvg); continue }
        const samples = Math.max(p.smooth, Math.floor(len * (p.smooth / 80)))
        const pts: THREE.Vector2[] = []
        for (let i = 0; i <= samples; i++) {
          const pt = tmpP.getPointAtLength((i / samples) * len)
          pts.push(new THREE.Vector2((pt.x - vw / 2) * normScale, -(pt.y - vh / 2) * normScale))
        }
        document.body.removeChild(tmpSvg)
        if (pts.length < 3) continue
        const shape = new THREE.Shape(pts)
        const geo = new THREE.ExtrudeGeometry(shape, { depth: p.depth, bevelEnabled: p.bevel > 0, bevelSize: p.bevel, bevelThickness: p.bevel, bevelSegments: p.bevelSegs })
        g.add(new THREE.Mesh(geo, this.makeLogoMat()))
        count++
      }
      if (!count) throw new Error('no paths rendered')
      this.logoGroup = g
      this.placeLogoGroup(this.logoGroup, coinThick, coinRS)
      this.logoGroup.scale.setScalar(p.scale)
      this.coinGroup.add(this.logoGroup)
      return { count, error: null }
    } catch (e: unknown) {
      this.logoGroup = this.makeDefaultLogo(p)
      this.placeLogoGroup(this.logoGroup, coinThick, coinRS)
      this.coinGroup.add(this.logoGroup)
      return { count: 0, error: e instanceof Error ? e.message : 'unknown' }
    }
  }

  // ── LIGHTS ──
  applyLightSettings(s: LightSettings) {
    this.lights.key.intensity = s.keyIntensity
    this.lights.amb.intensity = s.ambIntensity
    this.lights.rim.intensity = s.rimIntensity
    this.lights.rim.color.set(s.hue)
    this.lights.fill.color.set(s.hue)
    this.renderer.toneMappingExposure = s.exposure
  }

  // ── RENDER STYLE ──
  applyRenderStyle(style: RenderStyle) {
    this.renderStyle = style
    this.coinGroup.traverse(m => {
      if (!(m as THREE.Mesh).isMesh) return
      const mesh = m as THREE.Mesh
      const isCoin = mesh === this.coinMesh
      if (style === 'pbr') {
        mesh.material = isCoin ? this.coinMat : this.makeLogoMat()
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
      } else if (style === 'flat') {
        const col = isCoin ? this.coinMat.color.clone() : this.logoColor.clone()
        mesh.material = new THREE.MeshBasicMaterial({ color: col })
        this.renderer.toneMapping = THREE.NoToneMapping
      } else if (style === 'cel') {
        const col = isCoin ? this.coinMat.color.clone() : this.logoColor.clone()
        mesh.material = new THREE.MeshToonMaterial({ color: col })
        this.renderer.toneMapping = THREE.NoToneMapping
      } else if (style === 'clay') {
        const col = isCoin ? new THREE.Color('#c8b89a') : new THREE.Color('#b09080')
        mesh.material = new THREE.MeshStandardMaterial({ color: col, metalness: 0, roughness: 0.95 })
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
      }
      ;(mesh.material as THREE.Material).needsUpdate = true
    })
  }

  // ── ROTATION ──
  setRotation(mode: RotationMode, speed: number, tilt: number) {
    this.rotMode = mode; this.rotSpeed = speed; this.tiltXDeg = tilt
    if (mode !== 'drag') { this.baseQuat.identity(); this.autoAngle = 0 }
  }

  attachDrag(el: HTMLElement) {
    const onDown = (x: number, y: number) => {
      if (this.rotMode !== 'drag') return
      this.isDragging = true; this.dragPrev = { x, y }
      this.baseQuat.copy(this.coinGroup.quaternion)
    }
    const onMove = (x: number, y: number) => {
      if (!this.isDragging) return
      const dx = x - this.dragPrev.x, dy = y - this.dragPrev.y
      this.dragPrev = { x, y }
      const s = 0.006
      this.baseQuat.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * s))
      this.baseQuat.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * s))
    }
    const onUp = () => { this.isDragging = false; this.autoAngle = 0 }

    el.addEventListener('mousedown',  e => onDown(e.clientX, e.clientY))
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY))
    window.addEventListener('mouseup', onUp)
    el.addEventListener('touchstart',  e => { onDown(e.touches[0].clientX, e.touches[0].clientY) }, { passive: true })
    window.addEventListener('touchmove', e => { onMove(e.touches[0].clientX, e.touches[0].clientY) }, { passive: true })
    window.addEventListener('touchend', onUp)
  }

  // ── POST FX ──
  private ensureOutlineCanvases(W: number, H: number) {
    if (this._outW === W && this._outH === H) return
    this._outW = W; this._outH = H
    this._outBlur = Object.assign(document.createElement('canvas'), { width: W, height: H })
    this._outDiff = Object.assign(document.createElement('canvas'), { width: W, height: H })
  }

  applyPostFX(ctx: CanvasRenderingContext2D, W: number, H: number, fx: PostFX, bgColor: string, bgImg: HTMLImageElement | null, grade: ColorGrade) {
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H)
    if (bgImg) ctx.drawImage(bgImg, 0, 0, W, H)
    ctx.drawImage(this.glCanvas, 0, 0, W, H)

    if (fx.glow) {
      ctx.save()
      ctx.filter = `blur(${Math.round(fx.glowStr * 8)}px)`
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.55
      ctx.drawImage(this.glCanvas, 0, 0, W, H)
      ctx.filter = `blur(${Math.round(fx.glowStr * 18)}px)`; ctx.globalAlpha = 0.30
      ctx.drawImage(this.glCanvas, 0, 0, W, H)
      ctx.restore()
      ctx.drawImage(this.glCanvas, 0, 0, W, H)
    }

    if (fx.outline) {
      this.ensureOutlineCanvases(W, H)
      const blurCtx = this._outBlur!.getContext('2d')!
      const diffCtx = this._outDiff!.getContext('2d')!
      blurCtx.clearRect(0, 0, W, H)
      blurCtx.filter = `blur(${fx.outlineW * 1.5}px)`
      blurCtx.drawImage(this.glCanvas, 0, 0, W, H)
      blurCtx.filter = 'none'
      diffCtx.clearRect(0, 0, W, H)
      diffCtx.drawImage(this._outBlur!, 0, 0)
      diffCtx.globalCompositeOperation = 'destination-out'
      diffCtx.drawImage(this.glCanvas, 0, 0, W, H)
      diffCtx.globalCompositeOperation = 'source-over'
      const tmpTint = Object.assign(document.createElement('canvas'), { width: W, height: H })
      const tCtx = tmpTint.getContext('2d')!
      tCtx.fillStyle = fx.outlineColor; tCtx.fillRect(0, 0, W, H)
      tCtx.globalCompositeOperation = 'destination-in'; tCtx.drawImage(this._outDiff!, 0, 0)
      ctx.save(); ctx.globalAlpha = fx.outlineOpacity; ctx.drawImage(tmpTint, 0, 0); ctx.restore()
      ctx.drawImage(this.glCanvas, 0, 0, W, H)
    }

    if (fx.grain) {
      const gd = ctx.getImageData(0, 0, W, H); const d = gd.data; const amt = fx.grainAmt * 255
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 10) continue
        const n = (Math.random() - 0.5) * amt
        d[i] = Math.max(0, Math.min(255, d[i] + n))
        d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n))
        d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n))
      }
      ctx.putImageData(gd, 0, 0)
    }

    if (fx.vignette) {
      const cx = W / 2, cy = H / 2, r = Math.max(W, H) * 0.65
      const grad = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r)
      grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.72)')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
    }

    const needGrade = grade.hue !== 0 || grade.sat !== 100 || grade.bri !== 100 || grade.con !== 100
    this.fxCanvas.style.filter = needGrade
      ? `hue-rotate(${grade.hue}deg) saturate(${grade.sat}%) brightness(${grade.bri}%) contrast(${grade.con}%)`
      : ''
  }

  // ── ANIMATE ──
  start(onFrame?: () => void) {
    this.onFrame = onFrame
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - this.lastTime) / 1000, 0.05)
      this.lastTime = now

      if (!this.isDragging) this.autoAngle += this.rotSpeed * dt

      if (this.rotMode === 'drag') {
        const spinQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.autoAngle)
        this.coinGroup.quaternion.copy(this.baseQuat).multiply(spinQ)
      } else {
        const tr = this.tiltXDeg * Math.PI / 180
        this.coinGroup.quaternion.identity()
        this.coinGroup.rotation.x = tr
        if (this.rotMode === 'y')  this.coinGroup.rotateY(this.autoAngle)
        else if (this.rotMode === 'x')  this.coinGroup.rotateX(this.autoAngle)
        else if (this.rotMode === 'z')  this.coinGroup.rotateZ(this.autoAngle)
        else if (this.rotMode === 'xy') { this.coinGroup.rotateY(this.autoAngle); this.coinGroup.rotateX(this.autoAngle * 0.33) }
      }

      this.renderer.render(this.scene, this.camera)
      this.onFrame?.()
    }
    loop()
  }

  stop() {
    cancelAnimationFrame(this.animFrameId)
  }

  dispose() {
    this.stop()
    this.renderer.dispose()
  }

  // Snapshot for export — returns an offscreen canvas with everything composited
  snapshot(transparent: boolean, bgColor: string, bgImg: HTMLImageElement | null, fx: PostFX, grade: ColorGrade): HTMLCanvasElement {
    const W = this.glCanvas.width, H = this.glCanvas.height
    const out = Object.assign(document.createElement('canvas'), { width: W, height: H })
    const ctx = out.getContext('2d')!
    if (!transparent) { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H); if (bgImg) ctx.drawImage(bgImg, 0, 0, W, H) }
    ctx.drawImage(this.glCanvas, 0, 0, W, H)
    // simplified fx pass for export (no vignette in transparent mode)
    if (fx.glow) {
      ctx.save(); ctx.filter = `blur(${Math.round(fx.glowStr * 8)}px)`
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.55; ctx.drawImage(this.glCanvas, 0, 0, W, H)
      ctx.filter = `blur(${Math.round(fx.glowStr * 18)}px)`; ctx.globalAlpha = 0.30; ctx.drawImage(this.glCanvas, 0, 0, W, H)
      ctx.restore(); ctx.drawImage(this.glCanvas, 0, 0, W, H)
    }
    if (fx.vignette && !transparent) {
      const cx = W / 2, cy = H / 2, r = Math.max(W, H) * 0.65
      const grad = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r)
      grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.72)')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
    }
    const needGrade = grade.hue !== 0 || grade.sat !== 100 || grade.bri !== 100 || grade.con !== 100
    if (needGrade) {
      const g2 = Object.assign(document.createElement('canvas'), { width: W, height: H })
      const g2ctx = g2.getContext('2d')!
      g2ctx.filter = `hue-rotate(${grade.hue}deg) saturate(${grade.sat}%) brightness(${grade.bri}%) contrast(${grade.con}%)`
      g2ctx.drawImage(out, 0, 0)
      return g2
    }
    return out
  }
}
