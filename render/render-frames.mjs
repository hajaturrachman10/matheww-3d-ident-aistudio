#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read config.json
const configPath = path.join(rootDir, 'config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Allow CLI or ENV overrides
const textArg = process.env.IDENT_TEXT || process.argv.find(a => a.startsWith('--text='))?.split('=')[1];
const frontColorArg = process.env.IDENT_FRONT_COLOR || process.argv.find(a => a.startsWith('--frontColor='))?.split('=')[1];
const bevelColorArg = process.env.IDENT_BEVEL_COLOR || process.argv.find(a => a.startsWith('--bevelColor='))?.split('=')[1];
const sideColorArg = process.env.IDENT_SIDE_COLOR || process.argv.find(a => a.startsWith('--sideColor='))?.split('=')[1];
const durationArg = process.env.IDENT_DURATION || process.argv.find(a => a.startsWith('--duration='))?.split('=')[1];
const maxFramesArg = process.env.MAX_FRAMES || process.argv.find(a => a.startsWith('--maxFrames='))?.split('=')[1];

if (textArg) config.text = textArg;
if (frontColorArg) config.frontColor = frontColorArg;
if (bevelColorArg) config.bevelAccentColor = bevelColorArg;
if (sideColorArg) config.sideColor = sideColorArg;
if (durationArg) {
  config.duration = parseFloat(durationArg);
  config.totalFrames = Math.round(config.duration * (config.fps || 60));
}

// Write temporarily updated config so render-page gets the current values
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('='.repeat(60));
console.log('🎬 3D IDENT FRAME RENDERER (GOTHIC STREET EDITION)');
console.log(`Text:           "${config.text}"`);
console.log(`Font:           ${config.fontName || 'Pirata One'}`);
console.log(`Resolution:     ${config.width}x${config.height} (Portrait 9:16)`);
console.log(`FPS:            ${config.fps}`);
console.log(`Duration:       ${config.duration}s`);
console.log(`Total Frames:   ${config.totalFrames}`);
console.log(`Front Face:     ${config.frontColor} (Light Silver)`);
console.log(`Bevel Contour:  ${config.bevelAccentColor} (Electric Blue Accent)`);
console.log(`Side Extrusion: ${config.sideColor} (Dark Blue 3D Depth)`);
console.log(`Background:     ${config.backgroundColor} (Uniform Chroma Key Green)`);
console.log('='.repeat(60));

// Setup frames directory
const framesDir = path.join(rootDir, 'render', 'frames');
if (fs.existsSync(framesDir)) {
  fs.rmSync(framesDir, { recursive: true, force: true });
}
fs.mkdirSync(framesDir, { recursive: true });

// Start a lightweight static HTTP server for Three.js ES modules & assets
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/render/render-page.html';
  let filePath = path.join(rootDir, reqPath);

  // Fallback to public/ directory (standard Vite static convention)
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const publicCandidate = path.join(rootDir, 'public', reqPath);
    if (fs.existsSync(publicCandidate) && fs.statSync(publicCandidate).isFile()) {
      filePath = publicCandidate;
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`File not found: ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

await new Promise((resolve) => {
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    console.log(`📡 Local rendering server started on http://127.0.0.1:${port}`);
    resolve(port);
  });
});

const port = server.address().port;
const renderUrl = `http://127.0.0.1:${port}/render/render-page.html`;

console.log('🚀 Launching headless browser...');
const browser = await chromium.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--enable-webgl'
  ]
});

const context = await browser.newContext({
  viewport: {
    width: config.width,
    height: config.height
  },
  deviceScaleFactor: 1
});

const page = await context.newPage();

// Catch browser console logs and uncaught errors for debugging
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    console.error(`[Browser Error]: ${msg.text()}`);
  }
});
page.on('pageerror', (err) => {
  console.error(`[Browser PageError]: ${err.message}`);
});

console.log(`🌐 Navigating to ${renderUrl}...`);
await page.goto(renderUrl, { waitUntil: 'networkidle' });

// Wait for Three.js scene initialization
await page.waitForFunction(() => window.identReady === true || window.identError !== undefined, { timeout: 30000 });
const identError = await page.evaluate(() => window.identError);
if (identError) {
  throw new Error(`Scene initialization failed in browser: ${identError}`);
}
console.log('✅ Three.js ident engine initialized successfully.');

const totalFrames = config.totalFrames || 180;
const framesToRender = maxFramesArg ? Math.min(parseInt(maxFramesArg, 10), totalFrames) : totalFrames;
console.log(`📸 Rendering ${framesToRender} frames (0 to ${framesToRender - 1}) out of ${totalFrames} total...`);

const startTime = Date.now();

for (let i = 0; i < framesToRender; i++) {
  // Deterministically set frame
  await page.evaluate((idx) => {
    window.renderFrame(idx);
  }, i);

  const frameFileName = `frame_${String(i).padStart(4, '0')}.png`;
  const framePath = path.join(framesDir, frameFileName);

  // Capture screenshot of the viewport
  await page.screenshot({
    path: framePath,
    type: 'png',
    omitBackground: false
  });

  if ((i + 1) % 15 === 0 || i === framesToRender - 1) {
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    const percent = Math.round(((i + 1) / framesToRender) * 100);
    const fpsRate = ((i + 1) / ((Date.now() - startTime) / 1000)).toFixed(1);
    console.log(`[${String(i + 1).padStart(3, ' ')}/${framesToRender}] ${percent}% | ${fpsRate} fps | ${elapsedSec}s elapsed`);
  }
}

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n🎉 Frame rendering complete! All ${framesToRender} frames saved to ${framesDir}`);
console.log(`⏱️ Total render time: ${totalDuration}s`);

await browser.close();
server.close();
process.exit(0);
