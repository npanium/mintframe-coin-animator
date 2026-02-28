import { useState, useCallback } from "react";
import type {
  CoinSettings,
  LogoSettings,
  LightSettings,
  PostFX,
  ColorGrade,
  RenderStyle,
  RotationMode,
  OverlaySettings,
  ChartSettings,
  ChartData,
  Timeframe,
} from "../types";
import { MATERIAL_PRESETS, TOKEN_PRESETS } from "../lib/presets";
import { defaultConfetti } from "../lib/confetti";
import { defaultChartAnim } from "../lib/chartAnim";
import type { ConfettiSettings, ChartAnimSettings, VsSettings } from "../types";

const defaultCoin: CoinSettings = {
  color: "#d4900a",
  metalness: 0.88,
  roughness: 0.18,
  opacity: 1,
  thickness: 0.14,
  rimWidth: 0.09,
  rimStep: 0.018,
};
const defaultLogo: LogoSettings = {
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
const defaultLight: LightSettings = {
  hue: "#ffcc44",
  keyIntensity: 2.2,
  ambIntensity: 0.7,
  rimIntensity: 2.5,
  exposure: 1.4,
};
const defaultFX: PostFX = {
  glow: false,
  outline: false,
  grain: false,
  vignette: false,
  glowStr: 1.5,
  outlineW: 2,
  outlineColor: "#ffffff",
  outlineOpacity: 0.9,
  grainAmt: 0.06,
};
const defaultGrade: ColorGrade = { hue: 0, sat: 100, bri: 100, con: 100 };
const defaultOverlay: OverlaySettings = {
  enabled: false,
  tokenName: "$GODS",
  tagline: "The first on-chain deity",
  chainBadge: "Built on Algorand",
  textColor: "#ffffff",
  accent: "#c8960e",
  badgeBg: "#c8960e",
  font: "Courier New",
  bgAlpha: 0.45,
  aspect: "1:1",
};
const defaultChart: ChartSettings = {
  enabled: false,
  coinId: "bitcoin",
  tf: "1d",
  mode: "bg",
  alpha: 0.35,
  lineW: 2,
  showPrice: true,
};

const defaultVs: VsSettings = {
  enabled: false,
  rightTokenId: "ethereum",
  rightCoinId: "ethereum",
  label: "VS",
  dividerColor: "#ffffff",
  sharedChart: false,
};

export function useAppState() {
  const [coin, setCoin] = useState<CoinSettings>(defaultCoin);
  const [logo, setLogo] = useState<LogoSettings>(defaultLogo);
  const [light, setLight] = useState<LightSettings>(defaultLight);
  const [fx, setFx] = useState<PostFX>(defaultFX);
  const [grade, setGrade] = useState<ColorGrade>(defaultGrade);
  const [overlay, setOverlay] = useState<OverlaySettings>(defaultOverlay);
  const [chart, setChart] = useState<ChartSettings>(defaultChart);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [confetti, setConfetti] = useState<ConfettiSettings>(defaultConfetti());
  const [chartAnim, setChartAnim] =
    useState<ChartAnimSettings>(defaultChartAnim());
  const [vs, setVs] = useState<VsSettings>(defaultVs);
  const [vsChartData, setVsChartData] = useState<ChartData | null>(null);
  const [renderStyle, setRenderStyle] = useState<RenderStyle>("pbr");
  const [rotMode, setRotMode] = useState<RotationMode>("y");
  const [rotSpeed, setRotSpeed] = useState(0.8);
  const [tiltX, setTiltX] = useState(18);
  const [bgColor, setBgColor] = useState("#000000");
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [materialPreset, setMaterialPreset] = useState("gold");
  const [tokenPreset, setTokenPreset] = useState("custom");

  const applyMaterialPreset = useCallback((id: string) => {
    const p = MATERIAL_PRESETS.find((m) => m.id === id);
    if (!p) return;
    setMaterialPreset(id);
    setCoin((c) => ({
      ...c,
      color: p.coinColor,
      metalness: p.metalness,
      roughness: p.roughness,
    }));
    setLight({
      hue: p.lightHue,
      keyIntensity: p.keyIntensity,
      ambIntensity: p.ambIntensity,
      rimIntensity: p.rimIntensity,
      exposure: p.exposure,
    });
    setLogo((l) => ({ ...l, color: p.logoColor }));
  }, []);

  const applyTokenPreset = useCallback((id: string) => {
    const t = TOKEN_PRESETS.find((p) => p.id === id);
    if (!t) return;
    setTokenPreset(id);
    const m = t.material;
    setCoin((c) => ({
      ...c,
      color: m.coinColor,
      metalness: m.metalness,
      roughness: m.roughness,
    }));
    setLight({
      hue: m.lightHue,
      keyIntensity: m.keyIntensity,
      ambIntensity: m.ambIntensity,
      rimIntensity: m.rimIntensity,
      exposure: m.exposure,
    });
    setLogo((l) => ({
      ...l,
      color: "#ffffff", // ← white logo for all presets
      svg: t.svg, // ← auto-load the preset SVG
    }));
    setOverlay((o) => ({
      ...o,
      tokenName: t.ticker,
      tagline: t.tagline,
      chainBadge: t.chain,
      accent: t.overlayAccent,
      badgeBg: t.overlayBadgeBg,
    }));
    if (t.coinGeckoId) setChart((c) => ({ ...c, coinId: t.coinGeckoId }));
  }, []);

  return {
    coin,
    setCoin,
    logo,
    setLogo,
    light,
    setLight,
    fx,
    setFx,
    grade,
    setGrade,
    overlay,
    setOverlay,
    chart,
    setChart,
    chartData,
    setChartData,
    renderStyle,
    setRenderStyle,
    rotMode,
    setRotMode,
    rotSpeed,
    setRotSpeed,
    tiltX,
    setTiltX,
    bgColor,
    setBgColor,
    bgImg,
    setBgImg,
    materialPreset,
    applyMaterialPreset,
    tokenPreset,
    applyTokenPreset,
    confetti,
    setConfetti,
    chartAnim,
    setChartAnim,
    vs,
    setVs,
    vsChartData,
    setVsChartData,
  };
}

// ── Re-exported for convenience ──
export { defaultConfetti } from "../lib/confetti";
export { defaultChartAnim } from "../lib/chartAnim";
