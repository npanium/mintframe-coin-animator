import type { RotationMode, LightSettings } from "../types";
import { SectionLabel, Slider, ColorRow, Advanced, ToggleGroup } from "./ui";

interface Props {
  rotMode: RotationMode;
  rotSpeed: number;
  tiltX: number;
  light: LightSettings;
  onRotMode: (m: RotationMode) => void;
  onRotSpeed: (v: number) => void;
  onTiltX: (v: number) => void;
  onLight: (l: Partial<LightSettings>) => void;
}

const ROT_OPTIONS: { value: RotationMode; label: string }[] = [
  { value: "y", label: "Y" },
  { value: "x", label: "X" },
  { value: "z", label: "Z" },
  { value: "xy", label: "XY" },
  { value: "drag", label: "Drag" },
];

export function PanelAnimation({
  rotMode,
  rotSpeed,
  tiltX,
  light,
  onRotMode,
  onRotSpeed,
  onTiltX,
  onLight,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Animation</SectionLabel>

      <ToggleGroup
        options={ROT_OPTIONS}
        value={rotMode}
        onChange={onRotMode}
        cols={5}
      />
      <Slider
        label="Speed"
        min={0}
        max={4}
        step={0.05}
        value={rotSpeed}
        display={(v) => v.toFixed(2)}
        onChange={onRotSpeed}
      />
      <Slider
        label="Tilt X"
        min={-70}
        max={70}
        step={1}
        value={tiltX}
        display={(v) => Math.round(v) + "°"}
        onChange={onTiltX}
      />

      <SectionLabel>Lighting</SectionLabel>
      <ColorRow
        label="Light Hue"
        value={light.hue}
        onChange={(v) => onLight({ hue: v })}
      />
      <Slider
        label="Rim"
        min={0}
        max={10}
        step={0.1}
        value={light.rimIntensity}
        display={(v) => v.toFixed(1)}
        onChange={(v) => onLight({ rimIntensity: v })}
      />

      <Advanced>
        <Slider
          label="Key"
          min={0}
          max={5}
          step={0.05}
          value={light.keyIntensity}
          display={(v) => v.toFixed(2)}
          onChange={(v) => onLight({ keyIntensity: v })}
        />
        <Slider
          label="Ambient"
          min={0}
          max={2}
          step={0.02}
          value={light.ambIntensity}
          display={(v) => v.toFixed(2)}
          onChange={(v) => onLight({ ambIntensity: v })}
        />
        <Slider
          label="Exposure"
          min={0.5}
          max={3}
          step={0.05}
          value={light.exposure}
          display={(v) => v.toFixed(2)}
          onChange={(v) => onLight({ exposure: v })}
        />
      </Advanced>
    </div>
  );
}
