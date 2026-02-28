import type {
  OverlaySettings,
  ChartSettings,
  ChartData,
  ConfettiSettings,
  ChartAnimSettings,
  VsSettings,
} from "../types";
import { drawChart, priceChange, formatPrice } from "./chartUtils";
import { drawAnimatedChart, computeProgress } from "./chartAnim";
import {
  drawParticles,
  updateParticles,
  spawnParticles,
  type Particle,
} from "./confetti";
import { TF_OPTIONS } from "./presets";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Animation state ──────────────────────────────────────────────
export interface OverlayAnimState {
  particles: Particle[];
  chartElapsed: number;
  chartStarted: boolean;
  lastFrameTime: number;
  burstDone: boolean;
}

export function createAnimState(): OverlayAnimState {
  return {
    particles: [],
    chartElapsed: 0,
    chartStarted: false,
    lastFrameTime: performance.now(),
    burstDone: false,
  };
}

// ─── Main entry point ─────────────────────────────────────────────
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  overlay: OverlaySettings,
  chart: ChartSettings,
  chartData: ChartData | null,
  confetti: ConfettiSettings,
  chartAnim: ChartAnimSettings,
  animState: OverlayAnimState,
  vs?: { rightData: ChartData | null; settings: VsSettings },
) {
  const now = performance.now();
  const dt = Math.min((now - animState.lastFrameTime) / 1000, 0.1);
  animState.lastFrameTime = now;

  const scale = W / 800;
  const pad = 28 * scale;
  const barH = H * 0.3;
  const barTop = H - barH;
  const fontFam = `'${overlay.font}', 'Courier New', monospace`;

  // Chart anim progress
  if (chart.enabled && chartData) {
    if (!animState.chartStarted) {
      animState.chartElapsed = 0;
      animState.chartStarted = true;
    }
    animState.chartElapsed += dt;
  } else {
    animState.chartStarted = false;
    animState.chartElapsed = 0;
  }
  const chartProgress =
    chart.enabled && chartData
      ? computeProgress(animState.chartElapsed, chartAnim)
      : 1;

  // Confetti
  if (confetti.enabled) {
    if (confetti.burst && !animState.burstDone) {
      animState.particles = spawnParticles(
        W,
        H,
        confetti,
        animState.particles,
        true,
      );
      animState.burstDone = true;
    } else if (!confetti.burst) {
      animState.particles = spawnParticles(
        W,
        H,
        confetti,
        animState.particles,
        false,
      );
    }
    animState.particles = updateParticles(
      animState.particles,
      confetti.gravity,
      dt,
    );
  } else {
    animState.particles = [];
    animState.burstDone = false;
  }

  const vsEnabled = vs?.settings?.enabled === true;

  if (vsEnabled) {
    drawVsLayout(
      ctx,
      W,
      H,
      overlay,
      chart,
      chartData,
      chartAnim,
      chartProgress,
      vs!,
      scale,
      fontFam,
      pad,
      barH,
      barTop,
    );
  } else {
    // Standard overlay
    if (chart.enabled && chartData && chart.mode === "bg") {
      drawChartAnimated(
        ctx,
        W,
        H,
        chartData,
        chart,
        chartAnim,
        chartProgress,
        overlay.font,
        barH,
      );
    }

    if (overlay.bgAlpha > 0) {
      const grad = ctx.createLinearGradient(0, barTop, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.4, `rgba(0,0,0,${overlay.bgAlpha})`);
      grad.addColorStop(
        1,
        `rgba(0,0,0,${Math.min(overlay.bgAlpha + 0.35, 0.95)})`,
      );
      ctx.fillStyle = grad;
      ctx.fillRect(0, barTop, W, barH);
    }

    if (overlay.tokenName || overlay.tagline) {
      drawOverlayText(ctx, W, H, overlay, scale, fontFam, pad, barTop, barH);
    }

    if (chart.enabled && chartData && chart.mode === "side") {
      drawChartAnimated(
        ctx,
        W,
        H,
        chartData,
        chart,
        chartAnim,
        chartProgress,
        overlay.font,
        barH,
      );
    }
  }

  // Confetti always on top
  if (confetti.enabled && animState.particles.length > 0) {
    drawParticles(ctx, animState.particles, confetti.fadeOut);
  }
}

// ─── Standard overlay text ────────────────────────────────────────
function drawOverlayText(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  overlay: OverlaySettings,
  scale: number,
  fontFam: string,
  pad: number,
  barTop: number,
  barH: number,
) {
  const tokenY = barTop + 56 * scale;
  const taglineY = barTop + 82 * scale;
  const dividerY = barTop + 100 * scale;
  const badgeY = dividerY + 12 * scale;

  ctx.save();
  ctx.font = `bold ${Math.round(52 * scale)}px ${fontFam}`;
  ctx.fillStyle = overlay.textColor;
  ctx.shadowColor = overlay.accent;
  ctx.shadowBlur = 18 * scale;
  ctx.fillText(overlay.tokenName, pad, tokenY);
  ctx.restore();

  ctx.save();
  ctx.font = `${Math.round(17 * scale)}px ${fontFam}`;
  ctx.fillStyle = overlay.accent;
  ctx.fillText(overlay.tagline.toUpperCase(), pad, taglineY);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = overlay.accent;
  ctx.lineWidth = Math.max(1, 1 * scale);
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(pad, dividerY);
  ctx.lineTo(W - pad, dividerY);
  ctx.stroke();
  ctx.restore();

  if (overlay.chainBadge) {
    const bPad = 10 * scale;
    const bH = 26 * scale;
    ctx.save();
    ctx.font = `bold ${Math.round(13 * scale)}px ${fontFam}`;
    const tw = ctx.measureText(overlay.chainBadge.toUpperCase()).width;
    const bW = tw + bPad * 2.5;
    ctx.fillStyle = overlay.badgeBg;
    roundRect(ctx, pad, badgeY, bW, bH, 4 * scale);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.fillText(
      overlay.chainBadge.toUpperCase(),
      pad + bPad,
      badgeY + bH - 8 * scale,
    );
    ctx.restore();
  }
}

// ─── VS two-column layout ─────────────────────────────────────────
function drawVsLayout(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  overlay: OverlaySettings,
  chart: ChartSettings,
  chartData: ChartData | null,
  chartAnim: ChartAnimSettings,
  chartProgress: number,
  vs: { rightData: ChartData | null; settings: VsSettings },
  scale: number,
  fontFam: string,
  pad: number,
  barH: number,
  barTop: number,
) {
  const v = vs.settings;

  // Left gradient bar
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, barTop, W * 0.5, barH);
  ctx.clip();
  const lgL = ctx.createLinearGradient(0, barTop, 0, H);
  lgL.addColorStop(0, "rgba(0,0,0,0)");
  lgL.addColorStop(0.4, `rgba(0,0,0,${overlay.bgAlpha})`);
  lgL.addColorStop(1, `rgba(0,0,0,${Math.min(overlay.bgAlpha + 0.35, 0.95)})`);
  ctx.fillStyle = lgL;
  ctx.fillRect(0, barTop, W, barH);
  ctx.restore();

  // Right gradient bar
  ctx.save();
  ctx.beginPath();
  ctx.rect(W * 0.5, barTop, W * 0.5, barH);
  ctx.clip();
  const lgR = ctx.createLinearGradient(0, barTop, 0, H);
  lgR.addColorStop(0, "rgba(0,0,0,0)");
  lgR.addColorStop(0.4, `rgba(0,0,0,${overlay.bgAlpha})`);
  lgR.addColorStop(1, `rgba(0,0,0,${Math.min(overlay.bgAlpha + 0.35, 0.95)})`);
  ctx.fillStyle = lgR;
  ctx.fillRect(0, barTop, W, barH);
  ctx.restore();

  // Left chart (bg mode)
  if (chart.enabled && chartData && chart.mode === "bg") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W * 0.5, H);
    ctx.clip();
    drawChartAnimated(
      ctx,
      W,
      H,
      chartData,
      chart,
      chartAnim,
      chartProgress,
      overlay.font,
      barH,
    );
    ctx.restore();
  }

  // Right chart (bg mode)
  if (chart.enabled && vs.rightData && chart.mode === "bg") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(W * 0.5, 0, W * 0.5, H);
    ctx.clip();
    drawChartAnimated(
      ctx,
      W,
      H,
      vs.rightData,
      chart,
      chartAnim,
      chartProgress,
      overlay.font,
      barH,
    );
    ctx.restore();
  }

  // Diagonal divider
  drawVsDivider(ctx, W, H, v, scale, fontFam);

  // ── Left token text ──
  const nameY = barTop + 52 * scale;
  const tagY = barTop + 74 * scale;
  const leftAccent = v.leftAccent || overlay.accent;

  ctx.save();
  ctx.font = `bold ${Math.round(38 * scale)}px ${fontFam}`;
  ctx.fillStyle = overlay.textColor;
  ctx.shadowColor = leftAccent;
  ctx.shadowBlur = 14 * scale;
  ctx.textAlign = "left";
  ctx.fillText(v.leftTokenName || overlay.tokenName, pad, nameY);
  ctx.restore();

  ctx.save();
  ctx.font = `${Math.round(13 * scale)}px ${fontFam}`;
  ctx.fillStyle = leftAccent;
  ctx.textAlign = "left";
  ctx.fillText((v.leftTagline || overlay.tagline).toUpperCase(), pad, tagY);
  ctx.restore();

  // Left chain badge
  const leftChain = v.leftChainBadge || overlay.chainBadge;
  if (leftChain) {
    const bPad = 8 * scale;
    const bH = 20 * scale;
    const badgeY = tagY + 14 * scale;
    ctx.save();
    ctx.font = `bold ${Math.round(10 * scale)}px ${fontFam}`;
    const tw = ctx.measureText(leftChain.toUpperCase()).width;
    const bW = tw + bPad * 2.5;
    ctx.fillStyle = leftAccent;
    roundRect(ctx, pad, badgeY, bW, bH, 3 * scale);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.fillText(leftChain.toUpperCase(), pad + bPad, badgeY + bH - 6 * scale);
    ctx.restore();
  }

  // ── Right token text ──
  const rightAccent = v.rightAccent || "#a0b4ff";

  ctx.save();
  ctx.font = `bold ${Math.round(38 * scale)}px ${fontFam}`;
  ctx.fillStyle = overlay.textColor;
  ctx.shadowColor = rightAccent;
  ctx.shadowBlur = 14 * scale;
  ctx.textAlign = "right";
  ctx.fillText(v.rightTokenName, W - pad, nameY);
  ctx.restore();

  ctx.save();
  ctx.font = `${Math.round(13 * scale)}px ${fontFam}`;
  ctx.fillStyle = rightAccent;
  ctx.globalAlpha = 0.9;
  ctx.textAlign = "right";
  ctx.fillText(v.rightTagline.toUpperCase(), W - pad, tagY);
  ctx.restore();

  // Right chain badge
  if (v.rightChainBadge) {
    const bPad = 8 * scale;
    const bH = 20 * scale;
    const badgeY = tagY + 14 * scale;
    ctx.save();
    ctx.font = `bold ${Math.round(10 * scale)}px ${fontFam}`;
    const tw = ctx.measureText(v.rightChainBadge.toUpperCase()).width;
    const bW = tw + bPad * 2.5;
    ctx.fillStyle = rightAccent;
    roundRect(ctx, W - pad - bW, badgeY, bW, bH, 3 * scale);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.fillText(
      v.rightChainBadge.toUpperCase(),
      W - pad - bW + bPad,
      badgeY + bH - 6 * scale,
    );
    ctx.restore();
  }
}

// ─── Diagonal VS divider ──────────────────────────────────────────
function drawVsDivider(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  vs: VsSettings,
  scale: number,
  fontFam: string,
) {
  const cx = W / 2;
  const tiltRad = (12 * Math.PI) / 180;
  const lineLen = H * 0.72;
  const dy = (Math.cos(tiltRad) * lineLen) / 2;
  const dx = (Math.sin(tiltRad) * lineLen) / 2;
  const midY = H * 0.42;

  ctx.save();
  ctx.strokeStyle = vs.dividerColor;
  ctx.lineWidth = 1.5 * scale;
  ctx.globalAlpha = 0.45;
  ctx.setLineDash([5 * scale, 6 * scale]);
  ctx.shadowColor = vs.dividerColor;
  ctx.shadowBlur = 8 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - dx, midY - dy);
  ctx.lineTo(cx + dx, midY + dy);
  ctx.stroke();
  ctx.restore();

  // VS badge
  const label = vs.label || "VS";
  const bH = 34 * scale;
  const bW = 50 * scale;
  const bY = midY - bH / 2;

  ctx.save();
  ctx.fillStyle = vs.dividerColor;
  ctx.shadowColor = vs.dividerColor;
  ctx.shadowBlur = 16 * scale;
  roundRect(ctx, cx - bW / 2, bY, bW, bH, 6 * scale);
  ctx.fill();
  ctx.font = `bold ${Math.round(16 * scale)}px ${fontFam}`;
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.shadowBlur = 0;
  ctx.fillText(label, cx, bY + bH * 0.67);
  ctx.restore();
}

// ─── Animated chart wrapper ───────────────────────────────────────
function drawChartAnimated(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  data: ChartData,
  chart: ChartSettings,
  anim: ChartAnimSettings,
  progress: number,
  font: string,
  overlayBarH: number,
) {
  if (progress >= 1) {
    drawChart(ctx, W, H, data, chart, font, overlayBarH);
    return;
  }

  const vals = data.prices.map((p) => p[1]);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const pct = priceChange(data.prices);
  const isUp = pct >= 0;
  const lineCol = isUp ? "#44cc88" : "#ff4466";
  const fillCol = isUp ? "rgba(68,204,136," : "rgba(255,68,102,";
  const scale = W / 800;
  const isGlitch = anim.preset === "glitch";

  if (chart.mode === "bg") {
    const padX = W * 0.07,
      padT = H * 0.12;
    const padB = overlayBarH + H * 0.04;
    const cW = W - padX * 2,
      cH = H - padT - padB;
    drawAnimatedChart(
      ctx,
      W,
      H,
      vals,
      minV,
      maxV,
      progress,
      progress,
      lineCol,
      fillCol,
      anim,
      padX,
      padT,
      cW,
      cH,
      scale,
      isGlitch,
    );

    if (chart.showPrice && progress > 0.6) {
      const a = (progress - 0.6) / 0.4;
      const barTop = H - overlayBarH;
      const sign = pct >= 0 ? "+" : "";
      const tfLabel = TF_OPTIONS.find((t) => t.value === data.tf)?.label ?? "";
      const fontFam = `'${font}', 'Courier New', monospace`;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = "right";
      ctx.shadowColor = "rgba(0,0,0,0.85)";
      ctx.shadowBlur = 6 * scale;
      ctx.font = `bold ${Math.round(22 * scale)}px ${fontFam}`;
      ctx.fillStyle = "#fff";
      ctx.fillText(
        formatPrice(vals.at(-1)!),
        W - 28 * scale,
        barTop - 28 * scale,
      );
      ctx.font = `${Math.round(15 * scale)}px ${fontFam}`;
      ctx.fillStyle = lineCol;
      ctx.fillText(
        `${sign}${pct.toFixed(2)}%  ${tfLabel}`,
        W - 28 * scale,
        barTop - 10 * scale,
      );
      ctx.restore();
    }
  } else {
    drawChart(ctx, W, H, data, chart, font, overlayBarH);
  }
}
