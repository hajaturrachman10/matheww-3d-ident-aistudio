import React, { useState } from 'react';
import { Viewport3D } from './components/Viewport3D.tsx';
import { TimelineControls } from './components/TimelineControls.tsx';
import { ConfigPanel } from './components/ConfigPanel.tsx';
import { GitHubActionsGuide } from './components/GitHubActionsGuide.tsx';
import type { IdentConfig, FrameState } from './types.ts';
import defaultRawConfig from '../config.json';
import {
  Film,
  Sparkles,
  CloudLightning,
  Settings,
  Compass,
  CheckCircle2,
  FileCode,
  ShieldCheck,
} from 'lucide-react';

const DEFAULT_CONFIG: IdentConfig = defaultRawConfig as IdentConfig;

export default function App() {
  const [config, setConfig] = useState<IdentConfig>(DEFAULT_CONFIG);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [bgMode, setBgMode] = useState<'green' | 'dark' | 'videoMock'>('green');
  const [frameState, setFrameState] = useState<FrameState | null>(null);
  const [activeTab, setActiveTab] = useState<'controls' | 'guide' | 'specs'>('controls');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-wide text-white">
                3D IDENT GENERATOR
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                GOTHIC STREET EDITION
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic 1080×1920 @ 60fps foreground watermark ident • Silver front & blue edge bevels
            </p>
          </div>
        </div>

        {/* Top Feature Checklist Pill */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Word: <strong className="text-white font-mono">{config.text}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2F4F7] shadow-sm border border-slate-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#1480FF] shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#053494] shadow-sm"></span>
            <span>Silver & Blue Contours</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Middle 80% Safe Area</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00]"></span>
            <span>#00FF00 Chroma</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
              activeTab === 'controls'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Studio & Controls
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudLightning className="w-3.5 h-3.5" />
            Cloud Render (GitHub Actions)
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
              activeTab === 'specs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Specs & Pipeline
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 flex flex-col gap-6">
        {activeTab === 'controls' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 9:16 Viewport & Timeline Controls (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center gap-4">
              <Viewport3D
                config={config}
                currentFrame={currentFrame}
                bgMode={bgMode}
                setBgMode={setBgMode}
                onFrameUpdate={setFrameState}
              />

              <div className="w-full max-w-[500px]">
                <TimelineControls
                  config={config}
                  currentFrame={currentFrame}
                  setCurrentFrame={setCurrentFrame}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  frameState={frameState}
                />
              </div>

              {/* Real-time Transform Telemetry Bar */}
              {frameState && (
                <div className="w-full max-w-[500px] bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Yaw: <strong className="text-white">{(frameState.groupRotation.y * (180 / Math.PI)).toFixed(1)}°</strong></span>
                  </div>
                  <div>
                    Roll: <strong className="text-white">{(frameState.groupRotation.z * (180 / Math.PI)).toFixed(1)}°</strong>
                  </div>
                  <div>
                    Active Letters: <strong className="text-emerald-400">{frameState.letters.filter(l => l.visible).length}/{frameState.letters.length}</strong>
                  </div>
                  <div>
                    Time: <strong className="text-cyan-300">{frameState.timeSeconds.toFixed(2)}s</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Parameters & Config (5 cols) */}
            <div className="lg:col-span-5 h-[840px] flex flex-col">
              <ConfigPanel
                config={config}
                setConfig={setConfig}
                defaultConfig={DEFAULT_CONFIG}
              />
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto w-full py-4 space-y-6">
            <GitHubActionsGuide config={config} />
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="max-w-4xl mx-auto w-full py-4 space-y-6">
            {/* Architecture Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Per-Letter Gothic 3D Ident Engine
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                This architecture treats each character in <strong>"MATHEWW"</strong> (M, A, T, H, E, W, W) as an independent 3D mesh object with distinct multi-directional trajectories, converging into a locked, cohesive word watermark during idle, and dramatically breaking apart with individual outward split, downward sink, backward depth pull, and shrink during the outro.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <h3 className="font-semibold text-cyan-400">6-Phase Choreography (3.0s / 180 Frames)</h3>
                  <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                    <li><strong>0.00s – 0.12s (Empty Start):</strong> Clean #00FF00 background, building visual anticipation.</li>
                    <li><strong>0.12s – 0.72s (Staggered Entrance):</strong> Letters enter from distinct 3D angles (left, right, top, depth) with snappy ease-out-back curves.</li>
                    <li><strong>0.72s – 0.95s (Merge Lock-In):</strong> All 7 letters lock into word formation with a subtle micro-pulse settle.</li>
                    <li><strong>0.95s – 2.10s (Idle Watermark):</strong> Fully legible, centered inside 80% safe width with gentle ±2° yaw and breathing float.</li>
                    <li><strong>2.10s – 2.35s (Pre-Exit Separation):</strong> Letters destabilize and offset slightly in X/Y/Z.</li>
                    <li><strong>2.35s – 3.00s (Outro Split & Sink):</strong> Letters break apart, pull outward, plunge downward/backward, and shrink to zero.</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <h3 className="font-semibold text-emerald-400">Adaptive Safe-Margin Auto-Framing</h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Uses <code>fitTextToCamera</code> to dynamically compute camera distance from the exact 3D bounding box:
                  </p>
                  <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                    <li>Middle 80% safe width guaranteed (10% safe margin on left & right).</li>
                    <li>Neither the initial "M" nor the final "W" can clip or touch edges.</li>
                    <li>Fully adapts if text is edited or if new letters are tested.</li>
                    <li>Uniform pure <code>#00FF00</code> background with zero shadows or artifacts.</li>
                  </ul>
                </div>
              </div>

              {/* File Structure Map */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Project Repository Structure</h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>├── config.json <span className="text-slate-500">// Pirata One font, silver & blue palette, whip choreography</span></div>
                  <div>├── .github/workflows/render.yml <span className="text-slate-500">// GitHub Actions cloud rendering workflow</span></div>
                  <div>├── render/</div>
                  <div>│   ├── render-frames.mjs <span className="text-slate-500">// Headless Playwright deterministic frame capture</span></div>
                  <div>│   ├── encode.mjs <span className="text-slate-500">// FFmpeg H.264 60fps MP4 encoder</span></div>
                  <div>│   ├── render-all.mjs <span className="text-slate-500">// Full pipeline runner</span></div>
                  <div>│   └── render-page.html <span className="text-slate-500">// Standalone 1080x1920 Three.js canvas with auto-framing</span></div>
                  <div>├── public/fonts/ <span className="text-slate-500">// pirata_one, metal_mania, and ttf/ with SIL OFL licenses</span></div>
                  <div>├── src/ <span className="text-slate-500">// React + Three.js interactive studio web app</span></div>
                  <div>└── README.md <span className="text-slate-500">// Complete non-technical usage manual</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Banner Guide */}
        {activeTab === 'controls' && (
          <div className="w-full">
            <GitHubActionsGuide config={config} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        Cloud 3D Ident Generator • Text: "MATHEWW" • 1080×1920 60fps • Built with Node.js, Three.js, Playwright & FFmpeg
      </footer>
    </div>
  );
}
