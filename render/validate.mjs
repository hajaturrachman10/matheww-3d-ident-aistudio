#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const configPath = path.join(rootDir, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const framesDir = path.join(rootDir, 'render', 'frames');
const outputDir = path.join(rootDir, 'output');

console.log('='.repeat(60));
console.log('🔎 3D Ident Video & Frame Validator');
console.log('='.repeat(60));

// 1. Check frames
if (!fs.existsSync(framesDir)) {
  console.error(`❌ Frames directory missing: ${framesDir}`);
  process.exit(1);
}

const frames = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
const expectedFrames = config.totalFrames || Math.round(config.duration * (config.fps || 60));

if (frames.length !== expectedFrames) {
  console.error(`❌ Frame count validation failed: found ${frames.length} frames, expected ${expectedFrames}`);
  process.exit(1);
}
console.log(`✓ Source frames verified: exactly ${frames.length} frames in ${framesDir}`);

// 2. Check output directory and MP4 file
const cleanText = config.text.replace(/[^a-zA-Z0-9_-]/g, '_');
const outputFileName = `${cleanText}_3D_ident_${config.width}x${config.height}_${config.fps}fps.mp4`;
const outputPath = path.join(outputDir, outputFileName);

if (!fs.existsSync(outputPath)) {
  console.error(`❌ Output MP4 file does not exist: ${outputPath}`);
  process.exit(1);
}

const stats = fs.statSync(outputPath);
if (stats.size === 0) {
  console.error(`❌ Output MP4 file is empty (0 bytes): ${outputPath}`);
  process.exit(1);
}
console.log(`✓ Output MP4 exists: ${outputPath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

// 3. ffprobe inspection
const probe = spawnSync('ffprobe', [
  '-v', 'error',
  '-select_streams', 'v:0',
  '-show_entries', 'stream=codec_name,width,height,r_frame_rate,duration,nb_frames',
  '-of', 'json',
  outputPath
], { encoding: 'utf8' });

if (probe.status !== 0 || !probe.stdout) {
  console.error('❌ ffprobe failed to analyze video file:', probe.stderr);
  process.exit(1);
}

const probeData = JSON.parse(probe.stdout);
const stream = probeData.streams && probeData.streams[0];
if (!stream) {
  console.error('❌ No video stream found in MP4 file.');
  process.exit(1);
}

if (stream.codec_name !== 'h264') {
  console.error(`❌ Codec mismatch: expected "h264", got "${stream.codec_name}"`);
  process.exit(1);
}
console.log(`✓ Codec confirmed: ${stream.codec_name} (H.264)`);

if (stream.width !== config.width || stream.height !== config.height) {
  console.error(`❌ Resolution mismatch: expected ${config.width}x${config.height}, got ${stream.width}x${stream.height}`);
  process.exit(1);
}
console.log(`✓ Resolution confirmed: ${stream.width}x${stream.height}`);

const [fpsNum, fpsDen] = (stream.r_frame_rate || '').split('/').map(Number);
const actualFps = fpsDen ? fpsNum / fpsDen : (fpsNum || 0);
if (Math.abs(actualFps - config.fps) > 0.01) {
  console.error(`❌ Framerate mismatch: expected ${config.fps} fps, got ${actualFps} fps`);
  process.exit(1);
}
console.log(`✓ Framerate confirmed: ${actualFps} fps`);

const durationSec = parseFloat(stream.duration);
if (isNaN(durationSec) || Math.abs(durationSec - config.duration) > 0.25) {
  console.error(`❌ Duration mismatch: expected ~${config.duration}s, got ${durationSec}s`);
  process.exit(1);
}
console.log(`✓ Duration confirmed: ${durationSec.toFixed(2)}s (approx. ${config.duration}s)`);

console.log('='.repeat(60));
console.log('🏆 All video validation checks PASSED successfully!');
console.log('='.repeat(60));
