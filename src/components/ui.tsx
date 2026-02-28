import { type ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

// ── Section label ──
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-bold tracking-widest text-neutral-400 uppercase border-b border-neutral-800 pb-1">
      {children}
    </div>
  );
}

// ── Slider row ──
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display?: (v: number) => string;
  onChange: (v: number) => void;
  disabled?: boolean;
}
export function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  disabled,
}: SliderProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm ${disabled ? "opacity-35 pointer-events-none" : ""}`}
    >
      <span className="text-neutral-400 w-24 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="flex-1 accent-amber-500 cursor-pointer h-0.5 disabled:cursor-not-allowed"
      />
      <span className="text-neutral-200 w-10 text-right shrink-0 tabular-nums">
        {display ? display(value) : value}
      </span>
    </div>
  );
}

// ── Color row ──
export function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-400">
      <span className="flex-1">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-6 border border-neutral-700 bg-transparent cursor-pointer rounded"
      />
    </div>
  );
}

// ── Toggle button group ──
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  cols = 3,
  disabled = false,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  cols?: number;
  disabled?: boolean;
}) {
  return (
    <div
      className={`grid gap-1 ${disabled ? "opacity-35 pointer-events-none" : ""}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => !disabled && onChange(o.value)}
          className={`py-1.5 text-sm rounded border transition-all cursor-pointer ${
            value === o.value
              ? "border-amber-500 text-amber-400 bg-amber-950"
              : "border-neutral-800 text-neutral-500 bg-neutral-950 hover:border-neutral-600 hover:text-neutral-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Checkbox row ──
export function CheckRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2 text-sm text-neutral-300 select-none ${disabled ? "opacity-35 pointer-events-none cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="accent-amber-500 w-4 h-4"
      />
      {label}
    </label>
  );
}

// ── Text input ──
export function TextInput({
  label,
  value,
  onChange,
  large,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  large?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-neutral-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded px-2 py-1.5 font-mono outline-none focus:border-amber-600 ${large ? "text-base" : "text-sm"}`}
      />
    </div>
  );
}

// ── Collapsible Advanced section ──
export function Advanced({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors w-fit"
      >
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
        Advanced
      </button>
      {open && (
        <div className="flex flex-col gap-3 pl-1 border-l border-neutral-800">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Select ──
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm text-neutral-500">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 rounded px-2 py-1.5 text-sm font-mono cursor-pointer outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── FX toggle button ──
export function FxToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-1.5 text-sm rounded border transition-all cursor-pointer ${
        active
          ? "border-blue-500 text-blue-400 bg-blue-950"
          : "border-neutral-800 text-neutral-500 bg-neutral-950 hover:border-neutral-600 hover:text-neutral-300"
      }`}
    >
      {label}
    </button>
  );
}

// ── Primary action button ──
export function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2 text-sm font-bold tracking-widest uppercase rounded border border-amber-700 bg-amber-950 text-amber-400 hover:bg-amber-500 hover:text-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

// ── Dim button ──
export function DimBtn({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 py-1.5 text-sm rounded border border-neutral-800 bg-neutral-950 text-neutral-500 hover:text-neutral-200 hover:border-neutral-600 transition-all cursor-pointer disabled:opacity-40"
    >
      {children}
    </button>
  );
}
