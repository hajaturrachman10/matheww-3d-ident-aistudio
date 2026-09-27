#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Step 1/2: Rendering frames with Playwright...');
const renderFrames = spawnSync('node', [path.join(__dirname, 'render-frames.mjs'), ...process.argv.slice(2)], {
  stdio: 'inherit'
});

if (renderFrames.status !== 0) {
  console.error('❌ Frame rendering aborted with error.');
  process.exit(renderFrames.status || 1);
}

console.log('\n🎬 Step 2/2: Encoding MP4 with FFmpeg...');
const encode = spawnSync('node', [path.join(__dirname, 'encode.mjs')], {
  stdio: 'inherit'
});

if (encode.status !== 0) {
  console.error('❌ Video encoding aborted with error.');
  process.exit(encode.status || 1);
}

console.log('\n✨ Entire pipeline completed successfully!');
