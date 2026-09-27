import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
} from 'lucide-react';
import type { IdentConfig, FrameState } from '../types.ts';

interface TimelineControlsProps {
  config: IdentConfig;
  currentFrame: number;
  setCurrentFrame: (frame: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
  frameState: FrameState | null;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  config,
  currentFrame,
  setCurrentFrame,
  isPlaying,
  setIsPlaying,
  frameState,
}) => {
  const totalFrames = config.totalFrames || 180;
  const fps = config.fps || 60;
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Playback loop with accurate 60fps timing
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = null;
      return;
    }

    const frameDurationMs = 1000 / fps;
    let accumulatedTime = 0;

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      accumulatedTime += delta;

      if (accumulatedTime >= frameDurationMs) {
        const framesToAdvance = Math.floor(accumulatedTime / frameDurationMs);
        accumulatedTime -= framesToAdvance * frameDurationMs;

        setCurrentFrame((prev) => {
          const next = prev + framesToAdvance;
          if (next >= totalFrames) {
            return 0; // loop seamlessly
          }
          return next;
        });
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, fps, totalFrames]);

  const currentTimeSeconds = (currentFrame / fps).toFixed(2);
  const totalTimeSeconds = (totalFrames / fps).toFixed(2);

  // Key Inspection Frame Benchmarks
  const introMidFrame = Math.round(0.35 * fps); // 21f: middle of letter-by-letter entrance
  const mergeFrame = Math.round(0.75 * fps); // 45f: lock-in impact & overshoot pulse
  const idleFrame = Math.round(1.50 * fps); // 90f: steady readable centered idle
  const breakupFrame = Math.round(2.20 * fps); // 132f: pre-exit letter separation
  const outroFrame = Math.round(2.65 * fps); // 159f: split, shrink & sink into depth

  const currentPhase = frameState?.phase || 'idle_readable';

  // Phase ratios for timeline visual color bars
  const p1Ratio = (config.animation.phases.anticipationEnd / config.duration) * 100;
  const p2Ratio = (config.animation.phases.entranceEnd / config.duration) * 100;
  const p3Ratio = (config.animation.phases.mergeSettleEnd / config.duration) * 100;
  const p4Ratio = (config.animation.phases.idleEnd / config.duration) * 100;
  const p5Ratio = (config.animation.phases.preExitEnd / config.duration) * 100;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Top info row: Frame number, Timecode, Phase badge */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-slate-300 font-semibold bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {currentTimeSeconds}s / {totalTimeSeconds}s
            </span>
          </div>

          <div className="font-mono text-slate-400 text-[11px]">
            Frame <span className="text-white font-bold">{currentFrame}</span> / {totalFrames - 1} (60fps)
          </div>
        </div>

        {/* Phase Pill Indicator */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Phase:</span>
          {currentPhase === 'empty_anticipation' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
              Anticipation (0.00s – 0.12s)
            </span>
          )}
          {currentPhase === 'letter_entrance' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider animate-pulse">
              Letter-by-Letter Entrance (0.12s – 0.72s)
            </span>
          )}
          {currentPhase === 'impact_merge' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 uppercase tracking-wider animate-pulse">
              Lock-In Merge & Settle (0.72s – 0.95s)
            </span>
          )}
          {currentPhase === 'idle_readable' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Legible Idle Watermark (0.95s – 2.10s)
            </span>
          )}
          {currentPhase === 'pre_exit_separation' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              Pre-Exit Separation (2.10s – 2.35s)
            </span>
          )}
          {currentPhase === 'outro_sink' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider animate-pulse">
              Split, Shrink & Sink (2.35s – 3.00s)
            </span>
          )}
        </div>
      </div>

      {/* Visual Timeline Bar with Phase Bands */}
      <div className="relative w-full h-8 bg-slate-950 rounded-lg p-1 border border-slate-800 flex items-center select-none">
        {/* Phase Color Bands */}
        <div className="absolute inset-1 rounded overflow-hidden flex pointer-events-none opacity-40">
          <div
            style={{ width: `${p1Ratio}%` }}
            className="h-full bg-slate-700/30 border-r border-slate-600/40 relative flex items-center justify-center"
            title="Anticipation (0.00s – 0.12s)"
          ></div>
          <div
            style={{ width: `${p2Ratio - p1Ratio}%` }}
            className="h-full bg-amber-500/20 border-r border-amber-500/40 relative flex items-center justify-center"
            title="Letter-by-Letter Entrance (0.12s – 0.72s)"
          >
            <span className="text-[9px] font-semibold text-amber-200">Letter Entrance</span>
          </div>
          <div
            style={{ width: `${p3Ratio - p2Ratio}%` }}
            className="h-full bg-cyan-500/30 border-r border-cyan-500/40 relative flex items-center justify-center"
            title="Merge & Settle (0.72s – 0.95s)"
          >
            <span className="text-[9px] font-semibold text-cyan-200">Merge</span>
          </div>
          <div
            style={{ width: `${p4Ratio - p3Ratio}%` }}
            className="h-full bg-blue-500/10 border-r border-blue-500/30 relative flex items-center justify-center"
            title="Idle Safe Watermark (0.95s – 2.10s)"
          >
            <span className="text-[9px] font-semibold text-blue-200">Idle Safe Zone</span>
          </div>
          <div
            style={{ width: `${p5Ratio - p4Ratio}%` }}
            className="h-full bg-purple-500/20 border-r border-purple-500/40 relative flex items-center justify-center"
            title="Pre-Exit Separation (2.10s – 2.35s)"
          >
            <span className="text-[8px] font-semibold text-purple-200">Break</span>
          </div>
          <div
            style={{ width: `${100 - p5Ratio}%` }}
            className="h-full bg-rose-500/20 relative flex items-center justify-center"
            title="Outro: Split, Shrink & Sink (2.35s – 3.00s)"
          >
            <span className="text-[9px] font-semibold text-rose-200">Sink & Split</span>
          </div>
        </div>

        {/* Range Scrubber Slider */}
        <input
          type="range"
          min={0}
          max={totalFrames - 1}
          value={currentFrame}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentFrame(parseInt(e.target.value, 10));
          }}
          className="relative z-10 w-full h-full opacity-0 cursor-ew-resize"
        />

        {/* Playhead needle cursor */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 pointer-events-none z-20"
          style={{ left: `${(currentFrame / (totalFrames - 1)) * 100}%` }}
        >
          <div className="w-2.5 h-2.5 -ml-1 -top-1 absolute bg-cyan-400 rounded-full shadow-md"></div>
        </div>
      </div>

      {/* Quick Phase Navigation Jump Buttons */}
      <div className="flex items-center justify-between gap-1 pt-1 pb-1 border-b border-slate-800/80">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          Quick Preview:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrame(introMidFrame);
            }}
            className="px-2.5 py-1 text-[11px] rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-medium transition"
          >
            ⚡ Entrance ({introMidFrame}f)
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrame(mergeFrame);
            }}
            className="px-2.5 py-1 text-[11px] rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-bold transition flex items-center gap-1"
          >
            💥 Merge Impact ({mergeFrame}f)
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrame(idleFrame);
            }}
            className="px-2.5 py-1 text-[11px] rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/40 font-bold transition flex items-center gap-1"
          >
            👁️ Idle Centered ({idleFrame}f)
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrame(breakupFrame);
            }}
            className="px-2.5 py-1 text-[11px] rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 font-medium transition"
          >
            🧩 Breakup ({breakupFrame}f)
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrame(outroFrame);
            }}
            className="px-2.5 py-1 text-[11px] rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 font-medium transition"
          >
            🌪️ Outro Sink ({outroFrame}f)
          </button>
        </div>
      </div>

      {/* Bottom Transport Controls */}
      <div className="flex items-center justify-between pt-1">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrame(0);
            }}
            title="Jump to Start (Frame 0)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrame((prev) => Math.max(0, prev - 1));
            }}
            title="Step Back 1 Frame"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className={`px-4 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play 60fps
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrame((prev) => Math.min(totalFrames - 1, prev + 1));
            }}
            title="Step Forward 1 Frame"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrame(totalFrames - 1);
            }}
            title="Jump to End (Frame 179)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Current Choreography Note */}
        <div className="text-[11px] text-slate-400 font-mono">
          {currentFrame < 7
            ? 'Anticipation'
            : currentFrame < 43
            ? 'Staggered Letter Arrival'
            : currentFrame < 57
            ? 'Lock-In Merge Impact'
            : currentFrame < 126
            ? 'Full Word Idle Watermark'
            : currentFrame < 141
            ? 'Letter Breakup Anticipation'
            : 'Outro Split & Sink'}
        </div>
      </div>
    </div>
  );
};
