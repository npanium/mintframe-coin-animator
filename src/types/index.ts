export type RenderStyle = "pbr" | "flat" | "cel" | "clay";
export type RotationMode = "y" | "x" | "z" | "xy" | "drag";
export type ChartMode = "bg" | "side";
export type Timeframe = "1h" | "1d" | "7d" | "30d";
// export type AspectRatio = "1:1" | "9:16" | "16:9";
export type AspectRatio = "1:1";
export type ExportResolution = "720" | "1080" | "2160";
export type BgMode = "solid" | "linear" | "radial" | "mesh";
export type CoinLayout = "row" | "arc" | "circle" | "grid";

export interface CoinSettings {
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  thickness: number;
  rimWidth: number;
  rimStep: number;
}

export interface LogoSettings {
  svg: string;
  color: string;
  scale: number;
  depth: number;
  bevel: number;
  bevelSegs: number;
  metal: number;
  rough: number;
  opacity: number;
  smooth: number;
}

export interface LightSettings {
  hue: string;
  keyIntensity: number;
  ambIntensity: number;
  rimIntensity: number;
  exposure: number;
}

export interface PostFX {
  glow: boolean;
  outline: boolean;
  grain: boolean;
  vignette: boolean;
  glowStr: number;
  outlineW: number;
  outlineColor: string;
  outlineOpacity: number;
  grainAmt: number;
}

export interface ColorGrade {
  hue: number;
  sat: number;
  bri: number;
  con: number;
}

export interface OverlaySettings {
  enabled: boolean;
  tokenName: string;
  tagline: string;
  chainBadge: string;
  textColor: string;
  accent: string;
  badgeBg: string;
  font: string;
  bgAlpha: number;
  aspect: AspectRatio;
}

export interface ChartSettings {
  enabled: boolean;
  coinId: string;
  tf: Timeframe;
  mode: ChartMode;
  alpha: number;
  lineW: number;
  showPrice: boolean;
}

export interface ChartData {
  prices: [number, number][];
  coinId: string;
  tf: Timeframe;
}

export interface MaterialPreset {
  id: string;
  label: string;
  coinColor: string;
  metalness: number;
  roughness: number;
  lightHue: string;
  rimIntensity: number;
  ambIntensity: number;
  keyIntensity: number;
  logoColor: string;
  exposure: number;
}

export interface TokenPreset {
  id: string;
  label: string;
  ticker: string;
  tagline: string;
  chain: string;
  coinGeckoId: string;
  svg?: string;
  material: MaterialPreset;
  overlayAccent: string;
  overlayBadgeBg: string;
}

// ── Background gradient ───────────────────────────────────────────
export interface BgGradient {
  mode: BgMode;
  colorA: string;
  colorB: string;
  angle: number;
}

// ── Confetti ──────────────────────────────────────────────────────
export type ConfettiPresetId = "gold" | "moon" | "diamond" | "fire" | "custom";

export interface ConfettiSettings {
  enabled: boolean;
  preset: ConfettiPresetId;
  particleCount: number;
  speed: number;
  spread: number;
  size: number;
  gravity: number;
  colors: string[];
  shapes: ("circle" | "rect" | "diamond" | "star")[];
  fadeOut: boolean;
  burst: boolean;
}

// ── Chart animation ───────────────────────────────────────────────
export type ChartAnimPresetId =
  | "instant"
  | "smooth"
  | "dramatic"
  | "glitch"
  | "custom";

export interface ChartAnimSettings {
  preset: ChartAnimPresetId;
  duration: number;
  easing: "linear" | "ease-in" | "ease-out" | "bounce";
  trailGlow: boolean;
  trailLength: number;
  dotPulse: boolean;
}

// ── VS Mode — strictly 2 coins, each independent ─────────────────
export interface VsSettings {
  enabled: boolean;
  cameraZoom: number;
  // Left overlay text (coin appearance driven by main Coin/Logo tabs)
  leftTokenName: string;
  leftTagline: string;
  leftChainBadge: string;
  leftAccent: string;
  leftCoinId: string;
  // Right coin — fully independent appearance + overlay
  rightTokenId: string;
  rightCoinId: string;
  rightTokenName: string;
  rightTagline: string;
  rightChainBadge: string;
  rightAccent: string;
  rightCoin: CoinSettings;
  rightLogo: LogoSettings;
  // Divider
  label: string;
  dividerColor: string;
}

// ── Scene Mode — multi-coin layout ───────────────────────────────
export interface SceneSettings {
  coinCount: number; // 1–7
  layout: CoinLayout; // row | arc | circle | grid
  cameraZoom: number;
  phaseOffset: boolean; // stagger spin vs lockstep
}
