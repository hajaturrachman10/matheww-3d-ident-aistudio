import React, { useState } from 'react';
import {
  Github,
  CloudLightning,
  Download,
  Copy,
  Check,
  Film,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Terminal,
  GitBranch,
} from 'lucide-react';
import type { IdentConfig } from '../types.ts';

interface GitHubActionsGuideProps {
  config: IdentConfig;
}

export const GitHubActionsGuide: React.FC<GitHubActionsGuideProps> = ({ config }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const repoName = 'hajaturrachman10/matheww-3d-ident';
  const repoUrl = `https://github.com/${repoName}`;
  const actionsUrl = `https://github.com/${repoName}/actions`;

  const gitPushCommand = `git remote add origin ${repoUrl}.git\ngit branch -M main\ngit add .\ngit commit -m "feat: complete approved 3D text ident generator for MATHEWW"\ngit push -u origin main`;

  const cliRunCommand = `gh workflow run render.yml -R ${repoName} -f text="${config.text}" -f front_color="${config.frontColor}" -f bevel_color="${config.bevelAccentColor}" -f side_color="${config.sideColor}" -f duration="3"`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-5 text-slate-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CloudLightning className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
              Cloud Rendering via GitHub Actions
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0% Laptop CPU
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Renders 180 deterministic 1080×1920 frames at 60fps on GitHub servers and encodes an H.264 MP4.
            </p>
          </div>
        </div>

        {/* Target Repository Link */}
        <a
          href={actionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-medium transition shrink-0"
        >
          <Github className="w-3.5 h-3.5" />
          <span>Open {repoName} Actions</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Target Repo Banner */}
      <div className="bg-blue-950/40 border border-blue-800/50 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <span className="text-slate-400">Target Production Repository: </span>
            <span className="font-mono text-white font-semibold">{repoName}</span>
          </div>
        </div>
        <button
          onClick={() => copyToClipboard(gitPushCommand, 'push')}
          className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-mono bg-blue-900/50 px-2.5 py-1 rounded border border-blue-700/50 transition shrink-0"
        >
          {copiedCmd === 'push' ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" /> Copied Git Push Commands!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy Git Push Commands
            </>
          )}
        </button>
      </div>

      {/* 4-Step Visual Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Step 1 */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Open Actions</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Navigate to <strong className="text-white">{repoName}</strong> on GitHub and click the <strong className="text-white">Actions</strong> tab.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Select Workflow</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              In the left sidebar, click <strong className="text-white">Render 3D Ident</strong>.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Click "Run workflow"</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Click the <strong className="text-white">Run workflow</strong> dropdown. Review the inputs (default: <code className="text-blue-300">MATHEWW</code>) and click the green button.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Download MP4</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Wait ~1.5 minutes for completion. Scroll down to <strong className="text-emerald-300">Artifacts</strong> and download your video.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub CLI Quick Command Box */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Or trigger directly using GitHub CLI (Terminal):</span>
          </div>
          <button
            onClick={() => copyToClipboard(cliRunCommand, 'cli')}
            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition"
          >
            {copiedCmd === 'cli' ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy command
              </>
            )}
          </button>
        </div>
        <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-200 overflow-x-auto select-all">
          {cliRunCommand}
        </div>
      </div>

      {/* Video Editor Chroma Key Instructions */}
      <div className="p-3 bg-gradient-to-r from-emerald-950/30 to-blue-950/30 border border-emerald-800/40 rounded-lg flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
          <Film className="w-4 h-4 text-emerald-400" />
          <span>How to use the rendered MP4 in video editors:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
          <div className="bg-black/40 p-2 rounded border border-white/5">
            <strong className="text-white block mb-0.5">CapCut:</strong>
            Drag MP4 to overlay track → Click <em>Cutout</em> → Select <em>Chroma Key</em> → Pick pure green → Set Intensity ~12%.
          </div>
          <div className="bg-black/40 p-2 rounded border border-white/5">
            <strong className="text-white block mb-0.5">Premiere Pro:</strong>
            Place clip on V2 track → Apply <em>Ultra Key</em> effect → Use eyedropper on the #00FF00 green background.
          </div>
          <div className="bg-black/40 p-2 rounded border border-white/5">
            <strong className="text-white block mb-0.5">After Effects:</strong>
            Apply <em>Keylight 1.2</em> effect → Select Screen Colour as the uniform background green.
          </div>
        </div>
      </div>
    </div>
  );
};
