import * as THREE from "three";
import type {
  CoinSettings,
  LogoSettings,
  LightSettings,
  PostFX,
  ColorGrade,
  RenderStyle,
  RotationMode,
  BgGradient,
} from "../types";

// Per-slot state so each coin can have completely independent appearance
interface CoinSlot {
  group: THREE.Group;
  mesh: THREE.Mesh | null;
  logoGroup: THREE.Group | null;
  mat: THREE.MeshStandardMaterial;
  logoColor: THREE.Color;
  coinSettings: CoinSettings;
  logoSvg: string;
  logoSettings: LogoSettings;
}

const DEFAULT_COIN: CoinSettings = {
  color: "#d4900a",
  metalness: 0.88,
  roughness: 0.18,
  opacity: 1,
  thickness: 0.14,
  rimWidth: 0.09,
  rimStep: 0.018,
};
const DEFAULT_LOGO: LogoSettings = {
  svg: "",
  color: "#c8860b",
  scale: 1,
  depth: 0.07,
  bevel: 0.008,
  bevelSegs: 3,
  metal: 0.6,
  rough: 0.15,
  opacity: 1,
  smooth: 80,
};

export class CoinEngine {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  private slots: CoinSlot[] = [];
  private renderStyle: RenderStyle = "pbr";
  private rotMode: RotationMode = "y";
  private autoAngle = 0;
  private lastTime = performance.now();
  private baseQuat = new THREE.Quaternion();
  private isDragging = false;
  private dragPrev = { x: 0, y: 0 };
  private rotSpeed = 0.8;
  private tiltXDeg = 18;
  private animFrameId = 0;

  private _coinCount = 1;
  private _cameraZoom = 1;
  private _layout: "row" | "arc" | "circle" | "grid" = "row";
  private _phaseOffset = true;

  _outBlur: HTMLCanvasElement | null = null;
  _outDiff: HTMLCanvasElement | null = null;
  _outW = 0;
  _outH = 0;

  private lights: {
    amb: THREE.AmbientLight;
    key: THREE.DirectionalLight;
    key2: THREE.DirectionalLight;
    rim: THREE.PointLight;
    fill: THREE.PointLight;
  };

  constructor(
    public glCanvas: HTMLCanvasElement,
    public fxCanvas: HTMLCanvasElement,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: glCanvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(0, 0, 4.5);

    this.lights = {
      amb: new THREE.AmbientLight(0xffffff, 0.7),
      key: new THREE.DirectionalLight(0xffffff, 2.2),
      key2: new THREE.DirectionalLight(0xffffff, 0.35),
      rim: new THREE.PointLight(0xffcc44, 2.5, 14),
      fill: new THREE.PointLight(0xffcc44, 0.8, 10),
    };
    this.lights.key.position.set(3, 5, 3);
    this.lights.key.castShadow = true;
    this.lights.key2.position.set(-4, -2, 2);
    this.lights.rim.position.set(-2.5, 1, -2);
    this.lights.fill.position.set(2.5, -1.5, 2);
    Object.values(this.lights).forEach((l) => this.scene.add(l));

    this._addSlot(DEFAULT_COIN, DEFAULT_LOGO);
  }

  // ── RESIZE ────────────────────────────────────────────────────
  resize(w: number, h: number) {
    this.renderer.setSize(w, h);
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.fxCanvas.width = w * dpr;
    this.fxCanvas.height = h * dpr;
    this.fxCanvas.style.width = w + "px";
    this.fxCanvas.style.height = h + "px";
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this._outW = 0;
  }

  // ── SLOT MANAGEMENT ──────────────────────────────────────────

  private _makeMat(coin: CoinSettings): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: coin.color,
      metalness: coin.metalness,
      roughness: coin.roughness,
      transparent: coin.opacity < 1,
      opacity: coin.opacity,
    });
  }

  private _addSlot(coin: CoinSettings, logo: LogoSettings): CoinSlot {
    const group = new THREE.Group();
    this.scene.add(group);
    const mat = this._makeMat(coin);
    const logoColor = new THREE.Color(logo.color);
    const slot: CoinSlot = {
      group,
      mesh: null,
      logoGroup: null,
      mat,
      logoColor,
      coinSettings: { ...coin },
      logoSvg: logo.svg,
      logoSettings: { ...logo },
    };
    this.slots.push(slot);
    this._buildMesh(slot);
    this._buildLogo(slot);
    return slot;
  }

  private _removeSlot(slot: CoinSlot) {
    this.scene.remove(slot.group);
    slot.mat.dispose();
    if (slot.mesh) slot.mesh.geometry.dispose();
  }

  // ── COIN COUNT / LAYOUT ──────────────────────────────────────

  /** Set total coin count. Slot 0 always retains main coin settings. */
  setCoinCount(
    n: number,
    layout: typeof this._layout = "row",
    phaseOffset = true,
  ) {
    n = Math.max(1, Math.min(7, n));
    this._coinCount = n;
    this._layout = layout;
    this._phaseOffset = phaseOffset;

    // Remove excess slots
    while (this.slots.length > n) {
      this._removeSlot(this.slots.pop()!);
    }

    // Add missing slots (clone slot 0 appearance as baseline)
    while (this.slots.length < n) {
      const base = this.slots[0];
      this._addSlot({ ...base.coinSettings }, { ...base.logoSettings });
    }

    this._layoutCoins();
    this._updateCamera();
  }

  /** Apply settings to a specific slot index. */
  setSlotCoin(index: number, coin: CoinSettings) {
    const slot = this.slots[index];
    if (!slot) return;
    slot.coinSettings = { ...coin };
    slot.mat.color.set(coin.color);
    slot.mat.metalness = coin.metalness;
    slot.mat.roughness = coin.roughness;
    slot.mat.transparent = coin.opacity < 1;
    slot.mat.opacity = coin.opacity;
    this._buildMesh(slot);
  }

  setSlotLogo(index: number, svg: string, logo: LogoSettings) {
    const slot = this.slots[index];
    if (!slot) return;
    slot.logoSvg = svg;
    slot.logoSettings = { ...logo };
    slot.logoColor.set(logo.color);
    this._buildLogo(slot);
  }

  setCameraZoom(zoom: number) {
    this._cameraZoom = Math.max(0.4, Math.min(4, zoom));
    this._updateCamera();
  }

  private _updateCamera() {
    const n = this._coinCount;
    const baseZ = n === 1 ? 4.5 : n === 2 ? 6.2 : n <= 4 ? 8.5 : 11.0;
    this.camera.position.z = baseZ * this._cameraZoom;
    this.camera.updateProjectionMatrix();
  }

  private _spreadFor(n: number): number {
    if (n === 1) return 0;
    if (n === 2) return 2.6;
    if (n <= 4) return 2.2;
    return 1.8;
  }

  private _layoutCoins() {
    const n = this.slots.length;
    if (n === 1) {
      this.slots[0].group.position.set(0, 0, 0);
      return;
    }

    const spread = this._spreadFor(n);
    const half = (n - 1) / 2;

    for (let i = 0; i < n; i++) {
      const g = this.slots[i].group;
      const t = i - half;

      switch (this._layout) {
        case "arc": {
          const arcY = Math.cos((i / (n - 1)) * Math.PI) * 0.7;
          g.position.set(t * spread, arcY, 0);
          break;
        }
        case "circle": {
          const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
          const r = spread * (n / (2 * Math.PI));
          g.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
          break;
        }
        case "grid": {
          const cols = Math.ceil(Math.sqrt(n));
          const row = Math.floor(i / cols);
          const col = i % cols;
          const colsInRow = Math.min(cols, n - row * cols);
          const offsetX = (colsInRow - 1) / 2;
          g.position.set((col - offsetX) * spread, -row * spread * 0.85, 0);
          break;
        }
        default: // row
          g.position.set(t * spread, 0, 0);
      }
    }
  }

  // ── MESH / LOGO BUILD ─────────────────────────────────────────

  private buildProfile(thick: number, rw: number, rs: number): THREE.Vector2[] {
    const H = thick / 2,
      R = 1.0;
    const B = Math.min(thick * 0.22, 0.045);
    const RW = Math.min(rw, R * 0.38);
    const RS = Math.min(rs, H * 0.65);
    const rimInner = R - B - RW;
    const chamfer = Math.min(B * 0.45, RS * 0.85);
    const N = 14;
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0, -H + RS));
    pts.push(new THREE.Vector2(rimInner - 0.001, -H + RS));
    pts.push(new THREE.Vector2(rimInner, -H + chamfer));
    pts.push(new THREE.Vector2(rimInner + B * 0.4, -H));
    for (let i = 1; i <= N; i++) {
      const a = (Math.PI / 2) * (i / N);
      pts.push(
        new THREE.Vector2(R - B + B * Math.sin(a), -H + B - B * Math.cos(a)),
      );
    }
    pts.push(new THREE.Vector2(R, H - B));
    for (let i = 1; i <= N; i++) {
      const a = (Math.PI / 2) * (i / N);
      pts.push(
        new THREE.Vector2(R - B + B * Math.cos(a), H - B + B * Math.sin(a)),
      );
    }
    pts.push(new THREE.Vector2(rimInner + B * 0.4, H));
    pts.push(new THREE.Vector2(rimInner, H - chamfer));
    pts.push(new THREE.Vector2(rimInner - 0.001, H - RS));
    pts.push(new THREE.Vector2(0, H - RS));
    return pts;
  }

  private _buildMesh(slot: CoinSlot) {
    if (slot.mesh) {
      slot.group.remove(slot.mesh);
      slot.mesh.geometry.dispose();
    }
    const { thickness: thick, rimWidth: rw, rimStep: rs } = slot.coinSettings;
    const mesh = new THREE.Mesh(
      new THREE.LatheGeometry(this.buildProfile(thick, rw, rs), 128),
      slot.mat,
    );
    mesh.castShadow = true;
    slot.group.add(mesh);
    slot.mesh = mesh;
    // Re-place logo for new thickness
    if (slot.logoGroup) this._placeLogoGroup(slot.logoGroup, thick, rs);
  }

  private _makeLogoMat(slot: CoinSlot): THREE.Material {
    const c = slot.logoColor.clone();
    if (this.renderStyle === "flat")
      return new THREE.MeshBasicMaterial({ color: c });
    if (this.renderStyle === "cel")
      return new THREE.MeshToonMaterial({ color: c });
    if (this.renderStyle === "clay")
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color("#b09080"),
        metalness: 0,
        roughness: 0.95,
      });
    return new THREE.MeshStandardMaterial({
      color: c,
      metalness: 0.6,
      roughness: 0.15,
    });
  }

  private _makeDefaultLogo(slot: CoinSlot): THREE.Group {
    const g = new THREE.Group();
    const { depth, bevel, bevelSegs } = slot.logoSettings;
    const ring = (outer: number, inner: number) => {
      const shape = new THREE.Shape();
      shape.moveTo(-outer, -outer);
      shape.lineTo(outer, -outer);
      shape.lineTo(outer, outer);
      shape.lineTo(-outer, outer);
      shape.closePath();
      const hole = new THREE.Path();
      hole.moveTo(-inner, -inner);
      hole.lineTo(inner, -inner);
      hole.lineTo(inner, inner);
      hole.lineTo(-inner, inner);
      hole.closePath();
      shape.holes.push(hole);
      return new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: bevel > 0,
          bevelSize: bevel,
          bevelThickness: bevel,
          bevelSegments: bevelSegs,
        }),
        this._makeLogoMat(slot),
      );
    };
    g.add(ring(0.46, 0.32));
    g.add(ring(0.26, 0.12));
    return g;
  }

  private _parseSvgLogo(slot: CoinSlot): THREE.Group | null {
    const svgStr = slot.logoSvg;
    const p = slot.logoSettings;
    try {
      let input = svgStr.trim();
      if (!input.startsWith("<")) {
        input = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${input}"/></svg>`;
      }
      const svgDoc = new DOMParser().parseFromString(input, "image/svg+xml");
      if (svgDoc.querySelector("parsererror")) return null;
      const pathEls = [...svgDoc.querySelectorAll("path")];
      if (!pathEls.length) return null;
      const svgEl = svgDoc.querySelector("svg");
      let vb = [0, 0, 100, 100];
      if (svgEl?.getAttribute("viewBox")) {
        vb = svgEl
          .getAttribute("viewBox")!
          .split(/[\s,]+/)
          .map(Number);
      }
      const [, , vw, vh] = vb;
      const normScale = 1.4 / Math.max(vw, vh);
      const ns = "http://www.w3.org/2000/svg";
      const g = new THREE.Group();
      let count = 0;

      const extrudeOpts = {
        depth: p.depth,
        bevelEnabled: p.bevel > 0,
        bevelSize: p.bevel,
        bevelThickness: p.bevel,
        bevelSegments: p.bevelSegs,
      };

      // Helper: sample an SVG path element into THREE.Vector2[]
      const samplePath = (pathEl: SVGPathElement): THREE.Vector2[] | null => {
        let len: number;
        try {
          len = pathEl.getTotalLength();
        } catch {
          return null;
        }
        if (len < 1) return null;
        const samples = Math.max(p.smooth, Math.floor(len * (p.smooth / 80)));
        const pts: THREE.Vector2[] = [];
        for (let i = 0; i <= samples; i++) {
          const pt = pathEl.getPointAtLength((i / samples) * len);
          pts.push(
            new THREE.Vector2(
              (pt.x - vw / 2) * normScale,
              -(pt.y - vh / 2) * normScale,
            ),
          );
        }
        return pts.length >= 3 ? pts : null;
      };

      for (const pathEl of pathEls) {
        const d = pathEl.getAttribute("d");
        if (!d) continue;

        // Split compound path into sub-paths by M/m commands at the start
        // Each M starts a new sub-path; subsequent ones are candidate holes
        const subPathDs = splitIntoSubPaths(d);

        if (subPathDs.length <= 1) {
          // Simple path — just extrude directly
          const tmpSvg = makeTmpSvg(ns);
          const tmpP = makePathEl(ns, d);
          tmpSvg.appendChild(tmpP);
          document.body.appendChild(tmpSvg);
          const pts = samplePath(tmpP);
          document.body.removeChild(tmpSvg);
          if (!pts) continue;
          const shape = new THREE.Shape(pts);
          g.add(
            new THREE.Mesh(
              new THREE.ExtrudeGeometry(shape, extrudeOpts),
              this._makeLogoMat(slot),
            ),
          );
          count++;
        } else {
          // Compound path — first sub-path is outer shape, rest are holes
          // We detect which are holes by checking if they wind oppositely
          // (simplest heuristic: treat all subsequent closed sub-paths as holes)
          const tmpSvg = makeTmpSvg(ns);
          document.body.appendChild(tmpSvg);

          const subPtArrays: THREE.Vector2[][] = [];
          for (const sd of subPathDs) {
            const sp = makePathEl(ns, sd);
            tmpSvg.appendChild(sp);
            const pts = samplePath(sp);
            tmpSvg.removeChild(sp);
            if (pts) subPtArrays.push(pts);
          }
          document.body.removeChild(tmpSvg);

          if (!subPtArrays.length) continue;

          // Outer shape = sub-path with the largest bounding area
          let outerIdx = 0;
          let maxArea = 0;
          for (let i = 0; i < subPtArrays.length; i++) {
            const a = Math.abs(signedArea(subPtArrays[i]));
            if (a > maxArea) {
              maxArea = a;
              outerIdx = i;
            }
          }

          const shape = new THREE.Shape(subPtArrays[outerIdx]);
          for (let i = 0; i < subPtArrays.length; i++) {
            if (i === outerIdx) continue;
            shape.holes.push(new THREE.Path(subPtArrays[i]));
          }

          g.add(
            new THREE.Mesh(
              new THREE.ExtrudeGeometry(shape, extrudeOpts),
              this._makeLogoMat(slot),
            ),
          );
          count++;
        }
      }

      return count > 0 ? g : null;
    } catch {
      return null;
    }
  }

  private _placeLogoGroup(g: THREE.Group, thick = 0.14, rs = 0.018) {
    g.rotation.set(-Math.PI / 2, 0, 0);
    g.position.set(0, thick / 2 - rs, 0);
  }

  private _buildLogo(slot: CoinSlot) {
    if (slot.logoGroup) {
      slot.group.remove(slot.logoGroup);
      slot.logoGroup = null;
    }
    slot.logoColor.set(slot.logoSettings.color);
    const lg = slot.logoSvg.trim()
      ? (this._parseSvgLogo(slot) ?? this._makeDefaultLogo(slot))
      : this._makeDefaultLogo(slot);
    const { thickness: thick, rimStep: rs } = slot.coinSettings;
    this._placeLogoGroup(lg, thick, rs);
    lg.scale.setScalar(slot.logoSettings.scale);
    slot.group.add(lg);
    slot.logoGroup = lg;
  }

  // ── PUBLIC API (slot 0 = main coin) ──────────────────────────

  buildCoin(s?: Partial<CoinSettings>) {
    this.setSlotCoin(0, { ...this.slots[0].coinSettings, ...s });
  }

  applyCoinSettings(s: CoinSettings) {
    this.setSlotCoin(0, s);
  }

  rebuildLogo(
    svgStr: string,
    logoP?: LogoSettings,
    _coinThick?: number,
    _coinRS?: number,
  ) {
    const slot = this.slots[0];
    if (!slot) return { count: 0, error: null };
    slot.logoSvg = svgStr;
    if (logoP) slot.logoSettings = { ...logoP };
    this._buildLogo(slot);
    return { count: 1, error: null };
  }

  // ── LIGHTS ───────────────────────────────────────────────────
  applyLightSettings(s: LightSettings) {
    this.lights.key.intensity = s.keyIntensity;
    this.lights.amb.intensity = s.ambIntensity;
    this.lights.rim.intensity = s.rimIntensity;
    this.lights.rim.color.set(s.hue);
    this.lights.fill.color.set(s.hue);
    this.renderer.toneMappingExposure = s.exposure;
  }

  // ── RENDER STYLE ─────────────────────────────────────────────
  applyRenderStyle(style: RenderStyle) {
    this.renderStyle = style;
    for (const slot of this.slots) {
      slot.group.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return;
        const mesh = obj as THREE.Mesh;
        const isCoin = mesh === slot.mesh;
        if (style === "pbr") {
          mesh.material = isCoin ? slot.mat : this._makeLogoMat(slot);
          this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        } else if (style === "flat") {
          mesh.material = new THREE.MeshBasicMaterial({
            color: isCoin ? slot.mat.color.clone() : slot.logoColor.clone(),
          });
          this.renderer.toneMapping = THREE.NoToneMapping;
        } else if (style === "cel") {
          mesh.material = new THREE.MeshToonMaterial({
            color: isCoin ? slot.mat.color.clone() : slot.logoColor.clone(),
          });
          this.renderer.toneMapping = THREE.NoToneMapping;
        } else if (style === "clay") {
          mesh.material = new THREE.MeshStandardMaterial({
            color: isCoin
              ? new THREE.Color("#c8b89a")
              : new THREE.Color("#b09080"),
            metalness: 0,
            roughness: 0.95,
          });
          this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        }
        (mesh.material as THREE.Material).needsUpdate = true;
      });
    }
  }

  // ── ROTATION ─────────────────────────────────────────────────
  setRotation(mode: RotationMode, speed: number, tilt: number) {
    this.rotMode = mode;
    this.rotSpeed = speed;
    this.tiltXDeg = tilt;
    if (mode !== "drag") {
      this.baseQuat.identity();
      this.autoAngle = 0;
    }
  }

  attachDrag(el: HTMLElement) {
    const onDown = (x: number, y: number) => {
      if (this.rotMode !== "drag") return;
      this.isDragging = true;
      this.dragPrev = { x, y };
      this.baseQuat.copy(
        this.slots[0]?.group.quaternion ?? new THREE.Quaternion(),
      );
    };
    const onMove = (x: number, y: number) => {
      if (!this.isDragging) return;
      const dx = x - this.dragPrev.x,
        dy = y - this.dragPrev.y;
      this.dragPrev = { x, y };
      const s = 0.006;
      this.baseQuat.premultiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          dx * s,
        ),
      );
      this.baseQuat.premultiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          dy * s,
        ),
      );
    };
    const onUp = () => {
      this.isDragging = false;
      this.autoAngle = 0;
    };
    el.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", onUp);
    el.addEventListener(
      "touchstart",
      (e) => onDown(e.touches[0].clientX, e.touches[0].clientY),
      { passive: true },
    );
    window.addEventListener(
      "touchmove",
      (e) => onMove(e.touches[0].clientX, e.touches[0].clientY),
      { passive: true },
    );
    window.addEventListener("touchend", onUp);
  }

  // ── POST FX ──────────────────────────────────────────────────
  private ensureOutlineCanvases(W: number, H: number) {
    if (this._outW === W && this._outH === H) return;
    this._outW = W;
    this._outH = H;
    this._outBlur = Object.assign(document.createElement("canvas"), {
      width: W,
      height: H,
    });
    this._outDiff = Object.assign(document.createElement("canvas"), {
      width: W,
      height: H,
    });
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    bgColor: string,
    bgGradient: BgGradient | null,
    bgImg: HTMLImageElement | null,
  ) {
    if (!bgGradient || bgGradient.mode === "solid") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
    } else if (bgGradient.mode === "linear") {
      const rad = (bgGradient.angle * Math.PI) / 180;
      const cx = W / 2,
        cy = H / 2;
      const len = Math.sqrt(W * W + H * H) / 2;
      const grad = ctx.createLinearGradient(
        cx - Math.cos(rad) * len,
        cy - Math.sin(rad) * len,
        cx + Math.cos(rad) * len,
        cy + Math.sin(rad) * len,
      );
      grad.addColorStop(0, bgGradient.colorA);
      grad.addColorStop(1, bgGradient.colorB);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (bgGradient.mode === "radial") {
      const grad = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.65,
      );
      grad.addColorStop(0, bgGradient.colorA);
      grad.addColorStop(1, bgGradient.colorB);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (bgGradient.mode === "mesh") {
      ctx.fillStyle = bgGradient.colorB;
      ctx.fillRect(0, 0, W, H);
      const corners: [number, number, string][] = [
        [0, 0, bgGradient.colorA],
        [W, 0, bgGradient.colorB],
        [0, H, bgGradient.colorB],
        [W, H, bgGradient.colorA],
      ];
      for (const [x, y, col] of corners) {
        const gr = ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          Math.max(W, H) * 0.9,
        );
        gr.addColorStop(0, col + "cc");
        gr.addColorStop(1, col + "00");
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, W, H);
      }
    }
    if (bgImg) ctx.drawImage(bgImg, 0, 0, W, H);
  }

  applyPostFX(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    fx: PostFX,
    bgColor: string,
    bgImg: HTMLImageElement | null,
    grade: ColorGrade,
    bgGradient: BgGradient | null = null,
  ) {
    ctx.clearRect(0, 0, W, H);
    this.drawBackground(ctx, W, H, bgColor, bgGradient, bgImg);
    ctx.drawImage(this.glCanvas, 0, 0, W, H);

    if (fx.glow) {
      ctx.save();
      ctx.filter = `blur(${Math.round(fx.glowStr * 8)}px)`;
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.55;
      ctx.drawImage(this.glCanvas, 0, 0, W, H);
      ctx.filter = `blur(${Math.round(fx.glowStr * 18)}px)`;
      ctx.globalAlpha = 0.3;
      ctx.drawImage(this.glCanvas, 0, 0, W, H);
      ctx.restore();
      ctx.drawImage(this.glCanvas, 0, 0, W, H);
    }

    if (fx.outline) {
      this.ensureOutlineCanvases(W, H);
      const blurCtx = this._outBlur!.getContext("2d")!;
      const diffCtx = this._outDiff!.getContext("2d")!;
      blurCtx.clearRect(0, 0, W, H);
      blurCtx.filter = `blur(${fx.outlineW * 1.5}px)`;
      blurCtx.drawImage(this.glCanvas, 0, 0, W, H);
      blurCtx.filter = "none";
      diffCtx.clearRect(0, 0, W, H);
      diffCtx.drawImage(this._outBlur!, 0, 0);
      diffCtx.globalCompositeOperation = "destination-out";
      diffCtx.drawImage(this.glCanvas, 0, 0, W, H);
      diffCtx.globalCompositeOperation = "source-over";
      const tmpTint = Object.assign(document.createElement("canvas"), {
        width: W,
        height: H,
      });
      const tCtx = tmpTint.getContext("2d")!;
      tCtx.fillStyle = fx.outlineColor;
      tCtx.fillRect(0, 0, W, H);
      tCtx.globalCompositeOperation = "destination-in";
      tCtx.drawImage(this._outDiff!, 0, 0);
      ctx.save();
      ctx.globalAlpha = fx.outlineOpacity;
      ctx.drawImage(tmpTint, 0, 0);
      ctx.restore();
      ctx.drawImage(this.glCanvas, 0, 0, W, H);
    }

    if (fx.grain) {
      const gd = ctx.getImageData(0, 0, W, H);
      const d = gd.data;
      const amt = fx.grainAmt * 255;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 10) continue;
        const n = (Math.random() - 0.5) * amt;
        d[i] = Math.max(0, Math.min(255, d[i] + n));
        d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
        d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
      }
      ctx.putImageData(gd, 0, 0);
    }

    if (fx.vignette) {
      const cx = W / 2,
        cy = H / 2,
        r = Math.max(W, H) * 0.65;
      const grad = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    const needGrade =
      grade.hue !== 0 ||
      grade.sat !== 100 ||
      grade.bri !== 100 ||
      grade.con !== 100;
    this.fxCanvas.style.filter = needGrade
      ? `hue-rotate(${grade.hue}deg) saturate(${grade.sat}%) brightness(${grade.bri}%) contrast(${grade.con}%)`
      : "";
  }

  // ── ANIMATION LOOP ───────────────────────────────────────────
  start() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      if (!this.isDragging) this.autoAngle += this.rotSpeed * dt;
      const tr = (this.tiltXDeg * Math.PI) / 180;
      const n = this.slots.length;

      for (let i = 0; i < n; i++) {
        const { group } = this.slots[i];
        const wx = group.position.x;
        const wy = group.position.y;

        if (this.rotMode === "drag") {
          const spinQ = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            this.autoAngle,
          );
          group.quaternion.copy(this.baseQuat).multiply(spinQ);
        } else {
          const phase =
            this._phaseOffset && n > 1 ? (i / n) * Math.PI * 0.4 : 0;
          const angle = this.autoAngle + phase;
          group.quaternion.identity();
          group.rotation.x = tr;
          if (this.rotMode === "y") group.rotateY(angle);
          else if (this.rotMode === "x") group.rotateX(angle);
          else if (this.rotMode === "z") group.rotateZ(angle);
          else if (this.rotMode === "xy") {
            group.rotateY(angle);
            group.rotateX(angle * 0.33);
          }
        }

        group.position.x = wx;
        group.position.y = wy;
      }

      this.renderer.render(this.scene, this.camera);
      this._syncStreamCanvas();
    };
    loop();
  }

  stop() {
    cancelAnimationFrame(this.animFrameId);
  }
  dispose() {
    this.stop();
    this.renderer.dispose();
  }

  /**
   * Capture the current frame exactly as visible on screen.
   * fxCanvas already has: background + WebGL coin + glow + outline + grain + vignette.
   * CSS filter (color grade) is applied via a second canvas pass.
   * If transparent=true we re-render just the coin on a clear background.
   */
  snapshot(
    transparent: boolean,
    bgColor: string,
    bgImg: HTMLImageElement | null,
    fx: PostFX,
    grade: ColorGrade,
    bgGradient: BgGradient | null = null,
  ): HTMLCanvasElement {
    // fxCanvas backing size (may be DPR-scaled, e.g. 960×960 on retina)
    const W = this.fxCanvas.width;
    const H = this.fxCanvas.height;

    if (!transparent) {
      // fxCanvas already has everything — just copy it
      const out = Object.assign(document.createElement("canvas"), {
        width: W,
        height: H,
      });
      const ctx = out.getContext("2d")!;
      ctx.drawImage(this.fxCanvas, 0, 0);

      // Apply CSS color grade (which is only a style on the canvas element, not baked in)
      const needGrade =
        grade.hue !== 0 ||
        grade.sat !== 100 ||
        grade.bri !== 100 ||
        grade.con !== 100;
      if (needGrade) {
        const g2 = Object.assign(document.createElement("canvas"), {
          width: W,
          height: H,
        });
        const g2ctx = g2.getContext("2d")!;
        g2ctx.filter = `hue-rotate(${grade.hue}deg) saturate(${grade.sat}%) brightness(${grade.bri}%) contrast(${grade.con}%)`;
        g2ctx.drawImage(out, 0, 0);
        return g2;
      }
      return out;
    }

    // Transparent mode: re-composite manually without background
    const out = Object.assign(document.createElement("canvas"), {
      width: W,
      height: H,
    });
    const ctx = out.getContext("2d")!;

    // Draw only the coin (glCanvas is WebGL output, transparent bg)
    ctx.drawImage(this.glCanvas, 0, 0, W, H);

    if (fx.glow) {
      ctx.save();
      ctx.filter = `blur(${Math.round(fx.glowStr * 8)}px)`;
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.55;
      ctx.drawImage(this.glCanvas, 0, 0, W, H);
      ctx.filter = `blur(${Math.round(fx.glowStr * 18)}px)`;
      ctx.globalAlpha = 0.3;
      ctx.drawImage(this.glCanvas, 0, 0, W, H);
      ctx.restore();
      ctx.drawImage(this.glCanvas, 0, 0, W, H);
    }

    const needGrade =
      grade.hue !== 0 ||
      grade.sat !== 100 ||
      grade.bri !== 100 ||
      grade.con !== 100;
    if (needGrade) {
      const g2 = Object.assign(document.createElement("canvas"), {
        width: W,
        height: H,
      });
      const g2ctx = g2.getContext("2d")!;
      g2ctx.filter = `hue-rotate(${grade.hue}deg) saturate(${grade.sat}%) brightness(${grade.bri}%) contrast(${grade.con}%)`;
      g2ctx.drawImage(out, 0, 0);
      return g2;
    }
    return out;
  }

  /**
   * Returns the canvas that should be used for MediaRecorder.captureStream().
   * This is fxCanvas at its logical CSS size — we create a correctly-sized
   * intermediate canvas and blit fxCanvas into it each frame if DPR > 1,
   * OR just return fxCanvas directly when DPR === 1.
   *
   * Call this once to get the stream canvas, then start recording.
   */
  getStreamCanvas(): HTMLCanvasElement {
    const dpr = Math.min(window.devicePixelRatio, 2);
    if (dpr === 1) return this.fxCanvas;
    // Return a logical-size canvas that mirrors fxCanvas, downscaled from DPR
    const logicalW = Math.round(this.fxCanvas.width / dpr);
    const logicalH = Math.round(this.fxCanvas.height / dpr);
    if (!this._streamCanvas || this._streamCanvas.width !== logicalW) {
      this._streamCanvas = Object.assign(document.createElement("canvas"), {
        width: logicalW,
        height: logicalH,
      });
    }
    return this._streamCanvas;
  }

  /** Called each frame by the RAF loop to keep stream canvas in sync */
  private _syncStreamCanvas() {
    if (!this._streamCanvas) return;
    const ctx = this._streamCanvas.getContext("2d")!;
    ctx.drawImage(
      this.fxCanvas,
      0,
      0,
      this._streamCanvas.width,
      this._streamCanvas.height,
    );
  }

  private _streamCanvas: HTMLCanvasElement | null = null;
}
// ── SVG path helpers (module-level) ──────────────────────────────

function makeTmpSvg(ns: string): SVGSVGElement {
  const el = document.createElementNS(ns, "svg") as SVGSVGElement;
  el.style.cssText =
    "position:absolute;visibility:hidden;top:0;left:0;width:1px;height:1px;";
  return el;
}

function makePathEl(ns: string, d: string): SVGPathElement {
  const el = document.createElementNS(ns, "path") as SVGPathElement;
  el.setAttribute("d", d);
  return el;
}

/**
 * Split a compound SVG path `d` string into individual sub-paths.
 * Each sub-path starts at an absolute or relative M/m command.
 * We keep the M with its sub-path so each one is independently valid.
 */
function splitIntoSubPaths(d: string): string[] {
  // Match every M or m that is preceded by a non-space (i.e. not the first one)
  // We split on M/m that appear after the initial one
  const parts: string[] = [];
  // Tokenise: find all M/m positions (case-sensitive)
  const mRegex = /[Mm]/g;
  const indices: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = mRegex.exec(d)) !== null) {
    indices.push(m.index);
  }
  if (indices.length <= 1) return [d];
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i];
    const end = i + 1 < indices.length ? indices[i + 1] : d.length;
    const sub = d.slice(start, end).trim();
    if (sub) parts.push(sub);
  }
  return parts.length > 0 ? parts : [d];
}

/**
 * Compute the signed area of a polygon via the shoelace formula.
 * Positive = counter-clockwise, negative = clockwise.
 * We use absolute value to find the largest (outer) shape.
 */
function signedArea(pts: THREE.Vector2[]): number {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return area / 2;
}
