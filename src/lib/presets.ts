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
    svg: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
	<style type="text/css">
		.st0{fill:#F39321;}
	</style>
	<path class="st0" d="M76.5 52.9c2.1-1.1 4.1-1.8 5.7-3.2 6.1-5.5 7.8-18.3-2.2-24.5-3.1-1.9-6.4-3.4-10-4.8.6-4.8 2.5-9.2 3.1-14.1-2.9-.7-5.7-1.7-8.5-2-1.2 4.6-2.3 9-3.5 13.5-2.2-.7-4.5-.6-6.5-1.8.7-4.7 2.5-9 3-13.7-3-.5-5.6-1.6-8.5-1.8-1.2 4.6-2.3 9-3.4 13.7-5.8-.9-11.1-2.9-17-4-1.3 2.9-1.9 5.9-2.4 9.2 1.9.5 3.6.8 5.2 1.2 4.2 1 5.3 3.3 4.3 6.9-.7 2.6-1.3 5.2-2 7.9-2.3 9.4-4.7 18.9-7 28.3-.5 2.1-1.9 2.8-4 2.5-2.1-.3-4.1-1.3-6.5-1.2-1 3.2-3 6.1-3.7 9.7 5.6 1.4 11 2.8 16.6 4.2-.4 4.9-2.5 9.4-3.1 14.4 2.8.7 5.5 1.3 8.3 2 1.8-4.5 2.3-9.3 4-14 2.1 1.1 4.3.7 6.3 2.1-1.1 4.5-2.2 9-3.3 13.6 2.9 1 5.7 1.5 8.7 2.2 1.2-4.7 2.3-9.3 3.4-13.7.7-.4 1.2-.3 1.7-.2 4.6 1 9.2 1.2 13.8.7 4-.4 7.6-2 10.4-5 3.2-3.3 4.8-7.4 5.5-11.8.6-3.6.5-7.2-1.6-10.4C81.8 56.4 79.5 54.5 76.5 52.9zM67.2 68.1c-1 3.2-3.3 4.8-6.5 5.3-5.9 1.1-11.5-.4-17.2-1.8-.7-.2-1.4-.4-2.4-.7 1.5-6.2 3-12.2 4.5-18.4 4 .3 7.7 1.5 11.3 2.7 3.1 1.1 6 2.3 8.3 4.8C67.5 62.4 68 65.1 67.2 68.1zM69.9 40.3c-.8 2.8-3.3 4.9-6.5 5.3-5.2.7-10.1-.7-15.5-2.1 1.4-5.6 2.7-11.1 4.1-16.6 1.7-.5 3.1.3 4.5.6 3.7.8 7.4 2 10.5 4.3C69.8 33.9 70.8 36.9 69.9 40.3z" />
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
    svg: `<svg version="1.1" id="Layer_2_00000021100155478670109350000010533719273711878307_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve">
	<style type="text/css">
		.st0{fill:#131313;}
	.st1{fill:#828384;}
	</style>
	<path d="M250 6.6 102.4 251.1 250 341.3 398 251.1Z" class="st0" />
	<path d="M250 372.3 102.4 284.6 250 493.1 398 284.6Z" class="st1" />
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
    svg: `<svg version="1.1" id="sol" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve">
	<style type="text/css">
		.st0{fill-rule:evenodd;clip-rule:evenodd;}
	</style>
	<path class="st0" d="M22.5 205.7h392.2c4.9 0 9.5 1.9 12.9 5.4l62 62.4c11.5 11.5 3.4 31.2-12.9 31.2H84.5c-4.9 0-9.5-1.9-12.9-5.4l-62-62.4C-1.9 225.5 6.2 205.7 22.5 205.7z" />
	<path class="st0" d="M9.5 123l62-62.4c3.6-3.6 8.1-5.4 12.9-5.4h392c16.3 0 24.6 19.7 12.9 31.2l-61.9 62.4c-3.4 3.6-8.1 5.4-12.9 5.4h-392C6.2 154.2-1.9 134.5 9.5 123z" />
	<path class="st0" d="M489.4 387.7l-62 62.5c-3.4 3.4-8.1 5.4-12.9 5.4h-392c-16.3 0-24.4-19.7-13.1-31.2l62-62.5c3.6-3.4 8.1-5.4 12.9-5.4h392C492.8 356.4 501.1 376 489.4 387.7z" />
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
    svg: `<svg version="1.1" id="ALGO" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
	<path d="M99.7 99.8H84.2L74 62.1 52.3 99.8H34.9l33.6-58.3-5.4-20.3L17.7 99.8H.3L57.8.2h15.3L79.7 25h15.7L84.7 43.6 99.7 99.8z" />
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
    svg: `<svg version="1.1" id="avax" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve">
	<path class="st1" d="M338.2 256.5c8.7-15 22.6-15 31.3 0l53.9 94.7c8.7 15 1.6 27.2-15.7 27.2H299c-17.1 0-24.2-12.2-15.7-27.2L338.2 256.5z" />
	<path class="st1" d="M233.9 74.2c8.7-15 22.4-15 31.1 0l12 21.7 28.3 49.8c6.9 14.2 6.9 30.9 0 45.1l-95.1 164.8c-8.7 13.4-23 21.9-39 22.8H92.3c-17.3 0-24.4-12-15.7-27.2L233.9 74.2z" />
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
    svg: `<svg version="1.1" id="LINK" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve">

<path class="st0" d="M250,6l-44.8,25.7l-122,70.5L38.5,128v244l44.8,25.7l123.1,70.5l44.8,25.7l44.8-25.7l120.9-70.5l44.8-25.7V128
	l-44.8-25.7l-122-70.5C294.8,31.8,250,6,250,6z M128,320.5v-141L250,109l122,70.5v141L250,391L128,320.5z"/>
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
  // { value: "9:16", label: "9:16", hint: "Story" },
  // { value: "16:9", label: "16:9", hint: "Banner" },
];
