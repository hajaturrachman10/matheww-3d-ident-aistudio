import * as THREE from 'three';
import { FontLoader, type Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import type { IdentConfig, FrameState, LetterLayout, LetterTransform } from './types.ts';
import {
  DEG_TO_RAD,
  easeOutCubic,
  easeInCubic,
  easeOutQuad,
  easeInOutCubic,
  easeOutBack,
  DEFAULT_ENTRANCE_PROFILES,
  DEFAULT_OUTRO_PROFILES,
  computeLetterLayouts as coreComputeLetterLayouts,
  computeFrameState as coreComputeFrameState,
  fitTextToCamera as coreFitTextToCamera,
} from './identCore.js';

export {
  DEG_TO_RAD,
  easeOutCubic,
  easeInCubic,
  easeOutQuad,
  easeInOutCubic,
  easeOutBack,
  DEFAULT_ENTRANCE_PROFILES,
  DEFAULT_OUTRO_PROFILES,
};

export function computeLetterLayouts(
  text: string,
  font: Font,
  config: IdentConfig
): { layouts: LetterLayout[]; wordWidth: number; wordHeight: number } {
  return coreComputeLetterLayouts(text, font, config);
}

export function computeFrameState(
  frameIndex: number,
  config: IdentConfig,
  letterLayouts: LetterLayout[]
): FrameState {
  return coreComputeFrameState(frameIndex, config, letterLayouts) as FrameState;
}

let cachedFont: Font | null = null;
let cachedFontUrl: string | null = null;

export async function loadFont(url: string): Promise<Font> {
  if (cachedFont && cachedFontUrl === url) {
    return cachedFont;
  }
  const loader = new FontLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (font) => {
        cachedFont = font;
        cachedFontUrl = url;
        resolve(font);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

/**
 * Creates the 3D text parent group containing an individual mesh for each letter.
 * Each letter geometry is centered around its own local center for independent rotation/scale,
 * and positioned into the group according to its calculated target word position.
 */
export function createIdentTextMesh(
  font: Font,
  config: IdentConfig,
  letterLayouts: LetterLayout[]
): { group: THREE.Group; letterMeshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.name = 'ident-root';

  // Front face material: Cold off-white / silver metallic (#F2F4F7)
  const frontMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.frontColor),
    roughness: config.materials.frontRoughness,
    metalness: config.materials.frontMetalness,
    clearcoat: config.materials.frontClearcoat,
    clearcoatRoughness: 0.15,
    reflectivity: 0.9,
  });

  // Bevel & side extrusion material: Electric blue contour + deep navy blue side depth
  const sideMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.sideColor),
    emissive: new THREE.Color(config.bevelAccentColor),
    emissiveIntensity: 0.18,
    roughness: config.materials.sideRoughness,
    metalness: config.materials.sideMetalness,
    clearcoat: config.materials.sideClearcoat,
    clearcoatRoughness: 0.1,
  });

  const letterMeshes: THREE.Mesh[] = [];

  for (let i = 0; i < letterLayouts.length; i++) {
    const layout = letterLayouts[i];
    const geom = new TextGeometry(layout.char, {
      font: font,
      size: config.geometry.size,
      depth: config.geometry.depth,
      curveSegments: config.geometry.curveSegments,
      bevelEnabled: config.geometry.bevelEnabled,
      bevelThickness: config.geometry.bevelThickness,
      bevelSize: config.geometry.bevelSize,
      bevelOffset: config.geometry.bevelOffset,
      bevelSegments: config.geometry.bevelSegments,
    });

    geom.computeBoundingBox();
    geom.center(); // Center geometry around its own origin
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, [frontMaterial, sideMaterial]);
    mesh.name = `letter-mesh-${i}`;
    mesh.userData = { index: i, char: layout.char, targetX: layout.targetX, targetY: layout.targetY };
    mesh.position.set(layout.targetX, layout.targetY, 0);
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    group.add(mesh);
    letterMeshes.push(mesh);
  }

  return { group, letterMeshes };
}

/**
 * ADAPTIVE CAMERA AUTO-FIT:
 * Computes exact camera distance Z so the complete word occupies the middle 80% safe width.
 * Never clips any letter (neither M nor the final W).
 */
export function fitTextToCamera(
  wordWidth: number,
  wordHeight: number,
  camera: THREE.PerspectiveCamera,
  safeWidthRatio: number = 0.80,
  safeHeightRatio: number = 0.35
): number {
  const fovRad = (camera.fov * Math.PI) / 180;
  const aspect = camera.aspect;

  const zForWidth = Math.max(1, wordWidth) / (2 * Math.tan(fovRad / 2) * aspect * safeWidthRatio);
  const zForHeight = Math.max(1, wordHeight) / (2 * Math.tan(fovRad / 2) * safeHeightRatio);

  return Math.max(zForWidth, zForHeight);
}

/**
 * Builds the Three.js scene, lights, and camera.
 */
export function setupScene(config: IdentConfig, canvasWidth: number, canvasHeight: number) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.backgroundColor || '#00FF00');

  const aspect = canvasWidth / canvasHeight;
  const camera = new THREE.PerspectiveCamera(config.camera.fov, aspect, config.camera.near, config.camera.far);
  camera.position.set(...config.camera.position);
  camera.lookAt(0, 0, 0);

  // Studio lighting tuned for Silver face + Electric Blue edge bevel glints
  const ambientLight = new THREE.AmbientLight(0xffffff, config.lights.ambientIntensity);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(
    new THREE.Color(config.lights.keyLight.color),
    config.lights.keyLight.intensity
  );
  keyLight.position.set(...config.lights.keyLight.position);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(
    new THREE.Color(config.lights.rimLight.color),
    config.lights.rimLight.intensity
  );
  rimLight.position.set(...config.lights.rimLight.position);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(
    new THREE.Color(config.lights.fillLight.color),
    config.lights.fillLight.intensity
  );
  fillLight.position.set(...config.lights.fillLight.position);
  scene.add(fillLight);

  const edgeAccentLight = new THREE.DirectionalLight(
    new THREE.Color(config.lights.edgeAccentLight.color),
    config.lights.edgeAccentLight.intensity
  );
  edgeAccentLight.position.set(...config.lights.edgeAccentLight.position);
  scene.add(edgeAccentLight);

  return { scene, camera, ambientLight, keyLight, rimLight, fillLight, edgeAccentLight };
}

/**
 * Applies deterministic frame state to both group root and individual letter meshes.
 */
export function applyFrameState(
  group: THREE.Group,
  letterMeshes: THREE.Mesh[],
  state: FrameState
) {
  // Apply group transforms
  group.position.set(state.groupPosition.x, state.groupPosition.y, state.groupPosition.z);
  group.rotation.set(state.groupRotation.x, state.groupRotation.y, state.groupRotation.z);
  group.scale.set(state.groupScale.x, state.groupScale.y, state.groupScale.z);

  // Apply per-letter transforms
  for (let i = 0; i < state.letters.length; i++) {
    const lState = state.letters[i];
    const mesh = letterMeshes[i];
    if (mesh) {
      mesh.visible = lState.visible;
      mesh.position.set(lState.position.x, lState.position.y, lState.position.z);
      mesh.rotation.set(lState.rotation.x, lState.rotation.y, lState.rotation.z);
      mesh.scale.set(lState.scale.x, lState.scale.y, lState.scale.z);
    }
  }
}
