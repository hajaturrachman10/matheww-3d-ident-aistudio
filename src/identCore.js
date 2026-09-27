/**
 * Core Mathematical and Kinematic Engine for MATHEWW 3D Ident
 *
 * SHARED SOURCE OF TRUTH:
 * This module is imported by both:
 * 1) The interactive Web preview studio (src/identEngine.ts)
 * 2) The headless deterministic renderer (render/render-page.html)
 *
 * This guarantees 100% visual parity across local preview and cloud GitHub Actions rendering.
 */

import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export const DEG_TO_RAD = Math.PI / 180;

// High-impact easing curves
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInCubic(t) {
  return t * t * t;
}

export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutBack(t, s = 1.35) {
  const c1 = s;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Distinct entrance trajectories per letter for dramatic multi-directional assembly
export const DEFAULT_ENTRANCE_PROFILES = [
  // 0: "M" - whips in from top-left with backspin
  { dx: -240, dy: 130, dz: 180, rotX: 18, rotY: -75, rotZ: -16, startScale: 0.75 },
  // 1: "A" - swoops up from bottom-left
  { dx: -160, dy: -150, dz: -120, rotX: -14, rotY: 60, rotZ: 14, startScale: 0.80 },
  // 2: "T" - drops from high center-top
  { dx: -35, dy: 220, dz: 140, rotX: 28, rotY: -45, rotZ: -8, startScale: 0.78 },
  // 3: "H" - blasts forward from deep center
  { dx: 15, dy: -60, dz: 340, rotX: -20, rotY: 65, rotZ: 12, startScale: 0.85 },
  // 4: "E" - launches from bottom-right
  { dx: 130, dy: -160, dz: -100, rotX: 16, rotY: -55, rotZ: -12, startScale: 0.80 },
  // 5: "W" - swoops in from upper-right
  { dx: 190, dy: 140, dz: 160, rotX: -16, rotY: 70, rotZ: 18, startScale: 0.78 },
  // 6: "W" - slams in from far right
  { dx: 260, dy: -80, dz: 120, rotX: 22, rotY: -80, rotZ: -20, startScale: 0.75 },
];

// Destabilization and Outro Sink/Split profiles
export const DEFAULT_OUTRO_PROFILES = [
  // 0: "M" - breaks far left and spins back-down
  { preDx: -16, preDy: 2, preDz: 6, preRotY: -5, outroDx: -300, outroDy: -160, outroDz: -550, outroRotX: -25, outroRotY: -75, outroRotZ: -24 },
  // 1: "A" - pulls left-up then sinks
  { preDx: -10, preDy: 8, preDz: -4, preRotY: -3, outroDx: -180, outroDy: -190, outroDz: -500, outroRotX: 20, outroRotY: 60, outroRotZ: 18 },
  // 2: "T" - lifts up and tumbles backward
  { preDx: -3, preDy: 12, preDz: 8, preRotY: 1, outroDx: -70, outroDy: -140, outroDz: -520, outroRotX: 75, outroRotY: -35, outroRotZ: -12 },
  // 3: "H" - pushes back and plunges straight down
  { preDx: 2, preDy: -4, preDz: -14, preRotY: 3, outroDx: 0, outroDy: -210, outroDz: -580, outroRotX: -60, outroRotY: 50, outroRotZ: 8 },
  // 4: "E" - drops slightly then pulls right-down
  { preDx: 8, preDy: -10, preDz: 6, preRotY: -2, outroDx: 80, outroDy: -170, outroDz: -510, outroRotX: 30, outroRotY: -65, outroRotZ: -20 },
  // 5: "W" - pulls right-up then spirals away
  { preDx: 12, preDy: 6, preDz: -4, preRotY: 4, outroDx: 190, outroDy: -180, outroDz: -540, outroRotX: -35, outroRotY: 80, outroRotZ: 25 },
  // 6: "W" - breaks far right and sinks deepest
  { preDx: 18, preDy: -2, preDz: 8, preRotY: 6, outroDx: 320, outroDy: -200, outroDz: -600, outroRotX: 45, outroRotY: -90, outroRotZ: -28 },
];

/**
 * Computes exact letter target coordinates so that when assembled, they replicate
 * the full word geometry centered precisely at the origin (0, 0, 0).
 */
export function computeLetterLayouts(text, font, config) {
  const size = config.geometry.size;
  const geomParams = {
    font: font,
    size: size,
    depth: config.geometry.depth,
    curveSegments: config.geometry.curveSegments,
    bevelEnabled: config.geometry.bevelEnabled,
    bevelThickness: config.geometry.bevelThickness,
    bevelSize: config.geometry.bevelSize,
    bevelOffset: config.geometry.bevelOffset,
    bevelSegments: config.geometry.bevelSegments,
  };

  // Full word geometry for exact center calculation
  const fullGeom = new TextGeometry(text, geomParams);
  fullGeom.computeBoundingBox();
  const fBox = fullGeom.boundingBox || new THREE.Box3();
  const wordWidth = fBox.max.x - fBox.min.x;
  const wordHeight = fBox.max.y - fBox.min.y;
  const wordCenterX = (fBox.min.x + fBox.max.x) / 2;
  const wordCenterY = (fBox.min.y + fBox.max.y) / 2;

  let curX = 0;
  const layouts = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const glyph = (font.data && font.data.glyphs && font.data.glyphs[ch]) ? font.data.glyphs[ch] : { ha: 1000 };
    const res = (font.data && font.data.resolution) ? font.data.resolution : 1000;
    const charAdvance = glyph.ha * (size / res);

    const charGeom = new TextGeometry(ch, geomParams);
    charGeom.computeBoundingBox();
    const cBox = charGeom.boundingBox || new THREE.Box3();
    const charCenterX = (cBox.min.x + cBox.max.x) / 2;
    const charCenterY = (cBox.min.y + cBox.max.y) / 2;

    const targetX = curX + charCenterX - wordCenterX;
    const targetY = charCenterY - wordCenterY;

    layouts.push({
      char: ch,
      index: i,
      targetX,
      targetY,
      advance: charAdvance,
    });

    curX += charAdvance;
  }

  return { layouts, wordWidth, wordHeight };
}

/**
 * Deterministic frame state calculator for PER-LETTER motion architecture.
 *
 * Timeline (3.00s / 180 frames @ 60fps):
 * Phase 1: 0.00s -> 0.12s (Empty anticipation, pure green chroma background)
 * Phase 2: 0.12s -> 0.72s (Staggered multi-directional letter entrance & snap)
 * Phase 3: 0.72s -> 0.95s (Lock-in impact, subtle overshoot & micro-shake settle)
 * Phase 4: 0.95s -> 2.10s (Centered legible idle, subtle yaw ±2°, floating, breathing)
 * Phase 5: 2.10s -> 2.35s (Pre-exit destabilization & letter separation)
 * Phase 6: 2.35s -> 3.00s (Outro split + shrink + sink backward/downward into depth)
 */
export function computeFrameState(frameIndex, config, letterLayouts) {
  const fps = config.fps || 60;
  const time = frameIndex / fps;
  const phases = config.animation.phases;
  const numLetters = letterLayouts.length || 7;

  let phase = 'idle_readable';
  let phaseProgress = 0;

  // Global word-group transforms
  let groupPosX = 0;
  let groupPosY = 0;
  let groupPosZ = 0;
  let groupRotX = 0;
  let groupRotY = 0;
  let groupRotZ = 0;
  let groupScaleX = 1;
  let groupScaleY = 1;
  let groupScaleZ = 1;

  const letterStates = [];

  if (time < phases.anticipationEnd) {
    // -------------------------------------------------------------
    // PHASE 1: EMPTY ANTICIPATION (0.00s -> 0.12s)
    // -------------------------------------------------------------
    phase = 'empty_anticipation';
    phaseProgress = time / phases.anticipationEnd;

    for (let i = 0; i < numLetters; i++) {
      const layout = letterLayouts[i];
      const entryProf = DEFAULT_ENTRANCE_PROFILES[i % DEFAULT_ENTRANCE_PROFILES.length];
      letterStates.push({
        char: layout.char,
        index: i,
        position: {
          x: layout.targetX + entryProf.dx,
          y: layout.targetY + entryProf.dy,
          z: entryProf.dz,
        },
        rotation: {
          x: entryProf.rotX * DEG_TO_RAD,
          y: entryProf.rotY * DEG_TO_RAD,
          z: entryProf.rotZ * DEG_TO_RAD,
        },
        scale: { x: 0, y: 0, z: 0 },
        visible: false, // Frame is clean and empty
      });
    }
  } else if (time < phases.entranceEnd) {
    // -------------------------------------------------------------
    // PHASE 2: STAGGERED LETTER-BY-LETTER ENTRANCE (0.12s -> 0.72s)
    // -------------------------------------------------------------
    phase = 'letter_entrance';
    const dur = phases.entranceEnd - phases.anticipationEnd;
    phaseProgress = (time - phases.anticipationEnd) / dur;

    const staggerStep = 0.045;
    const letterFlightDuration = 0.28;

    for (let i = 0; i < numLetters; i++) {
      const layout = letterLayouts[i];
      const entryProf = DEFAULT_ENTRANCE_PROFILES[i % DEFAULT_ENTRANCE_PROFILES.length];
      const letterStartTime = phases.anticipationEnd + i * staggerStep;

      if (time < letterStartTime) {
        letterStates.push({
          char: layout.char,
          index: i,
          position: {
            x: layout.targetX + entryProf.dx,
            y: layout.targetY + entryProf.dy,
            z: entryProf.dz,
          },
          rotation: {
            x: entryProf.rotX * DEG_TO_RAD,
            y: entryProf.rotY * DEG_TO_RAD,
            z: entryProf.rotZ * DEG_TO_RAD,
          },
          scale: { x: 0, y: 0, z: 0 },
          visible: false,
        });
      } else {
        const letterP = Math.min(1, (time - letterStartTime) / letterFlightDuration);
        const eased = easeOutBack(letterP, 1.25);

        const currentPosX = layout.targetX + entryProf.dx * (1 - Math.min(1, eased));
        const currentPosY = layout.targetY + entryProf.dy * (1 - Math.min(1, eased));
        const currentPosZ = entryProf.dz * (1 - Math.min(1, eased));

        const rotEase = easeOutCubic(letterP);
        const currentRotX = entryProf.rotX * (1 - rotEase) * DEG_TO_RAD;
        const currentRotY = entryProf.rotY * (1 - rotEase) * DEG_TO_RAD;
        const currentRotZ = entryProf.rotZ * (1 - rotEase) * DEG_TO_RAD;

        const s = entryProf.startScale + (1.0 - entryProf.startScale) * Math.min(1, eased);

        letterStates.push({
          char: layout.char,
          index: i,
          position: { x: currentPosX, y: currentPosY, z: currentPosZ },
          rotation: { x: currentRotX, y: currentRotY, z: currentRotZ },
          scale: { x: s, y: s, z: s },
          visible: true,
        });
      }
    }
  } else if (time < phases.mergeSettleEnd) {
    // -------------------------------------------------------------
    // PHASE 3: IMPACT LOCK-IN / MERGE / SETTLE (0.72s -> 0.95s)
    // -------------------------------------------------------------
    phase = 'impact_merge';
    const dur = phases.mergeSettleEnd - phases.entranceEnd;
    phaseProgress = (time - phases.entranceEnd) / dur;

    // Subtle impact scale pulse (1.00 -> 1.032 -> 1.00)
    const pulseT = Math.sin(phaseProgress * Math.PI);
    const pulseScale = 1.0 + pulseT * 0.032;
    groupScaleX = pulseScale;
    groupScaleY = pulseScale;
    groupScaleZ = pulseScale;

    // Micro-shake impact impulse decaying rapidly over 0.12s
    const shakeTime = time - phases.entranceEnd;
    if (shakeTime < 0.12) {
      const shakeDecay = Math.exp(-shakeTime * 22);
      const shakeWave = Math.sin(shakeTime * 70);
      groupPosX = shakeWave * 1.6 * shakeDecay;
      groupPosY = Math.cos(shakeTime * 60) * 1.0 * shakeDecay;
      groupRotZ = Math.sin(shakeTime * 50) * 0.005 * shakeDecay;
    }

    // Letters are locked into their word layout
    for (let i = 0; i < numLetters; i++) {
      const layout = letterLayouts[i];
      letterStates.push({
        char: layout.char,
        index: i,
        position: { x: layout.targetX, y: layout.targetY, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
      });
    }
  } else if (time < phases.idleEnd) {
    // -------------------------------------------------------------
    // PHASE 4: READABLE IDLE WATERMARK (0.95s -> 2.10s)
    // -------------------------------------------------------------
    phase = 'idle_readable';
    const dur = phases.idleEnd - phases.mergeSettleEnd;
    phaseProgress = (time - phases.mergeSettleEnd) / dur;

    const idleT = time - phases.mergeSettleEnd;
    const idleCfg = config.animation.idle;

    // Subtle gentle group floating (±2° yaw, ±0.9° pitch, 3.5px float)
    const sinYaw = Math.sin(idleT * Math.PI * 2 * idleCfg.frequencyHz);
    const cosPitch = Math.cos(idleT * Math.PI * 2 * idleCfg.frequencyHz * 0.7);

    groupRotY = sinYaw * idleCfg.yawRangeDeg * DEG_TO_RAD;
    groupRotX = cosPitch * idleCfg.pitchRangeDeg * DEG_TO_RAD;
    groupRotZ = Math.sin(idleT * Math.PI * idleCfg.frequencyHz * 0.5) * 0.4 * DEG_TO_RAD;

    groupPosY = Math.sin(idleT * Math.PI * 2 * idleCfg.frequencyHz) * idleCfg.floatRangeY;
    groupPosZ = Math.cos(idleT * Math.PI * idleCfg.frequencyHz) * 3.5;

    // Tiny breathing scale (1.000 -> 1.012 -> 1.000)
    const breath = Math.sin(idleT * Math.PI * 2 * idleCfg.frequencyHz * 0.5);
    const bs = 1.0 + breath * idleCfg.scaleBreathRange;
    groupScaleX = bs;
    groupScaleY = bs;
    groupScaleZ = bs;

    // Letters stay in exact aligned word layout
    for (let i = 0; i < numLetters; i++) {
      const layout = letterLayouts[i];
      letterStates.push({
        char: layout.char,
        index: i,
        position: { x: layout.targetX, y: layout.targetY, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
      });
    }
  } else if (time < phases.preExitEnd) {
    // -------------------------------------------------------------
    // PHASE 5: PRE-EXIT DESTABILIZATION & SEPARATION (2.10s -> 2.35s)
    // -------------------------------------------------------------
    phase = 'pre_exit_separation';
    const dur = phases.preExitEnd - phases.idleEnd;
    phaseProgress = (time - phases.idleEnd) / dur;
    const eased = easeInOutCubic(phaseProgress);

    // Group prepares with subtle reverse sway
    groupRotY = (-3.5 * eased) * DEG_TO_RAD;
    groupRotZ = (-1.5 * eased) * DEG_TO_RAD;
    groupPosY = (2.0 * (1 - eased));

    // Individual letters begin to separate slightly in X/Y/Z and rotate
    for (let i = 0; i < numLetters; i++) {
      const layout = letterLayouts[i];
      const outroProf = DEFAULT_OUTRO_PROFILES[i % DEFAULT_OUTRO_PROFILES.length];

      letterStates.push({
        char: layout.char,
        index: i,
        position: {
          x: layout.targetX + outroProf.preDx * eased,
          y: layout.targetY + outroProf.preDy * eased,
          z: outroProf.preDz * eased,
        },
        rotation: {
          x: 0,
          y: outroProf.preRotY * eased * DEG_TO_RAD,
          z: (outroProf.preDx > 0 ? 1 : -1) * 1.5 * eased * DEG_TO_RAD,
        },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        visible: true,
      });
    }
  } else {
    // -------------------------------------------------------------
    // PHASE 6: OUTRO / SPLIT / SHRINK / SINK (2.35s -> 3.00s)
    // -------------------------------------------------------------
    phase = 'outro_sink';
    const dur = phases.outroEnd - phases.preExitEnd;
    phaseProgress = Math.min(1, (time - phases.preExitEnd) / dur);

    // Aggressive exponential ease-in for dramatic sudden split & plunge
    const eased = Math.pow(phaseProgress, 2.6);

    groupRotY = (-3.5 + (12.0 * eased)) * DEG_TO_RAD;
    groupPosY = -20 * eased;

    for (let i = 0; i < numLetters; i++) {
      const layout = letterLayouts[i];
      const outroProf = DEFAULT_OUTRO_PROFILES[i % DEFAULT_OUTRO_PROFILES.length];

      // 1. Separate outward in X
      const curX = layout.targetX + outroProf.preDx + outroProf.outroDx * eased;
      // 2. Sink downward in Y and backward in Z
      const curY = layout.targetY + outroProf.preDy + outroProf.outroDy * eased;
      const curZ = outroProf.preDz + outroProf.outroDz * eased;

      // 3. Shrink cleanly to zero
      const s = Math.max(0, 1.0 - 1.0 * Math.pow(phaseProgress, 1.8));

      // 4. Dramatic tumbling rotations
      const curRotX = outroProf.outroRotX * eased * DEG_TO_RAD;
      const curRotY = (outroProf.preRotY + outroProf.outroRotY * eased) * DEG_TO_RAD;
      const curRotZ = outroProf.outroRotZ * eased * DEG_TO_RAD;

      letterStates.push({
        char: layout.char,
        index: i,
        position: { x: curX, y: curY, z: curZ },
        rotation: { x: curRotX, y: curRotY, z: curRotZ },
        scale: { x: s, y: s, z: s },
        visible: s > 0.01,
      });
    }
  }

  return {
    frameIndex,
    timeSeconds: Number(time.toFixed(4)),
    phase,
    phaseProgress: Number(phaseProgress.toFixed(4)),
    groupPosition: { x: groupPosX, y: groupPosY, z: groupPosZ },
    groupRotation: { x: groupRotX, y: groupRotY, z: groupRotZ },
    groupScale: { x: groupScaleX, y: groupScaleY, z: groupScaleZ },
    letters: letterStates,
  };
}

/**
 * ADAPTIVE CAMERA AUTO-FIT:
 * Computes exact camera distance Z so the complete word occupies the middle 80% safe width.
 * Never clips any letter (neither M nor the final W).
 */
export function fitTextToCamera(
  wordWidth,
  wordHeight,
  camera,
  safeWidthRatio = 0.80,
  safeHeightRatio = 0.35
) {
  const fovRad = (camera.fov * Math.PI) / 180;
  const aspect = camera.aspect;

  const zForWidth = Math.max(1, wordWidth) / (2 * Math.tan(fovRad / 2) * aspect * safeWidthRatio);
  const zForHeight = Math.max(1, wordHeight) / (2 * Math.tan(fovRad / 2) * safeHeightRatio);

  return Math.max(zForWidth, zForHeight);
}
