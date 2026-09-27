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

if (!fs.existsSync(framesDir)) {
  console.error(`❌ Frames directory not found: ${framesDir}`);
  console.error('Please run "node render/render-frames.mjs" first to generate frames.');
  process.exit(1);
}

const frames = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
if (frames.length === 0) {
  console.error(`❌ No PNG frames found in ${framesDir}`);
  process.exit(1);
}

const expectedFrames = config.totalFrames || Math.round(config.duration * (config.fps || 60));
if (frames.length !== expectedFrames) {
  console.error(`❌ Frame count mismatch: found ${frames.length} frames, expected ${expectedFrames} frames.`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Clean sanitization for filename
const cleanText = config.text.replace(/[^a-zA-Z0-9_-]/g, '_');
const outputFileName = `${cleanText}_3D_ident_${config.width}x${config.height}_${config.fps}fps.mp4`;
const outputPath = path.join(outputDir, outputFileName);

console.log('='.repeat(60));
console.log('🎥 FFmpeg Video Encoder');
console.log(`Input:        ${frames.length} frames from ${framesDir}`);
console.log(`Framerate:    ${config.fps} fps`);
console.log(`Output:       ${outputPath}`);
console.log(`Chroma Key:   ${config.backgroundColor} (Ready for CapCut / Premiere / AE)`);
console.log('='.repeat(60));

// Check if ffmpeg is available
const checkFfmpeg = spawnSync('ffmpeg', ['-version']);
if (checkFfmpeg.error || checkFfmpeg.status !== 0) {
  console.error('❌ FFmpeg is not installed or not in PATH.');
  console.error('To install FFmpeg:');
  console.error('  - Ubuntu/Debian: sudo apt-get install ffmpeg');
  console.error('  - macOS: brew install ffmpeg');
  console.error('  - Windows: winget install Gyan.FFmpeg or scoop install ffmpeg');
  process.exit(1);
}

const ffmpegArgs = [
  '-y',
  '-framerate', String(config.fps || 60),
  '-i', path.join(framesDir, 'frame_%04d.png'),
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-crf', '17', // visually lossless
  '-preset', 'slow',
  '-movflags', '+faststart',
  outputPath
];

console.log(`Executing: ffmpeg ${ffmpegArgs.join(' ')}`);

const result = spawnSync('ffmpeg', ffmpegArgs, { stdio: 'inherit' });

if (result.status !== 0) {
  console.error('❌ FFmpeg encoding failed.');
  process.exit(result.status || 1);
}

if (!fs.existsSync(outputPath)) {
  console.error('❌ Output file was not created.');
  process.exit(1);
}

const stats = fs.statSync(outputPath);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log('\n' + '='.repeat(60));
console.log('✅ Video encoding successful!');
console.log(`📁 File:   ${outputPath}`);
console.log(`📊 Size:   ${sizeMB} MB`);
console.log(`⏱️ Duration: ${config.duration} seconds`);
console.log(`📐 Resolution: ${config.width}x${config.height}`);
console.log('='.repeat(60));

// Validate generated video using ffprobe
console.log('🔍 Validating video stream characteristics via ffprobe...');
const probeResult = spawnSync('ffprobe', [
  '-v', 'error',
  '-select_streams', 'v:0',
  '-show_entries', 'stream=codec_name,width,height,r_frame_rate,duration,nb_frames',
  '-of', 'json',
  outputPath
], { encoding: 'utf8' });

if (probeResult.status !== 0 || !probeResult.stdout) {
  console.error('❌ ffprobe validation command failed.');
  if (probeResult.stderr) console.error(probeResult.stderr);
  process.exit(1);
}

let probeData;
try {
  probeData = JSON.parse(probeResult.stdout);
} catch (e) {
  console.error('❌ Failed to parse ffprobe output as JSON:', e);
  process.exit(1);
}

const stream = probeData.streams && probeData.streams[0];
if (!stream) {
  console.error('❌ ffprobe failed to find a video stream in the generated file.');
  process.exit(1);
}

if (stream.codec_name !== 'h264') {
  console.error(`❌ Validation failed: expected codec "h264", got "${stream.codec_name}"`);
  process.exit(1);
}

if (stream.width !== config.width || stream.height !== config.height) {
  console.error(`❌ Validation failed: expected resolution ${config.width}x${config.height}, got ${stream.width}x${stream.height}`);
  process.exit(1);
}

const [fpsNum, fpsDen] = (stream.r_frame_rate || '').split('/').map(Number);
const actualFps = fpsDen ? fpsNum / fpsDen : (fpsNum || 0);
if (Math.abs(actualFps - config.fps) > 0.01) {
  console.error(`❌ Validation failed: expected ${config.fps} fps, got ${actualFps} fps (${stream.r_frame_rate})`);
  process.exit(1);
}

const videoDuration = parseFloat(stream.duration);
if (!isNaN(videoDuration) && Math.abs(videoDuration - config.duration) > 0.25) {
  console.error(`❌ Validation failed: expected duration ~${config.duration}s, got ${videoDuration}s`);
  process.exit(1);
}

console.log('🎉 Final video validation PASSED:');
console.log(`   ✓ File exists: ${outputFileName}`);
console.log(`   ✓ H.264 video stream confirmed (${stream.codec_name})`);
console.log(`   ✓ Resolution: ${stream.width}x${stream.height}`);
console.log(`   ✓ Framerate: ${actualFps} fps (${stream.r_frame_rate})`);
console.log(`   ✓ Duration: ${videoDuration ? videoDuration.toFixed(2) + 's' : config.duration + 's'} (expected ~${config.duration}s)`);
console.log(`   ✓ Source frames: ${frames.length} frames (exactly matches ${expectedFrames})`);
