import type { MaterialPreset, TokenPreset } from "../types";

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: "gold",
    label: "Gold",
    coinColor: "#d4900a",
    metalness: 0.88,
    roughness: 0.18,
    lightHue: "#ffcc44",
    rimIntensity: 2.5,
    ambIntensity: 0.7,
    keyIntensity: 2.2,
    logoColor: "#c8860b",
    exposure: 1.4,
  },
  {
    id: "silver",
    label: "Silver",
    coinColor: "#a0a8b8",
    metalness: 0.95,
    roughness: 0.12,
    lightHue: "#aaccff",
    rimIntensity: 3.0,
    ambIntensity: 0.6,
    keyIntensity: 2.5,
    logoColor: "#8898aa",
    exposure: 1.3,
  },
  {
    id: "copper",
    label: "Copper",
    coinColor: "#b55a2a",
    metalness: 0.82,
    roughness: 0.28,
    lightHue: "#ff8844",
    rimIntensity: 2.0,
    ambIntensity: 0.65,
    keyIntensity: 2.0,
    logoColor: "#a04020",
    exposure: 1.3,
  },
  {
    id: "dark",
    label: "Dark",
    coinColor: "#222228",
    metalness: 0.97,
    roughness: 0.08,
    lightHue: "#4488ff",
    rimIntensity: 4.0,
    ambIntensity: 0.3,
    keyIntensity: 1.5,
    logoColor: "#3344aa",
    exposure: 1.5,
  },
  {
    id: "neon",
    label: "Neon",
    coinColor: "#0a1a1a",
    metalness: 0.92,
    roughness: 0.1,
    lightHue: "#00ffcc",
    rimIntensity: 6.0,
    ambIntensity: 0.2,
    keyIntensity: 1.2,
    logoColor: "#00ffcc",
    exposure: 1.6,
  },
];

export const TOKEN_PRESETS: TokenPreset[] = [
  {
    id: "bitcoin",
    label: "Bitcoin",
    ticker: "$BTC",
    tagline: "Digital gold. Sound money.",
    chain: "Bitcoin Network",
    coinGeckoId: "bitcoin",
    overlayAccent: "#f7931a",
    overlayBadgeBg: "#f7931a",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M63.5,46.5c1.8-1.2,3-3.1,3-5.5c0-4.5-3.5-7.5-8.5-8l0-7h-5l0,6.8H48l0-6.8h-5l0,6.8h-9v5h3.5c1.4,0,2.5,1.1,2.5,2.5v19c0,1.4-1.1,2.5-2.5,2.5H34v5h9V74h5v-6.8h5V74h5v-7.1c5.5-0.7,9.5-3.9,9.5-9C67.5,54.5,65.3,51.5,63.5,46.5z M45,40h8c2.8,0,5,1.1,5,3.5S55.8,47,53,47h-8V40z M54,62H45v-8h9c3.1,0,5.5,1.2,5.5,4S57.1,62,54,62z"/>
    </svg>`,
    material: {
      id: "btc",
      label: "Bitcoin",
      coinColor: "#f7931a",
      metalness: 0.9,
      roughness: 0.15,
      lightHue: "#ffd27a",
      rimIntensity: 3.0,
      ambIntensity: 0.65,
      keyIntensity: 2.4,
      logoColor: "#ffffff",
      exposure: 1.45,
    },
  },
  {
    id: "ethereum",
    label: "Ethereum",
    ticker: "$ETH",
    tagline: "Programmable money.",
    chain: "Ethereum Mainnet",
    coinGeckoId: "ethereum",
    overlayAccent: "#a0b4ff",
    overlayBadgeBg: "#627eea",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50,15 L27,51 L50,63 L73,51 Z"/>
      <path d="M50,68 L27,54 L50,85 L73,54 Z"/>
    </svg>`,
    material: {
      id: "eth",
      label: "Ethereum",
      coinColor: "#627eea",
      metalness: 0.93,
      roughness: 0.1,
      lightHue: "#a0b4ff",
      rimIntensity: 3.5,
      ambIntensity: 0.5,
      keyIntensity: 2.0,
      logoColor: "#ffffff",
      exposure: 1.35,
    },
  },
  {
    id: "solana",
    label: "Solana",
    ticker: "$SOL",
    tagline: "Fast. Cheap. Unstoppable.",
    chain: "Solana Mainnet",
    coinGeckoId: "solana",
    overlayAccent: "#14f195",
    overlayBadgeBg: "#9945ff",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M22,65h47.5c0.8,0,1.5,0.3,2.1,0.9l6.4,6.4c0.9,0.9,0.3,2.7-1,2.7H29.5c-0.8,0-1.5-0.3-2.1-0.9l-6.4-6.4C20.1,66.8,20.7,65,22,65z"/>
      <path d="M22,24h47.5c0.8,0,1.5,0.3,2.1,0.9l6.4,6.4c0.9,0.9,0.3,2.7-1,2.7H29.5c-0.8,0-1.5-0.3-2.1-0.9l-6.4-6.4C20.1,25.8,20.7,24,22,24z"/>
      <path d="M78,44.5H30.5c-0.8,0-1.5-0.3-2.1-0.9l-6.4-6.4c-0.9-0.9-0.3-2.7,1-2.7h47.5c0.8,0,1.5,0.3,2.1,0.9l6.4,6.4C79.9,42.7,79.3,44.5,78,44.5z" transform="translate(0,12)"/>
    </svg>`,
    material: {
      id: "sol",
      label: "Solana",
      coinColor: "#9945ff",
      metalness: 0.88,
      roughness: 0.08,
      lightHue: "#14f195",
      rimIntensity: 5.5,
      ambIntensity: 0.25,
      keyIntensity: 1.4,
      logoColor: "#ffffff",
      exposure: 1.55,
    },
  },
  {
    id: "algorand",
    label: "Algorand",
    ticker: "$ALGO",
    tagline: "The future of finance.",
    chain: "Algorand Mainnet",
    coinGeckoId: "algorand",
    overlayAccent: "#00b4d8",
    overlayBadgeBg: "#0077b6",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M 36 80 L 46 45 L 38 45 L 48 10 L 58 10 L 50 40 L 58 40 L 64 20 L 74 20 L 66 45 L 74 45 L 64 80 Z"/>
    </svg>`,
    material: {
      id: "algo",
      label: "Algorand",
      coinColor: "#00b4d8",
      metalness: 0.96,
      roughness: 0.07,
      lightHue: "#90e0ef",
      rimIntensity: 4.5,
      ambIntensity: 0.3,
      keyIntensity: 1.6,
      logoColor: "#ffffff",
      exposure: 1.5,
    },
  },
  {
    id: "avalanche",
    label: "Avalanche",
    ticker: "$AVAX",
    tagline: "Blazingly fast. Infinitely scalable.",
    chain: "Avalanche C-Chain",
    coinGeckoId: "avalanche-2",
    overlayAccent: "#ff8c8c",
    overlayBadgeBg: "#e84142",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50,18 L82,78 H62 L50,56 L38,78 H18 Z"/>
    </svg>`,
    material: {
      id: "avax",
      label: "Avalanche",
      coinColor: "#e84142",
      metalness: 0.85,
      roughness: 0.16,
      lightHue: "#ff8c8c",
      rimIntensity: 3.5,
      ambIntensity: 0.55,
      keyIntensity: 2.2,
      logoColor: "#ffffff",
      exposure: 1.4,
    },
  },
  {
    id: "chainlink",
    label: "Chainlink",
    ticker: "$LINK",
    tagline: "Connecting smart contracts to the world.",
    chain: "Ethereum Mainnet",
    coinGeckoId: "chainlink",
    overlayAccent: "#6fa8f5",
    overlayBadgeBg: "#375bd2",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50,12 L62,19 L62,19 L74,26 L74,50 L74,74 L62,81 L50,88 L38,81 L26,74 L26,50 L26,26 L38,19 Z M50,30 L38,37 L38,63 L50,70 L62,63 L62,37 Z"/>
    </svg>`,
    material: {
      id: "link",
      label: "Chainlink",
      coinColor: "#375bd2",
      metalness: 0.91,
      roughness: 0.12,
      lightHue: "#6fa8f5",
      rimIntensity: 3.8,
      ambIntensity: 0.45,
      keyIntensity: 1.8,
      logoColor: "#ffffff",
      exposure: 1.4,
    },
  },
  {
    id: "custom",
    label: "Custom",
    ticker: "$TOKEN",
    tagline: "Your project here.",
    chain: "Your Chain",
    coinGeckoId: "",
    overlayAccent: "#c8960e",
    overlayBadgeBg: "#c8960e",
    svg: "",
    material: MATERIAL_PRESETS[0] as MaterialPreset,
  },
];
export const TF_OPTIONS: {
  value: string;
  label: string;
  days: string;
  slice: number | null;
}[] = [
  { value: "1h", label: "1H", days: "1", slice: 60 },
  { value: "1d", label: "1D", days: "1", slice: null },
  { value: "7d", label: "7D", days: "7", slice: null },
  { value: "30d", label: "30D", days: "30", slice: null },
];

export const FONTS = [
  { value: "Courier New", label: "Courier New" },
  { value: "Georgia", label: "Georgia" },
  { value: "Arial", label: "Arial" },
  { value: "Impact", label: "Impact" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Palatino Linotype", label: "Palatino" },
  { value: "Lucida Console", label: "Lucida Console" },
];

export const EXPORT_RESOLUTIONS = [
  { value: "720", label: "720p", size: 720 },
  { value: "1080", label: "1080p", size: 1080 },
  { value: "2160", label: "4K", size: 2160 },
];

export const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1", hint: "Square" },
  { value: "9:16", label: "9:16", hint: "Story" },
  { value: "16:9", label: "16:9", hint: "Banner" },
];
