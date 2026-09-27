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

if (fs.existsSync(outputPath)) {
  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log('\n' + '='.repeat(60));
  console.log('✅ Video encoding successful!');
  console.log(`📁 File:   ${outputPath}`);
  console.log(`📊 Size:   ${sizeMB} MB`);
  console.log(`⏱️ Duration: ${config.duration} seconds`);
  console.log(`📐 Resolution: ${config.width}x${config.height}`);
  console.log('='.repeat(60));
} else {
  console.error('❌ Output file was not created.');
  process.exit(1);
}
