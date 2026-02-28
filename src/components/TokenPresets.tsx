import { TOKEN_PRESETS } from "../lib/presets";
import type { TokenPreset } from "../types";

interface Props {
  active: string;
  onSelect: (id: string) => void;
}

const ACCENT_MAP: Record<string, string> = {
  bitcoin: "border-orange-500/60 bg-orange-950/30",
  ethereum: "border-indigo-500/60 bg-indigo-950/30",
  solana: "border-violet-500/60 bg-violet-950/30",
  algorand: "border-cyan-500/60 bg-cyan-950/30",
  avalanche: "border-red-500/60 bg-red-950/30",
  chainlink: "border-blue-500/60 bg-blue-950/30",
  custom: "border-amber-500/60 bg-amber-950/20",
};

const TICKER_COLOR: Record<string, string> = {
  bitcoin: "text-orange-400",
  ethereum: "text-indigo-400",
  solana: "text-violet-400",
  algorand: "text-cyan-400",
  avalanche: "text-red-400",
  chainlink: "text-blue-400",
  custom: "text-amber-400",
};

export function TokenPresets({ active, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TOKEN_PRESETS.map((t: TokenPreset) => {
        const isActive = active === t.id;
        const accent = ACCENT_MAP[t.id] ?? "border-neutral-700 bg-neutral-900";
        const tickerCol = TICKER_COLOR[t.id] ?? "text-amber-400";
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`flex flex-col items-start gap-0.5 p-2.5 rounded border transition-all cursor-pointer text-left
              ${
                isActive
                  ? `${accent} ring-1 ring-inset ring-white/10`
                  : "border-neutral-800 bg-neutral-950 hover:border-neutral-600"
              }`}
          >
            <span
              className={`text-sm font-bold font-mono tracking-wider ${tickerCol}`}
            >
              {t.ticker}
            </span>
            <span className="text-xs text-neutral-400 leading-tight">
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
