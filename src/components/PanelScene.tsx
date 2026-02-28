import type { SceneSettings, CoinLayout } from "../types";
import { SectionLabel, Slider, CheckRow, ToggleGroup } from "./ui";

interface Props {
  scene: SceneSettings;
  vsEnabled: boolean;
  onScene: (s: Partial<SceneSettings>) => void;
}

const LAYOUT_OPTS: { value: CoinLayout; label: string }[] = [
  { value: "row", label: "Row" },
  { value: "arc", label: "Arc" },
  { value: "circle", label: "Circle" },
  { value: "grid", label: "Grid" },
];

export function PanelScene({ scene, vsEnabled, onScene }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <SectionLabel>Scene</SectionLabel>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Arrange multiple coins in one frame. All coins share the same material
          set in the Coin tab.
          {vsEnabled && (
            <span className="text-amber-500/80">
              {" "}
              VS Mode is active — disable it to use Scene controls.
            </span>
          )}
        </p>
      </div>

      <Slider
        label="Coin Count"
        min={1}
        max={7}
        step={1}
        value={scene.coinCount}
        display={(v) => Math.round(v).toString()}
        onChange={(v) => onScene({ coinCount: Math.round(v) })}
        disabled={vsEnabled}
      />

      <div className="flex flex-col gap-1">
        <span
          className={`text-xs ${vsEnabled ? "text-neutral-700" : "text-neutral-500"}`}
        >
          Layout
        </span>
        <ToggleGroup
          options={LAYOUT_OPTS}
          value={scene.layout}
          onChange={(v) => onScene({ layout: v })}
          cols={4}
          disabled={vsEnabled}
        />
      </div>

      <Slider
        label="Camera Zoom"
        min={0.4}
        max={3}
        step={0.05}
        value={scene.cameraZoom}
        display={(v) => `${v.toFixed(2)}×`}
        onChange={(v) => onScene({ cameraZoom: v })}
        disabled={vsEnabled}
      />

      <CheckRow
        label="Stagger spin (phase offset)"
        checked={scene.phaseOffset}
        onChange={(v) => onScene({ phaseOffset: v })}
        disabled={vsEnabled}
      />

      {/* Layout preview diagram */}
      {!vsEnabled && scene.coinCount > 1 && (
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/60">
          <LayoutPreview count={scene.coinCount} layout={scene.layout} />
        </div>
      )}
    </div>
  );
}

// Simple dot-diagram preview of the layout
function LayoutPreview({
  count,
  layout,
}: {
  count: number;
  layout: CoinLayout;
}) {
  const dots = Array.from({ length: count });
  const positions = dots.map((_, i) => getDotPos(i, count, layout));
  const W = 120,
    H = 60;
  const R = 6;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-neutral-600">Layout preview</span>
      <svg width={W} height={H} className="opacity-60">
        {positions.map((pos, i) => (
          <circle
            key={i}
            cx={W / 2 + pos.x}
            cy={H / 2 + pos.y}
            r={R}
            fill="#d4900a"
            opacity={0.7}
          />
        ))}
      </svg>
    </div>
  );
}

function getDotPos(
  i: number,
  n: number,
  layout: CoinLayout,
): { x: number; y: number } {
  const spread = n <= 3 ? 22 : n <= 5 ? 18 : 14;
  const half = (n - 1) / 2;
  const t = i - half;

  switch (layout) {
    case "arc":
      return { x: t * spread, y: Math.cos((i / (n - 1)) * Math.PI) * -14 };
    case "circle": {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r = spread * (n / (2 * Math.PI));
      return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
    }
    case "grid": {
      const cols = Math.ceil(Math.sqrt(n));
      const row = Math.floor(i / cols);
      const col = i % cols;
      const colsInRow = Math.min(cols, n - row * cols);
      return {
        x: (col - (colsInRow - 1) / 2) * spread,
        y: (row - (Math.ceil(n / cols) - 1) / 2) * spread * 0.85,
      };
    }
    default: // row
      return { x: t * spread, y: 0 };
  }
}
