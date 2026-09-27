# 3D Text Ident Generator ("MATHEWW") - Gothic Street Edition

A deterministic cloud-rendered 3D text ident generator for vertical short-form video (portrait 1080×1920, 60 fps, 3.0 seconds, 180 frames) featuring the exact text **"MATHEWW"**.

Engineered for creators who want an intimidating gothic street 3D motion graphic without stressing their computer or needing desktop 3D software (Blender/Cinema 4D). Cloud rendering runs headlessly on GitHub Actions via Node.js, Three.js, Playwright, and FFmpeg, requiring 0% laptop CPU/GPU.

- **Target Repository:** [`hajaturrachman10/matheww-3d-ident`](https://github.com/hajaturrachman10/matheww-3d-ident)
- **Actions Workflow:** [Render 3D Ident](https://github.com/hajaturrachman10/matheww-3d-ident/actions)

---

## ⚡ Cloud Render in 4 Clicks (Zero Software Installation)

You do **not** need to install 3D software or render anything on your laptop. GitHub's cloud servers render every frame deterministically and encode the final video.

### Step 1: Open GitHub Actions
1. Open your repository on GitHub: [github.com/hajaturrachman10/matheww-3d-ident](https://github.com/hajaturrachman10/matheww-3d-ident)
2. Click the **Actions** tab near the top navigation bar.

### Step 2: Select the Workflow
In the left sidebar, click on **Render 3D Ident**.

### Step 3: Run the Workflow
1. Click the **Run workflow** dropdown button on the right.
2. The approved default parameters are already pre-filled:
   - Text: `MATHEWW`
   - Front Face: `#F2F4F7` (Light Silver / Cold Off-White)
   - Bevel Contour: `#1480FF` (Electric Royal Blue)
   - Side Extrusion: `#053494` (Dark Blue 3D Depth)
   - Duration: `3` (180 frames @ 60fps)
3. Click the green **Run workflow** button.

### Step 4: Download your MP4 Video
1. Wait ~1.5 minutes for the workflow run to finish (a green checkmark ✔ will appear).
2. Click on the completed workflow run.
3. Scroll down to the **Artifacts** section at the bottom.
4. Click on **MATHEWW-Gothic-3D-Ident-MP4** to download your high-definition MP4.

---

## 🖥️ Or Trigger via GitHub CLI (Terminal)

```bash
gh workflow run render.yml -R hajaturrachman10/matheww-3d-ident \
  -f text="MATHEWW" \
  -f front_color="#F2F4F7" \
  -f bevel_color="#1480FF" \
  -f side_color="#053494" \
  -f duration="3"
```

---

## 🚀 Pushing Code to Your GitHub Repository

If you are setting up or updating your repository on GitHub:

```bash
# 1. Initialize and link to your repository
git remote add origin https://github.com/hajaturrachman10/matheww-3d-ident.git
git branch -M main

# 2. Stage and commit all files
git add .
git commit -m "feat: complete approved 3D text ident generator for MATHEWW"

# 3. Push to GitHub
git push -u origin main
```

---

## 🎬 How to Use in Video Editors (CapCut / Premiere / After Effects)

The video is rendered with a uniform pure green chroma background (`#00FF00`):

- **CapCut:** Place the video on an overlay track → Go to **Cutout** → Select **Chroma Key** → Pick the green background → Set Intensity to ~12%.
- **Adobe Premiere Pro:** Drop on track V2 → In Effects, drag **Ultra Key** onto the clip → Use the eyedropper to click the green background.
- **DaVinci Resolve:** Open the Color tab → Use the 3D Qualifier to select the green background and connect to an Alpha Output.
- **After Effects:** Apply the **Keylight 1.2** effect → Pick the green background as Screen Colour.

---

## ⚙️ Visual Design & Animation Specifications

- **Text:** Exactly `MATHEWW`
- **Typography:** Bundled SIL Open Font License (OFL) **Pirata One** gothic blackletter street font (`public/fonts/pirata_one.typeface.json` and `public/fonts/ttf/PirataOne-Regular.ttf`).
- **Resolution:** `1080 x 1920` (9:16 Portrait for Shorts / TikTok / Reels)
- **Duration:** Exactly `3.0 seconds`
- **Framerate:** Exactly `60 fps`
- **Frame Count:** Exactly `180 deterministic frames` (frames 0 to 179)
- **Material Structure:**
  - **Front Face:** Cold light silver-gray / off-white (`#F2F4F7`) with clearcoat gloss for razor-sharp readability.
  - **Bevel Contour:** Vivid electric / royal blue (`#1480FF`) with subtle self-emissive bevel edge accent.
  - **Side Extrusions:** Deep metallic navy-blue (`#053494`) for pronounced 3D depth and shadows.
  - **Background:** Pure uniform chroma key green (`#00FF00`), with no textures, no gradients, and no shadow casting.
- **Adaptive Auto-Framing:**
  - Mathematically calculates bounding boxes and frustum distance so the entire word occupies the middle 80% width with ~10% safe margins on left and right.
  - Initial `M` and final `W` are 100% visible and never clip.
- **Per-Letter Animation Choreography (6 Distinct Phases):**
  - **Phase 1: 0.00s – 0.12s (Empty Anticipation):** Clean uniform green frame building visual tension.
  - **Phase 2: 0.12s – 0.72s (Staggered Letter Arrival):** Each letter of **MATHEWW** enters independently from different 3D angles and depths (left, right, top, depth) with high-speed ease-out-back curves.
  - **Phase 3: 0.72s – 0.95s (Merge Lock-In & Settle):** Letters assemble into the exact word structure with a micro-shake impact pulse and scale overshoot (1.00 → 1.032 → 1.00).
  - **Phase 4: 0.95s – 2.10s (Idle Watermark):** Completely legible and centered in middle 80% safe area, with subtle ±2.0° yaw, ±0.9° tilt, and gentle breathing float.
  - **Phase 5: 2.10s – 2.35s (Pre-Exit Separation):** Letters destabilize and offset slightly in X/Y/Z, preparing for exit.
  - **Phase 6: 2.35s – 3.00s (Outro Split, Shrink & Sink):** Letters fragment outward, plunge downward/backward into depth, and shrink cleanly to zero.

---

## 🏗️ Architecture & Single Source of Truth

To prevent visual drift between the web preview and cloud headless renders:

- `src/identCore.js` — **Shared Kinematic & Mathematical Source of Truth**. Contains easing curves, 6-phase per-letter trajectories, bounding box layout calculations, and camera auto-fit math.
- `src/identEngine.ts` — Three.js scene creation, materials, lights, and mesh hierarchy used by the live interactive React preview.
- `render/render-page.html` — Standalone 1080×1920 WebGL canvas loaded by Playwright, directly importing `src/identCore.js`.
- `render/render-frames.mjs` — Headless Playwright script that spins up a local server, steps frame-by-frame (0 to 179), and captures 60fps lossless PNGs.
- `render/encode.mjs` — FFmpeg encoding script producing high-quality H.264 MP4 with `yuv420p` pixel format and `faststart` metadata.
- `.github/workflows/render.yml` — GitHub Actions automated CI/CD workflow for headless cloud rendering and MP4 artifact uploads.
- `config.json` — Centralized artistic and timing configuration.

---

## 💻 Local Preview & Development

To run the interactive 3D studio on your local machine:

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite dev server
npm run dev
```

Open `http://localhost:3000` to inspect the 3D viewport, scrub through all 180 frames, toggle the chroma key green / transparent grid / video overlay, and review telemetry.

To test rendering locally (requires Playwright and FFmpeg installed):

```bash
# Render all 180 frames + encode MP4
npm run render

# Or run individual stages
npm run render:frames
npm run encode
```

---

## 📄 Font & Asset Licenses

- **Font:** Pirata One designed by Rodrigo Fuenzalida and Nicolas Silva.
- **License:** SIL Open Font License, Version 1.1 (`public/fonts/OFL-PirataOne.txt` and `public/fonts/LICENSE.txt`).
- Font files are bundled directly in `public/fonts/` and `public/fonts/ttf/` with no external network dependencies during headless rendering.
