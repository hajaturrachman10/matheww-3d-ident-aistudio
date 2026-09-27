import React from 'react';
import { Download, RotateCcw, Palette, Box, Sparkles, Sliders, Type, ShieldCheck } from 'lucide-react';
import type { IdentConfig } from '../types.ts';

interface ConfigPanelProps {
  config: IdentConfig;
  setConfig: React.Dispatch<React.SetStateAction<IdentConfig>>;
  defaultConfig: IdentConfig;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  setConfig,
  defaultConfig,
}) => {
  const updateGeometry = (key: keyof IdentConfig['geometry'], value: any) => {
    setConfig((prev) => ({
      ...prev,
      geometry: {
        ...prev.geometry,
        [key]: value,
      },
    }));
  };

  const handleDownloadConfig = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'config.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = () => {
    setConfig(JSON.parse(JSON.stringify(defaultConfig)));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Ident Studio Parameters
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset to default Pirata One Gothic config"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownloadConfig}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow"
            title="Download config.json for GitHub Actions cloud render"
          >
            <Download className="w-3 h-3" />
            Save config.json
          </button>
        </div>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs text-slate-300">
        {/* Section 1: Typography & Font Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-400 font-semibold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-400" />
              <span>Gothic Street Typography</span>
            </label>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              OFL Open Source
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={config.text}
              onChange={(e) => setConfig((prev) => ({ ...prev, text: e.target.value.toUpperCase() }))}
              placeholder="MATHEWW"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-base tracking-widest uppercase focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {config.text === 'MATHEWW' && (
              <span className="absolute right-3 top-2.5 text-[10px] text-emerald-400 font-mono font-medium">
                ✓ Exact Match
              </span>
            )}
          </div>

          {/* Font Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  fontPath: '/fonts/pirata_one.typeface.json',
                  fontName: 'Pirata One',
                }))
              }
              className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                config.fontName === 'Pirata One'
                  ? 'border-blue-500 bg-blue-950/40 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Pirata One</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-mono">
                  Recommended
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Aggressive gothic blackletter, pirate/street crime attitude.
              </span>
            </button>

            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  fontPath: '/fonts/metal_mania.typeface.json',
                  fontName: 'Metal Mania',
                }))
              }
              className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                config.fontName === 'Metal Mania'
                  ? 'border-blue-500 bg-blue-950/40 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Metal Mania</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-mono">
                  OFL
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Raw heavy metal gothic spikes, rough and sharp silhouette.
              </span>
            </button>
          </div>
        </div>

        {/* Section 2: Material Palette Structure */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Material Structure (Silver + Blue Accents)</span>
            </div>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
              Style Reference
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            The front face is cold light silver-gray (clean readability) with electric blue contour bevels and deep navy extrusion sides.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {/* Front Color */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-semibold">
                Front Face (Light Silver)
              </label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 border border-slate-700 rounded-lg">
                <input
                  type="color"
                  value={config.frontColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, frontColor: e.target.value }))}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.frontColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, frontColor: e.target.value }))}
                  className="w-full bg-transparent font-mono text-[10px] text-white uppercase focus:outline-none"
                />
              </div>
            </div>

            {/* Bevel Accent */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-semibold">
                Bevel Rim (Electric Blue)
              </label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 border border-slate-700 rounded-lg">
                <input
                  type="color"
                  value={config.bevelAccentColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, bevelAccentColor: e.target.value }))}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.bevelAccentColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, bevelAccentColor: e.target.value }))}
                  className="w-full bg-transparent font-mono text-[10px] text-white uppercase focus:outline-none"
                />
              </div>
            </div>

            {/* Side Color */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-semibold">
                Sides (Dark Blue 3D)
              </label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 border border-slate-700 rounded-lg">
                <input
                  type="color"
                  value={config.sideColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, sideColor: e.target.value }))}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.sideColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, sideColor: e.target.value }))}
                  className="w-full bg-transparent font-mono text-[10px] text-white uppercase focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Chroma Background */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Uniform Chroma Key Background
            </label>
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 border border-slate-700 rounded-lg">
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => setConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={config.backgroundColor}
                onChange={(e) => setConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-full bg-transparent font-mono text-xs text-white uppercase focus:outline-none"
              />
              <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 bg-emerald-950/60 rounded">
                Pure #00FF00
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Safe Margin Framing */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe-Area Auto-Framing</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Middle 80%</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Camera automatically calculates frustum depth from geometry bounding box so <strong>M</strong> and the final <strong>W</strong> never touch or cross the screen edges.
            </p>
            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-slate-400">Horizontal Safe Width Ratio:</span>
              <span className="font-mono text-emerald-300 font-bold">
                {((config.framing?.safeWidthRatio || 0.8) * 100).toFixed(0)}% (10% margins)
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: 3D Extrusion & Bevel Depth */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
            <Box className="w-3.5 h-3.5 text-blue-400" />
            <span>Extrusion & Bevel Geometry</span>
          </div>

          {/* Extrusion Depth */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Extrusion Depth</span>
              <span className="font-mono text-white">{config.geometry.depth}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={config.geometry.depth}
              onChange={(e) => updateGeometry('depth', parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Bevel Thickness */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Bevel Thickness</span>
              <span className="font-mono text-white">{config.geometry.bevelThickness}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={config.geometry.bevelThickness}
              onChange={(e) => updateGeometry('bevelThickness', parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Bevel Size */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Bevel Size</span>
              <span className="font-mono text-white">{config.geometry.bevelSize}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={config.geometry.bevelSize}
              onChange={(e) => updateGeometry('bevelSize', parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Section 5: Per-Letter Motion Choreography */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Per-Letter Choreography</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">0.00s – 0.12s:</span>
              <span className="font-mono text-white">Empty Anticipation (Pure #00FF00)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-300">0.12s – 0.72s:</span>
              <span className="font-mono text-white">Staggered Letter Arrival (M→A→T→H→E→W→W)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-300">0.72s – 0.95s:</span>
              <span className="font-mono text-white">Lock-In Impact Merge & Micro-Pulse</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-300">0.95s – 2.10s:</span>
              <span className="font-mono text-white">Centered Idle (±2° yaw, floating, breathing)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">2.10s – 2.35s:</span>
              <span className="font-mono text-white">Pre-Exit Separation & Destabilize</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-300">2.35s – 3.00s:</span>
              <span className="font-mono text-white">Outro: Split + Shrink + Sink into Depth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
