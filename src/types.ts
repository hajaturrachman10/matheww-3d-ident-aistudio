export interface LetterLayout {
  char: string;
  index: number;
  targetX: number;
  targetY: number;
  advance: number;
}

export interface LetterTransform {
  char: string;
  index: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  visible: boolean;
}

export interface IdentConfig {
  text: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  totalFrames: number;
  frontColor: string; // Off-white/silver #F2F4F7
  bevelAccentColor: string; // Vivid electric/royal blue #1480FF
  sideColor: string; // Deep darker blue #053494
  backgroundColor: string; // Pure uniform #00FF00
  fontPath: string;
  fontName: string;
  geometry: {
    size: number;
    depth: number;
    curveSegments: number;
    bevelEnabled: boolean;
    bevelThickness: number;
    bevelSize: number;
    bevelOffset: number;
    bevelSegments: number;
  };
  materials: {
    frontRoughness: number;
    frontMetalness: number;
    frontClearcoat: number;
    sideRoughness: number;
    sideMetalness: number;
    sideClearcoat: number;
  };
  framing: {
    safeWidthRatio: number; // middle 80% width (10% safe margins)
    safeHeightRatio: number;
  };
  animation: {
    phases: {
      anticipationEnd: number; // 0.12s
      entranceEnd: number; // 0.72s
      mergeSettleEnd: number; // 0.95s
      idleEnd: number; // 2.10s
      preExitEnd: number; // 2.35s
      outroEnd: number; // 3.00s
    };
    idle: {
      yawRangeDeg: number; // ±2.0°
      pitchRangeDeg: number; // ±0.9°
      floatRangeY: number; // 3.5px
      scaleBreathRange: number; // 0.012
      frequencyHz: number; // 0.75
    };
  };
  camera: {
    fov: number;
    near: number;
    far: number;
    position: [number, number, number];
  };
  lights: {
    ambientIntensity: number;
    keyLight: {
      color: string;
      intensity: number;
      position: [number, number, number];
    };
    rimLight: {
      color: string;
      intensity: number;
      position: [number, number, number];
    };
    fillLight: {
      color: string;
      intensity: number;
      position: [number, number, number];
    };
    edgeAccentLight: {
      color: string;
      intensity: number;
      position: [number, number, number];
    };
  };
}

export interface FrameState {
  frameIndex: number;
  timeSeconds: number;
  phase: 'empty_anticipation' | 'letter_entrance' | 'impact_merge' | 'idle_readable' | 'pre_exit_separation' | 'outro_sink';
  phaseProgress: number; // 0.0 to 1.0 within current phase
  groupPosition: { x: number; y: number; z: number };
  groupRotation: { x: number; y: number; z: number };
  groupScale: { x: number; y: number; z: number };
  letters: LetterTransform[];
}
