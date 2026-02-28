export type RenderStyle = "pbr" | "flat" | "cel" | "clay";
export type RotationMode = "y" | "x" | "z" | "xy" | "drag";
export type ChartMode = "bg" | "side";
export type Timeframe = "1h" | "1d" | "7d" | "30d";
export type AspectRatio = "1:1" | "9:16" | "16:9";
export type ExportResolution = "720" | "1080" | "2160";

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
  svg: string;
  material: MaterialPreset;
  overlayAccent: string;
  overlayBadgeBg: string;
}

// ── Confetti ──────────────────────────────────────────────────────
export type ConfettiPresetId = "gold" | "moon" | "diamond" | "fire" | "custom";

export interface ConfettiSettings {
  enabled: boolean;
  preset: ConfettiPresetId;
  // advanced
  particleCount: number;
  speed: number;
  spread: number;
  size: number;
  gravity: number;
  colors: string[];
  shapes: ("circle" | "rect" | "diamond" | "star")[];
  fadeOut: boolean;
  burst: boolean; // one-shot burst vs continuous rain
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
  // advanced
  duration: number; // seconds for full retrace (0 = instant)
  easing: "linear" | "ease-in" | "ease-out" | "bounce";
  trailGlow: boolean;
  trailLength: number; // 0-1, how much of the tail stays bright
  dotPulse: boolean; // pulsing dot at draw head
}

// ── VS Mode ───────────────────────────────────────────────────────
export interface VsSettings {
  enabled: boolean;
  rightTokenId: string;
  rightCoinId: string; // coingecko id for right chart
  label: string; // "VS" divider label
  dividerColor: string;
  sharedChart: boolean; // one chart spanning both, or two separate
}
