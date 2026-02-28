import { useState, useRef } from "react";
import type {
  ExportResolution,
  OverlaySettings,
  ChartSettings,
  ChartData,
  PostFX,
  ColorGrade,
  CoinSettings,
} from "../types";
import type { CoinEngine } from "../lib/CoinEngine";
import { drawOverlay, createAnimState } from "../lib/overlayUtils";
import { defaultConfetti } from "../lib/confetti";
import { defaultChartAnim } from "../lib/chartAnim";
import { EXPORT_RESOLUTIONS, ASPECT_RATIOS } from "../lib/presets";
import {
  SectionLabel,
  CheckRow,
  ToggleGroup,
  PrimaryBtn,
  DimBtn,
  Advanced,
  Slider,
} from "./ui";

interface Props {
  engine: CoinEngine | null;
  coin: CoinSettings;
  overlay: OverlaySettings;
  chart: ChartSettings;
  chartData: ChartData | null;
  fx: PostFX;
  grade: ColorGrade;
  bgColor: string;
  bgImg: HTMLImageElement | null;
}

const RES_OPTS: { value: ExportResolution; label: string }[] =
  EXPORT_RESOLUTIONS.map((r) => ({
    value: r.value as ExportResolution,
    label: r.label,
  }));

function downloadCanvas(canvas: HTMLCanvasElement, name: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }, "image/png");
}

function aspectDimensions(aspect: string, base: number): [number, number] {
  if (aspect === "9:16") return [base, Math.round((base * 16) / 9)];
  if (aspect === "16:9") return [Math.round((base * 16) / 9), base];
  return [base, base];
}

export function PanelExport({
  engine,
  coin,
  overlay,
  chart,
  chartData,
  fx,
  grade,
  bgColor,
  bgImg,
}: Props) {
  const [transparent, setTransparent] = useState(false);
  const [resolution, setResolution] = useState<ExportResolution>("1080");
  const [seqFrames, setSeqFrames] = useState(48);
  const [recDuration, setRecDuration] = useState(3);
  const [status, setStatus] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  function getBase(): number {
    return EXPORT_RESOLUTIONS.find((r) => r.value === resolution)?.size ?? 1080;
  }

  function savePng() {
    if (!engine) return;
    const frame = engine.snapshot(transparent, bgColor, bgImg, fx, grade);
    downloadCanvas(frame, "coin.png");
    setStatus("PNG saved ✓");
  }

  async function savePngSeq() {
    if (!engine) return;
    setStatus("Exporting sequence…");
    const total = seqFrames;
    // Access the engine's internal autoAngle directly for deterministic frames
    const eng = engine as unknown as {
      autoAngle: number;
      renderer: { render: (s: unknown, c: unknown) => void };
      scene: unknown;
      camera: unknown;
    };
    const savedAngle = eng.autoAngle;
    for (let i = 0; i < total; i++) {
      eng.autoAngle = (i / total) * Math.PI * 2;
      eng.renderer.render(eng.scene, eng.camera);
      // Wait one RAF so applyPostFX runs and fxCanvas is updated
      await new Promise((r) => requestAnimationFrame(r));
      const frame = engine.snapshot(transparent, bgColor, bgImg, fx, grade);
      downloadCanvas(frame, `coin_${String(i).padStart(4, "0")}.png`);
      await new Promise((r) => setTimeout(r, 60));
      setStatus(`Exporting… ${i + 1}/${total}`);
    }
    eng.autoAngle = savedAngle;
    setStatus("Sequence done ✓");
  }

  function savePost() {
    if (!engine) return;
    const base = getBase();
    const [W, H] = aspectDimensions(overlay.aspect, base);
    const frame = engine.snapshot(false, bgColor, bgImg, fx, grade);

    const out = Object.assign(document.createElement("canvas"), {
      width: W,
      height: H,
    });
    const ctx = out.getContext("2d")!;

    // BG
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);
    if (bgImg) ctx.drawImage(bgImg, 0, 0, W, H);

    // Coin centered
    const coinAR = frame.width / frame.height;
    const fitW = Math.min(W, H * coinAR) * 0.75;
    const fitH = fitW / coinAR;
    ctx.drawImage(frame, (W - fitW) / 2, (H - fitH) / 2 - H * 0.04, fitW, fitH);

    // Overlay + chart
    drawOverlay(
      ctx,
      W,
      H,
      overlay,
      chart,
      chartData,
      defaultConfetti(),
      { ...defaultChartAnim(), duration: 0 },
      createAnimState(),
    );

    downloadCanvas(out, `post_${overlay.aspect.replace(":", "x")}.png`);
    setStatus("Post PNG saved ✓");
  }

  function toggleRecord() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    if (!engine) return;
    // getStreamCanvas() returns a correctly-sized canvas (accounts for DPR)
    // that is kept in sync with fxCanvas every animation frame
    const streamCanvas = engine.getStreamCanvas();
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const mr = new MediaRecorder(streamCanvas.captureStream(60), {
      mimeType: mime,
      videoBitsPerSecond: 12_000_000,
    });
    const chunks: Blob[] = [];
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mr.onstop = () => {
      setRecording(false);
      const blob = new Blob(chunks, { type: mime });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "coin.webm";
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus("WebM saved ✓");
    };
    mr.start(100);
    setRecording(true);
    recorderRef.current = mr;
    setStatus(`Recording ${recDuration}s…`);
    setTimeout(() => {
      if (mr.state !== "inactive") mr.stop();
    }, recDuration * 1000);
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Export</SectionLabel>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-neutral-500">Resolution</span>
        <ToggleGroup
          options={RES_OPTS}
          value={resolution}
          onChange={setResolution}
          cols={3}
        />
      </div>

      <CheckRow
        label="Transparent Background"
        checked={transparent}
        onChange={setTransparent}
      />

      <div className="flex gap-2">
        <DimBtn onClick={savePng}>📷 PNG</DimBtn>
        <DimBtn onClick={savePngSeq}>🎞 Sequence</DimBtn>
      </div>

      {overlay.enabled && (
        <PrimaryBtn onClick={savePost}>⬇ Save Post PNG</PrimaryBtn>
      )}
      {/* 
      <button
        onClick={toggleRecord}
        className={`w-full py-2 text-sm font-mono tracking-wide rounded border transition-all cursor-pointer
          ${
            recording
              ? "border-red-500 bg-red-950 text-red-400 animate-pulse"
              : "border-red-900 bg-red-950/40 text-red-500 hover:border-red-600 hover:text-red-300"
          }`}
      >
        {recording ? "⏹ Stop Recording" : "⏺ Record WebM"}
      </button> */}

      {status && (
        <p className="text-sm text-neutral-400 text-center">{status}</p>
      )}

      {/* <Advanced>
        <Slider
          label="Rec. Duration"
          min={1}
          max={20}
          step={1}
          value={recDuration}
          display={(v) => Math.round(v) + "s"}
          onChange={(v) => setRecDuration(Math.round(v))}
        />
        <Slider
          label="Seq. Frames"
          min={12}
          max={120}
          step={4}
          value={seqFrames}
          display={(v) => Math.round(v).toString()}
          onChange={(v) => setSeqFrames(Math.round(v))}
        />
        <p className="text-sm text-neutral-500">
          ffmpeg -i coin.webm -c:v libx264 coin.mp4
        </p>
        <p className="text-sm text-neutral-500">
          ffmpeg -r 30 -i coin_%04d.png -vf fps=30 coin.gif
        </p>
      </Advanced> */}
    </div>
  );
}
