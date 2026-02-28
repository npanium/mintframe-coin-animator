import { useState, useRef, useCallback } from "react";
import { useAppState } from "./hooks/useAppState";
import { CoinCanvas } from "./components/CoinCanvas";
import { TokenPresets } from "./components/TokenPresets";
import { PanelCoin } from "./components/PanelCoin";
import { PanelLogo } from "./components/PanelLogo";
import { PanelAnimation } from "./components/PanelAnimation";
import { PanelFX } from "./components/PanelFX";
import { PanelOverlay } from "./components/PanelOverlay";
import { PanelBackground } from "./components/PanelBackground";
import { PanelExport } from "./components/PanelExport";
import { PanelEffects } from "./components/PanelEffects";
import type { CoinEngine } from "./lib/CoinEngine";

type Tab =
  | "coin"
  | "logo"
  | "anim"
  | "fx"
  | "overlay"
  | "effects"
  | "bg"
  | "export";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "coin", label: "Coin", icon: "⬡" },
  { id: "logo", label: "Logo", icon: "◈" },
  { id: "anim", label: "Animate", icon: "⟳" },
  { id: "fx", label: "FX", icon: "✦" },
  { id: "overlay", label: "Overlay", icon: "▤" },
  { id: "effects", label: "Effects", icon: "❋" },
  { id: "bg", label: "BG", icon: "◻" },
  { id: "export", label: "Export", icon: "↑" },
];

// How tall the sheet snaps to when open (% of viewport height on mobile)
const SHEET_OPEN_VH = 52;

export default function App() {
  const st = useAppState();
  const [tab, setTab] = useState<Tab>("coin");
  const [sheetOpen, setSheetOpen] = useState(false);
  const engineRef = useRef<CoinEngine | null>(null);

  const retraceChart = useCallback(() => {
    const saved = st.chartData;
    st.setChartData(null);
    setTimeout(() => st.setChartData(saved), 50);
  }, [st]);

  const handleEngineReady = useCallback((engine: CoinEngine) => {
    engineRef.current = engine;
  }, []);

  const handleTabClick = (id: Tab) => {
    if (tab === id && sheetOpen) {
      setSheetOpen(false);
    } else {
      setTab(id);
      setSheetOpen(true);
    }
  };

  const panelContent = (
    <div className="flex flex-col gap-4">
      {tab === "coin" && (
        <PanelCoin
          coin={st.coin}
          renderStyle={st.renderStyle}
          materialPreset={st.materialPreset}
          onChange={(p) => st.setCoin((c) => ({ ...c, ...p }))}
          onRenderStyle={st.setRenderStyle}
          onMaterialPreset={st.applyMaterialPreset}
        />
      )}
      {tab === "logo" && (
        <PanelLogo
          logo={st.logo}
          onChange={(p) => st.setLogo((l) => ({ ...l, ...p }))}
        />
      )}
      {tab === "anim" && (
        <PanelAnimation
          rotMode={st.rotMode}
          rotSpeed={st.rotSpeed}
          tiltX={st.tiltX}
          light={st.light}
          onRotMode={st.setRotMode}
          onRotSpeed={st.setRotSpeed}
          onTiltX={st.setTiltX}
          onLight={(p) => st.setLight((l) => ({ ...l, ...p }))}
        />
      )}
      {tab === "fx" && (
        <PanelFX
          fx={st.fx}
          grade={st.grade}
          onFx={(p) => st.setFx((f) => ({ ...f, ...p }))}
          onGrade={(p) => st.setGrade((g) => ({ ...g, ...p }))}
          onResetGrade={() =>
            st.setGrade({ hue: 0, sat: 100, bri: 100, con: 100 })
          }
        />
      )}
      {tab === "overlay" && (
        <PanelOverlay
          overlay={st.overlay}
          chart={st.chart}
          chartData={st.chartData}
          onOverlay={(p) => st.setOverlay((o) => ({ ...o, ...p }))}
          onChart={(p) => st.setChart((c) => ({ ...c, ...p }))}
          onChartData={st.setChartData}
        />
      )}
      {tab === "effects" && (
        <PanelEffects
          confetti={st.confetti}
          chartAnim={st.chartAnim}
          vs={st.vs}
          vsChartData={st.vsChartData}
          onConfetti={(p) => st.setConfetti((c) => ({ ...c, ...p }))}
          onChartAnim={(p) => st.setChartAnim((a) => ({ ...a, ...p }))}
          onVs={(p) => st.setVs((v) => ({ ...v, ...p }))}
          onVsChartData={st.setVsChartData}
          onRetraceChart={retraceChart}
        />
      )}
      {tab === "bg" && (
        <PanelBackground
          bgColor={st.bgColor}
          bgImg={st.bgImg}
          onBgColor={st.setBgColor}
          onBgImg={st.setBgImg}
        />
      )}
      {tab === "export" && (
        <PanelExport
          engine={engineRef.current}
          coin={st.coin}
          overlay={st.overlay}
          chart={st.chart}
          chartData={st.chartData}
          fx={st.fx}
          grade={st.grade}
          bgColor={st.bgColor}
          bgImg={st.bgImg}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-mono flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/70 shrink-0 z-10">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold tracking-widest text-amber-400">
            ⬡ MINTFRAME
          </span>
          <span className="text-xs text-neutral-600 hidden sm:inline">
            3D Coin Animator
          </span>
        </div>
        <span className="text-xs text-neutral-700">CC0 · Public Domain</span>
      </header>

      {/* ── Desktop layout (md+): canvas left, panel right ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Canvas column */}
        <div className="flex flex-col gap-5 p-6 items-center justify-start flex-1 overflow-y-auto">
          <div className="w-full max-w-lg">
            <p className="text-xs font-bold tracking-widest text-neutral-600 uppercase mb-2">
              Token Preset
            </p>
            <TokenPresets
              active={st.tokenPreset}
              onSelect={st.applyTokenPreset}
            />
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
              <span className="text-xs text-neutral-600">Preview</span>
              <div className="flex items-center gap-3">
                {st.confetti.enabled && (
                  <span className="text-xs text-amber-500 tracking-wide">
                    ✦ confetti
                  </span>
                )}
                {st.vs.enabled && (
                  <span className="text-xs text-blue-400 tracking-wide">
                    VS mode
                  </span>
                )}
                {st.overlay.enabled && (
                  <span className="text-xs text-neutral-600">
                    {st.overlay.aspect}
                  </span>
                )}
              </div>
            </div>

            <CoinCanvas
              coin={st.coin}
              logo={st.logo}
              light={st.light}
              fx={st.fx}
              grade={st.grade}
              renderStyle={st.renderStyle}
              rotMode={st.rotMode}
              rotSpeed={st.rotSpeed}
              tiltX={st.tiltX}
              bgColor={st.bgColor}
              bgImg={st.bgImg}
              overlay={st.overlay}
              chart={st.chart}
              chartData={st.chartData}
              confetti={st.confetti}
              chartAnim={st.chartAnim}
              vs={st.vs}
              vsChartData={st.vsChartData}
              onEngineReady={handleEngineReady}
            />

            {st.overlay.enabled && (
              <div className="flex items-center gap-2 px-4 py-2.5 border-t border-neutral-800">
                <span
                  className="text-sm font-bold tracking-wider"
                  style={{ color: st.overlay.accent }}
                >
                  {st.overlay.tokenName}
                </span>
                <span className="text-neutral-700">·</span>
                <span className="text-xs text-neutral-500 truncate">
                  {st.overlay.tagline}
                </span>
              </div>
            )}
          </div>

          <div className="w-full max-w-lg rounded-lg border border-neutral-800/60 bg-neutral-900/30 px-4 py-3">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Token preset → logo → overlay → Effects tab for confetti &amp;
              chart animation → export.{" "}
              <code className="text-amber-700 text-xs">
                ffmpeg -r 30 -i coin_%04d.png coin.gif
              </code>
            </p>
          </div>
        </div>

        {/* Desktop panel — elegant sidebar */}
        <div className="flex flex-col border-l border-neutral-800/70 w-76 shrink-0 overflow-hidden">
          {/* Tab strip — scrollable horizontal pills */}
          <div className="shrink-0 px-3 pt-3 pb-0 border-b border-neutral-800/70">
            <div className="flex flex-col gap-1 overflow-x-auto pb-3 scrollbar-none">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tracking-wide whitespace-nowrap transition-all cursor-pointer shrink-0
                    ${
                      tab === t.id
                        ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                        : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                    }`}
                >
                  <span className="text-[10px] opacity-70">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto p-4">{panelContent}</div>
        </div>
      </div>

      {/* ── Mobile layout: full-width canvas + bottom sheet ── */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden relative">
        {/* Canvas area — scrollable, leaves room for the tab bar */}
        <div
          className="flex-1 overflow-y-auto transition-all duration-300 ease-out"
          style={{
            paddingBottom: sheetOpen
              ? `calc(${SHEET_OPEN_VH}vh + 56px)`
              : "72px",
          }}
        >
          <div className="flex flex-col gap-4 p-4 items-center">
            <div className="w-full">
              <p className="text-xs font-bold tracking-widest text-neutral-600 uppercase mb-2">
                Token Preset
              </p>
              <TokenPresets
                active={st.tokenPreset}
                onSelect={st.applyTokenPreset}
              />
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-2xl w-full">
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
                <span className="text-xs text-neutral-600">Preview</span>
                <div className="flex items-center gap-2">
                  {st.confetti.enabled && (
                    <span className="text-xs text-amber-500">✦ confetti</span>
                  )}
                  {st.vs.enabled && (
                    <span className="text-xs text-blue-400">VS</span>
                  )}
                  {st.overlay.enabled && (
                    <span className="text-xs text-neutral-600">
                      {st.overlay.aspect}
                    </span>
                  )}
                </div>
              </div>

              <CoinCanvas
                coin={st.coin}
                logo={st.logo}
                light={st.light}
                fx={st.fx}
                grade={st.grade}
                renderStyle={st.renderStyle}
                rotMode={st.rotMode}
                rotSpeed={st.rotSpeed}
                tiltX={st.tiltX}
                bgColor={st.bgColor}
                bgImg={st.bgImg}
                overlay={st.overlay}
                chart={st.chart}
                chartData={st.chartData}
                confetti={st.confetti}
                chartAnim={st.chartAnim}
                vs={st.vs}
                vsChartData={st.vsChartData}
                onEngineReady={handleEngineReady}
              />

              {st.overlay.enabled && (
                <div className="flex items-center gap-2 px-4 py-2 border-t border-neutral-800">
                  <span
                    className="text-sm font-bold"
                    style={{ color: st.overlay.accent }}
                  >
                    {st.overlay.tokenName}
                  </span>
                  <span className="text-neutral-700">·</span>
                  <span className="text-xs text-neutral-500 truncate">
                    {st.overlay.tagline}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom sheet ── */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
          style={{
            height: sheetOpen ? `calc(${SHEET_OPEN_VH}vh + 56px)` : "56px",
          }}
        >
          {/* Backdrop — tap to close */}
          {sheetOpen && (
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setSheetOpen(false)}
            />
          )}

          {/* Sheet surface */}
          <div
            className="flex flex-col flex-1 rounded-t-2xl overflow-hidden border-t border-neutral-800/80 transition-all duration-300 ease-out"
            style={{
              background: "rgba(10,10,12,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Drag handle */}
            {sheetOpen && (
              <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                <div className="w-9 h-1 rounded-full bg-neutral-700" />
              </div>
            )}

            {/* Tab bar — always visible */}
            <div className="shrink-0 flex flex-col items-center gap-0 px-2 border-b border-neutral-800/60 overflow-x-auto scrollbar-none">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabClick(t.id)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2.5 min-w-14 transition-all cursor-pointer shrink-0
                    ${
                      tab === t.id && sheetOpen
                        ? "text-amber-400"
                        : "text-neutral-500 active:text-neutral-300"
                    }`}
                >
                  <span
                    className={`text-base leading-none transition-transform ${
                      tab === t.id && sheetOpen ? "scale-110" : ""
                    }`}
                  >
                    {t.icon}
                  </span>
                  <span className="text-[9px] tracking-wide font-medium">
                    {t.label}
                  </span>
                  {tab === t.id && sheetOpen && (
                    <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Panel content — only visible when open */}
            {sheetOpen && (
              <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
                {panelContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollbar hide utility */}
      <style>{`
        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .w-76 { width: 19rem; }
      `}</style>
    </div>
  );
}
