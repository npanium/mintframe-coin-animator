import { useEffect, useRef } from "react";
import { CoinEngine } from "../lib/CoinEngine";
import {
  drawOverlay,
  createAnimState,
  type OverlayAnimState,
} from "../lib/overlayUtils";
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
  ConfettiSettings,
  ChartAnimSettings,
  VsSettings,
  SceneSettings,
  BgGradient,
} from "../types";

interface Props {
  coin: CoinSettings;
  logo: LogoSettings;
  light: LightSettings;
  fx: PostFX;
  grade: ColorGrade;
  renderStyle: RenderStyle;
  rotMode: RotationMode;
  rotSpeed: number;
  tiltX: number;
  bgColor: string;
  bgGradient: BgGradient;
  bgImg: HTMLImageElement | null;
  overlay: OverlaySettings;
  chart: ChartSettings;
  chartData: ChartData | null;
  confetti: ConfettiSettings;
  chartAnim: ChartAnimSettings;
  vs: VsSettings;
  vsChartData: ChartData | null;
  scene: SceneSettings;
  onEngineReady?: (engine: CoinEngine) => void;
}

const PREVIEW_W = 480;
const PREVIEW_H = 480;

export function CoinCanvas({
  coin,
  logo,
  light,
  fx,
  grade,
  renderStyle,
  rotMode,
  rotSpeed,
  tiltX,
  bgColor,
  bgGradient,
  bgImg,
  overlay,
  chart,
  chartData,
  confetti,
  chartAnim,
  vs,
  vsChartData,
  scene,
  onEngineReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const mCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CoinEngine | null>(null);
  const animStateRef = useRef<OverlayAnimState>(createAnimState());

  // Refs so RAF loop always sees fresh values without re-subscribing
  const overlayRef = useRef({
    overlay,
    chart,
    chartData,
    confetti,
    chartAnim,
    vs,
    vsChartData,
  });
  overlayRef.current = {
    overlay,
    chart,
    chartData,
    confetti,
    chartAnim,
    vs,
    vsChartData,
  };
  const bgRef = useRef({ bgColor, bgGradient, bgImg });
  bgRef.current = { bgColor, bgGradient, bgImg };

  // ── Init once ────────────────────────────────────────────────
  useEffect(() => {
    const engine = new CoinEngine(glCanvasRef.current!, fxCanvasRef.current!);
    engineRef.current = engine;
    engine.resize(PREVIEW_W, PREVIEW_H);
    engine.attachDrag(containerRef.current!);
    onEngineReady?.(engine);
    engine.start();
    return () => engine.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── RAF: postFX + overlay ────────────────────────────────────
  useEffect(() => {
    let rafId = 0;
    const fxC = fxCanvasRef.current!;
    const mCv = mCanvasRef.current!;
    const fxCtx = fxC.getContext("2d")!;
    const mCtx = mCv.getContext("2d")!;

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const engine = engineRef.current;
      if (!engine) return;
      const { bgColor: bc, bgGradient: bg, bgImg: bi } = bgRef.current;
      engine.applyPostFX(
        fxCtx,
        fxC.width,
        fxC.height,
        fx,
        bc,
        bi,
        grade,
        bg.mode !== "solid" ? bg : null,
      );

      mCtx.clearRect(0, 0, mCv.width, mCv.height);
      const {
        overlay: ov,
        chart: ch,
        chartData: cd,
        confetti: cf,
        chartAnim: ca,
        vs: v,
        vsChartData: vcd,
      } = overlayRef.current;
      const needDraw = ov.enabled || cf.enabled || v.enabled;
      if (needDraw) {
        const workingOv = ov.enabled
          ? ov
          : {
              ...ov,
              enabled: true,
              bgAlpha: 0,
              chainBadge: "",
              tokenName: "",
              tagline: "",
            };
        drawOverlay(
          mCtx,
          mCv.width,
          mCv.height,
          workingOv,
          ch,
          ov.enabled ? cd : null,
          cf,
          ca,
          animStateRef.current,
          v.enabled ? { rightData: vcd, settings: v } : undefined,
        );
      }
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [fx, grade]);

  // ── Coin / logo / light / render style ───────────────────────
  useEffect(() => {
    engineRef.current?.applyCoinSettings(coin);
  }, [coin]);
  useEffect(() => {
    engineRef.current?.rebuildLogo(
      logo.svg,
      logo,
      coin.thickness,
      coin.rimStep,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logo]);
  useEffect(() => {
    engineRef.current?.applyLightSettings(light);
  }, [light]);
  useEffect(() => {
    engineRef.current?.applyRenderStyle(renderStyle);
  }, [renderStyle]);
  useEffect(() => {
    engineRef.current?.setRotation(rotMode, rotSpeed, tiltX);
  }, [rotMode, rotSpeed, tiltX]);

  // ── VS mode: slot 1 = right coin ─────────────────────────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (vs.enabled) {
      engine.setCoinCount(2, "row", false); // lockstep for VS looks cleaner
      engine.setCameraZoom(vs.cameraZoom);
      engine.setSlotCoin(1, vs.rightCoin);
      engine.setSlotLogo(1, vs.rightLogo.svg, vs.rightLogo);
    } else {
      // Fall back to scene mode
      engine.setCoinCount(scene.coinCount, scene.layout, scene.phaseOffset);
      engine.setCameraZoom(scene.cameraZoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vs.enabled, vs.cameraZoom, vs.rightCoin, vs.rightLogo]);

  // ── Scene mode (only when VS is off) ─────────────────────────
  useEffect(() => {
    if (vs.enabled) return;
    const engine = engineRef.current;
    if (!engine) return;
    engine.setCoinCount(scene.coinCount, scene.layout, scene.phaseOffset);
    engine.setCameraZoom(scene.cameraZoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    vs.enabled,
    scene.coinCount,
    scene.layout,
    scene.cameraZoom,
    scene.phaseOffset,
  ]);

  // ── Chart anim reset ─────────────────────────────────────────
  useEffect(() => {
    animStateRef.current.chartStarted = false;
    animStateRef.current.chartElapsed = 0;
  }, [chartData]);

  // ── Confetti burst reset ──────────────────────────────────────
  useEffect(() => {
    if (confetti.burst) animStateRef.current.burstDone = false;
  }, [confetti.enabled, confetti.burst]);

  const cursor =
    rotMode === "drag"
      ? "cursor-grab active:cursor-grabbing"
      : "cursor-default";

  return (
    <div className="relative" style={{ width: PREVIEW_W, height: PREVIEW_H }}>
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden ${cursor}`}
      >
        <canvas
          ref={glCanvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ display: "none" }}
        />
        <canvas
          ref={fxCanvasRef}
          className="absolute inset-0"
          width={PREVIEW_W}
          height={PREVIEW_H}
          style={{ width: PREVIEW_W, height: PREVIEW_H }}
        />
        <canvas
          ref={mCanvasRef}
          className="absolute inset-0 pointer-events-none"
          width={PREVIEW_W}
          height={PREVIEW_H}
          style={{ width: PREVIEW_W, height: PREVIEW_H }}
        />
      </div>
    </div>
  );
}
