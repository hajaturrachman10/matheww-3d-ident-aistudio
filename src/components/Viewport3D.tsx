import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { type Font } from 'three/addons/loaders/FontLoader.js';
import {
  loadFont,
  computeLetterLayouts,
  createIdentTextMesh,
  setupScene,
  applyFrameState,
  computeFrameState,
  fitTextToCamera,
} from '../identEngine.ts';
import type { IdentConfig, FrameState, LetterLayout } from '../types.ts';
import { Video, Layers, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

interface Viewport3DProps {
  config: IdentConfig;
  currentFrame: number;
  bgMode: 'green' | 'dark' | 'videoMock';
  setBgMode: (mode: 'green' | 'dark' | 'videoMock') => void;
  onFrameUpdate?: (state: FrameState) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  config,
  currentFrame,
  bgMode,
  setBgMode,
  onFrameUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const textGroupRef = useRef<THREE.Group | null>(null);
  const letterMeshesRef = useRef<THREE.Mesh[]>([]);
  const letterLayoutsRef = useRef<LetterLayout[]>([]);
  const fontRef = useRef<Font | null>(null);

  const [isLoadingFont, setIsLoadingFont] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{ textWidth: number; textHeight: number; cameraZ: number } | null>(null);

  // Helper to recompute camera distance so the word stays in middle 80% safe area
  const autoFrameCamera = (wordWidth: number, wordHeight: number, camera: THREE.PerspectiveCamera) => {
    const optimalZ = fitTextToCamera(
      wordWidth,
      wordHeight,
      camera,
      config.framing?.safeWidthRatio || 0.80,
      config.framing?.safeHeightRatio || 0.35
    );
    camera.position.set(0, 0, optimalZ);
    camera.lookAt(0, 0, 0);
    setMetrics({
      textWidth: Math.round(wordWidth),
      textHeight: Math.round(wordHeight),
      cameraZ: Math.round(optimalZ),
    });
  };

  // Initialize Three.js scene
  useEffect(() => {
    let isMounted = true;

    async function initScene() {
      if (!canvasRef.current || !containerRef.current) return;
      setIsLoadingFont(true);
      setLoadError(null);

      try {
        const font = await loadFont(config.fontPath);
        if (!isMounted) return;
        fontRef.current = font;

        // Container aspect ratio (9:16 portrait)
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const { scene, camera } = setupScene(config, width, height);
        sceneRef.current = scene;
        cameraRef.current = camera;

        if (bgMode === 'green') {
          scene.background = new THREE.Color(config.backgroundColor || '#00FF00');
        } else if (bgMode === 'dark') {
          scene.background = new THREE.Color('#0A0D14');
        } else {
          scene.background = null;
        }

        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        rendererRef.current = renderer;

        // Compute letter layouts for exact word assembly
        const { layouts, wordWidth, wordHeight } = computeLetterLayouts(config.text, font, config);
        letterLayoutsRef.current = layouts;

        // Create per-letter 3D meshes inside parent group
        const { group, letterMeshes } = createIdentTextMesh(font, config, layouts);
        scene.add(group);
        textGroupRef.current = group;
        letterMeshesRef.current = letterMeshes;

        // Adapt camera framing to full word geometry bounds
        autoFrameCamera(wordWidth, wordHeight, camera);

        // Update frame
        const state = computeFrameState(currentFrame, config, layouts);
        applyFrameState(group, letterMeshes, state);
        renderer.render(scene, camera);
        onFrameUpdate?.(state);

        setIsLoadingFont(false);
      } catch (err: any) {
        console.error('Failed to initialize 3D scene:', err);
        if (isMounted) {
          setLoadError(err?.message || 'Failed to load font or WebGL scene');
          setIsLoadingFont(false);
        }
      }
    }

    initScene();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current || !fontRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      cameraRef.current.aspect = rect.width / rect.height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(rect.width, rect.height);

      const { wordWidth, wordHeight } = computeLetterLayouts(config.text, fontRef.current, config);
      autoFrameCamera(wordWidth, wordHeight, cameraRef.current);

      if (sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [config.fontPath]);

  // Re-create text meshes when geometry / text / color config changes
  useEffect(() => {
    if (!sceneRef.current || !fontRef.current || !cameraRef.current) return;

    if (textGroupRef.current) {
      sceneRef.current.remove(textGroupRef.current);
      letterMeshesRef.current.forEach((mesh) => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else mesh.material.dispose();
        }
      });
    }

    // Recompute letter layouts and meshes
    const { layouts, wordWidth, wordHeight } = computeLetterLayouts(config.text, fontRef.current, config);
    letterLayoutsRef.current = layouts;

    const { group, letterMeshes } = createIdentTextMesh(fontRef.current, config, layouts);
    sceneRef.current.add(group);
    textGroupRef.current = group;
    letterMeshesRef.current = letterMeshes;

    // Recalculate auto-framing camera distance so entire word MATHEWW fits in safe 80% zone
    autoFrameCamera(wordWidth, wordHeight, cameraRef.current);

    // Render current frame with new meshes
    const state = computeFrameState(currentFrame, config, layouts);
    applyFrameState(group, letterMeshes, state);
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [
    config.text,
    config.frontColor,
    config.bevelAccentColor,
    config.sideColor,
    config.geometry.size,
    config.geometry.depth,
    config.geometry.bevelEnabled,
    config.geometry.bevelThickness,
    config.geometry.bevelSize,
    config.geometry.bevelSegments,
    config.materials.frontRoughness,
    config.materials.frontMetalness,
    config.materials.frontClearcoat,
  ]);

  // Handle background mode changes
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    if (bgMode === 'green') {
      sceneRef.current.background = new THREE.Color(config.backgroundColor || '#00FF00');
    } else if (bgMode === 'dark') {
      sceneRef.current.background = new THREE.Color('#0b101b');
    } else {
      sceneRef.current.background = null;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [bgMode, config.backgroundColor]);

  // Handle deterministic frame change
  useEffect(() => {
    if (
      !textGroupRef.current ||
      !sceneRef.current ||
      !cameraRef.current ||
      !rendererRef.current ||
      letterLayoutsRef.current.length === 0
    ) {
      return;
    }

    const state = computeFrameState(currentFrame, config, letterLayoutsRef.current);
    applyFrameState(textGroupRef.current, letterMeshesRef.current, state);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    onFrameUpdate?.(state);
  }, [currentFrame, config.animation]);

  // Download snapshot PNG directly
  const handleDownloadSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${config.text}_frame_${String(currentFrame).padStart(4, '0')}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 relative select-none">
      {/* Top Viewport Header / Mode Bar */}
      <div className="w-full max-w-[420px] flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-t-xl backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider text-slate-200 uppercase">
            9:16 Canvas ({config.width}×{config.height})
          </span>
        </div>

        {/* Viewport BG switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setBgMode('green')}
            title="Uniform Chroma Green (#00FF00)"
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
              bgMode === 'green'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00FF00] border border-black/40"></span>
            Chroma Key
          </button>
          <button
            onClick={() => setBgMode('dark')}
            title="Dark Studio View"
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
              bgMode === 'dark'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            Studio
          </button>
          <button
            onClick={() => setBgMode('videoMock')}
            title="Preview overlay on simulated gameplay/video"
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
              bgMode === 'videoMock'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3 h-3" />
            Overlay Test
          </button>
        </div>
      </div>

      {/* 9:16 Phone Aspect Frame Viewport */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[420px] aspect-[9/16] bg-black border-x border-b border-slate-800 rounded-b-xl shadow-2xl overflow-hidden flex items-center justify-center"
      >
        {/* Mock background video overlay if selected */}
        {bgMode === 'videoMock' && (
          <div className="absolute inset-0 z-0 bg-cover bg-center overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 opacity-90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.15),transparent_70%)]"></div>
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-4 left-4 text-xs font-mono text-white/50 bg-black/40 px-2 py-1 rounded backdrop-blur">
              Shorts Video Simulation
            </div>
            <div className="absolute bottom-16 right-4 flex flex-col items-center gap-3 text-white/70">
              <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-xs">
                ❤️
              </div>
              <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-xs">
                💬
              </div>
              <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-xs">
                ↗️
              </div>
            </div>
          </div>
        )}

        {/* Safe-Area Guide Overlay Lines (Middle 80% Safe Zone) */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-30 flex">
          {/* Left margin 10% */}
          <div className="w-[10%] h-full border-r border-dashed border-cyan-400"></div>
          {/* Middle 80% safe zone */}
          <div className="w-[80%] h-full relative">
            <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-300">
              80% Safe Zone
            </div>
          </div>
          {/* Right margin 10% */}
          <div className="w-[10%] h-full border-l border-dashed border-cyan-400"></div>
        </div>

        {/* Loading Spinner */}
        {isLoadingFont && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-20 text-white gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-300 font-medium">Building Per-Letter 3D Meshes...</p>
          </div>
        )}

        {/* Load Error */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 text-red-400 p-6 text-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="font-semibold text-sm">Failed to initialize 3D scene</p>
            <p className="text-xs text-slate-400">{loadError}</p>
          </div>
        )}

        {/* WebGL Canvas */}
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* Floating Quick Download Frame Button */}
        <div className="absolute bottom-3 left-3 z-20">
          <button
            onClick={handleDownloadSnapshot}
            className="px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white text-[11px] rounded border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all shadow"
            title="Download current frame snapshot as PNG"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Snapshot PNG
          </button>
        </div>

        {/* Target Format & Safe Auto-Framing Badge */}
        <div className="absolute bottom-3 right-3 z-20 pointer-events-none flex items-center gap-1.5">
          <div className="px-2 py-0.5 bg-black/70 text-emerald-300 text-[10px] font-mono rounded border border-emerald-500/30 backdrop-blur flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Auto-Framed (10% margins)
          </div>
          <div className="px-2 py-0.5 bg-black/70 text-slate-300 text-[10px] font-mono rounded border border-white/10 backdrop-blur">
            F{currentFrame + 1}/{config.totalFrames}
          </div>
        </div>
      </div>
    </div>
  );
};
