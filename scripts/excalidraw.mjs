#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync, constants } from 'node:fs';
import { dirname, join, resolve, delimiter } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { styleScene } from './scene-style.mjs';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const help = `cjx-sketchmind local Excalidraw (Node >=22, official CLI >=0.3.0)
  node excalidraw.mjs doctor [--smoke]
  node excalidraw.mjs build input.mmd --out path/01-overview [--force]
  node excalidraw.mjs render input.excalidraw --out path/01-overview [--force]
  node excalidraw.mjs decorate input.excalidraw --design layout.design.json --out path/styled
Options: --preview png|svg|both (default png), --browser-path PATH,
  --fonts-url none|PATH|URL, --timeout 45000, --design FILE, --plain
build produces .excalidraw + the selected preview(s); render preserves the input scene.
New builds apply teaching colors; --design adds phases, cards, emphasis and retry paths.
decorate creates a new styled scene; render never restyles a manually edited scene.
Use --preview both for the previous SVG + PNG delivery. JSON includes timingsMs.
No account, API key, cloud upload or MCP is needed.`;

function cliEntry() {
  const candidates = [];
  if (process.env.EXCALIDRAW_CLI_PATH) candidates.push(process.env.EXCALIDRAW_CLI_PATH);
  for (const dir of (process.env.PATH || '').split(delimiter).filter(Boolean)) {
    candidates.push(join(dir, 'node_modules', '@excalidraw', 'cli', 'dist', 'main.js'));
    const binary = join(dir, 'excalidraw');
    if (existsSync(binary)) candidates.push(realpathSync(binary));
  }
  // npm shims may not be on PATH in an already-running desktop agent.
  const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
  candidates.push(join(appData, 'npm', 'node_modules', '@excalidraw', 'cli', 'dist', 'main.js'));
  candidates.push(join(dirname(process.execPath), 'node_modules', '@excalidraw', 'cli', 'dist', 'main.js'));
  const entry = candidates.find(path => existsSync(path));
  if (!entry) throw new Error('Excalidraw CLI not found. Run scripts/setup.ps1, or set EXCALIDRAW_CLI_PATH to its dist/main.js.');
  return resolve(entry);
}

function runCli(entry, args, timeout, timings, label = args[0]) {
  // Invoke Node directly: no .cmd quoting problems or shell interpretation of filenames.
  const started = performance.now();
  const child = spawnSync(process.execPath, [entry, ...args], {
    encoding: 'utf8', windowsHide: true, shell: false,
    env: { ...process.env, EXCALIDRAW_NO_UPDATE_NOTIFIER: '1' },
    timeout: timeout + 15000, maxBuffer: 8 * 1024 * 1024,
  });
  if (timings) timings[label] = Math.round(performance.now() - started);
  if (child.error || child.status !== 0) throw new Error(`Excalidraw ${args[0]} failed: ${child.error?.message || child.stderr || child.stdout || `exit ${child.status}`}`.slice(0, 8000));
  if (child.stderr?.trim()) process.stderr.write(child.stderr);
  return child.stdout.trim();
}

function prerequisites() {
  const timingsMs = {};
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Node.js 22 or newer is required.');
  const entry = cliEntry();
  const version = runCli(entry, ['--version'], 10000, timingsMs, 'version');
  const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match || (Number(match[1]) === 0 && Number(match[2]) < 3)) throw new Error(`CLI >=0.3.0 required; found ${version}. Run scripts/setup.ps1.`);
  return { entry, version, node: process.version, timingsMs };
}

function sceneStats(file) {
  const scene = JSON.parse(readFileSync(file, 'utf8'));
  if (scene.type !== 'excalidraw' || !Array.isArray(scene.elements)) throw new Error('Not an Excalidraw scene.');
  const live = scene.elements.filter(e => !e.isDeleted);
  const ids = new Set(live.map(e => e.id));
  if (!live.length || ids.size !== live.length || live.some(e => !e.id)) throw new Error('Scene is empty or contains duplicate/missing element IDs.');
  for (const e of live) {
    if (![e.x, e.y, e.width, e.height].every(Number.isFinite) || e.width < 0 || e.height < 0) throw new Error(`Invalid geometry: ${e.id}. Simplify unsupported Mermaid frames or loops.`);
    for (const binding of [e.startBinding, e.endBinding]) {
      if (binding?.elementId && !ids.has(binding.elementId)) throw new Error(`Dangling arrow binding: ${e.id}`);
    }
  }
  const shapes = live.filter(e => !['text', 'image', 'arrow', 'line', 'frame'].includes(e.type)).length;
  const images = live.filter(e => e.type === 'image').length;
  if (!shapes) throw new Error('No editable native shapes found. Use a supported Mermaid diagram rather than an image-only conversion.');
  return { scene, elements: live.length, shapes, texts: live.filter(e => e.type === 'text').length, images };
}

function renderOptions(options) {
  const args = ['--fonts-url', options['fonts-url'] || process.env.EXCALIDRAW_FONTS_URL || 'none', '--timeout', String(options.timeout)];
  const browser = options['browser-path'] || process.env.EXCALIDRAW_BROWSER_PATH;
  if (browser) args.push('--browser-path', browser);
  return args;
}

function build(mode, input, output, options, cli) {
  const timingsMs = { ...cli.timingsMs };
  const source = resolve(input);
  if (!existsSync(source)) throw new Error(`Input not found: ${source}`);
  const stem = resolve(output).replace(/\.(excalidraw|svg|png)$/i, '');
  // One preview avoids a separate browser launch; callers can still request both.
  const previews = options.preview === 'both' ? ['svg', 'png'] : [options.preview];
  const exportsScene = mode !== 'render';
  const extensions = exportsScene ? ['excalidraw', ...previews] : previews;
  const targets = extensions.map(ext => `${stem}.${ext}`);
  if (targets.some(path => path.toLowerCase() === source.toLowerCase())) throw new Error('Output must not overwrite the input scene.');
  if (!options.force && targets.some(existsSync)) throw new Error('Output already exists. Choose another --out stem or pass --force for an intentional replacement.');
  const stage = mkdtempSync(join(tmpdir(), 'cjx-sketchmind-'));
  try {
    const sceneFile = join(stage, 'diagram.excalidraw');
    const common = renderOptions(options);
    if (mode === 'build') {
      runCli(cli.entry, ['mermaid', source, '--out', sceneFile, '--elbow', '--font-size', '22', ...common], options.timeout, timingsMs, 'mermaid');
      const { scene } = sceneStats(sceneFile);
      scene.appState = { ...scene.appState, viewBackgroundColor: '#FFFEFA', exportBackground: true, exportWithDarkMode: false };
      writeFileSync(sceneFile, JSON.stringify(scene, null, 2) + '\n', 'utf8');
    } else {
      sceneStats(source);
      copyFileSync(source, sceneFile);
    }
    if (exportsScene && !options.plain) {
      const stylingStarted = performance.now();
      const { scene } = sceneStats(sceneFile);
      const design = options.design ? JSON.parse(readFileSync(resolve(options.design), 'utf8')) : {};
      const sequence = mode === 'build' ? /\bsequenceDiagram\b/.test(readFileSync(source, 'utf8')) : Boolean(design.sequence);
      const styled = styleScene(scene, design, { sequence });
      writeFileSync(sceneFile, JSON.stringify(styled, null, 2) + '\n', 'utf8');
      timingsMs.style = Math.round(performance.now() - stylingStarted);
    }
    const { scene, ...stats } = sceneStats(sceneFile);
    const dimensions = {};
    for (const ext of previews) {
      runCli(cli.entry, ['render', sceneFile, '--out', join(stage, `diagram.${ext}`), '--padding', '40', ...common], options.timeout, timingsMs, `render_${ext}`);
      if (ext === 'png') {
        const png = readFileSync(join(stage, 'diagram.png'));
        if (png.length < 24 || !png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('Invalid PNG output.');
        dimensions.width = png.readUInt32BE(16);
        dimensions.height = png.readUInt32BE(20);
      } else {
        const svg = readFileSync(join(stage, 'diagram.svg'), 'utf8');
        if (!svg.includes('<svg') || !svg.includes('viewBox=')) throw new Error('Invalid SVG output.');
      }
    }
    // Publish only after every requested preview of the native scene is validated.
    // Conversion/render failures must not replace the user's previous drawing.
    mkdirSync(dirname(stem), { recursive: true });
    for (const ext of extensions) copyFileSync(join(stage, `diagram.${ext}`), `${stem}.${ext}`, options.force ? 0 : constants.COPYFILE_EXCL);
    return { ok: true, mode, cliVersion: cli.version, preview: options.preview, input: source, scene: exportsScene ? `${stem}.excalidraw` : source, outputs: targets, style: scene.cjxStyle || null, ...stats, ...dimensions, timingsMs };
  } finally {
    // Only remove our own mkdtemp path, never a user-supplied --out directory.
    rmSync(stage, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  const [mode, ...args] = argv;
  const options = { timeout: 45000, preview: 'png' };
  let input;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (['--force', '--smoke', '--plain'].includes(arg)) options[arg.slice(2)] = true;
    else if (['--out', '--preview', '--browser-path', '--fonts-url', '--timeout', '--design'].includes(arg)) {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
      options[arg.slice(2)] = args[++i];
    } else if (!arg.startsWith('-') && !input) input = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  options.timeout = Number(options.timeout);
  if (!['png', 'svg', 'both'].includes(options.preview)) throw new Error('--preview must be png, svg, or both.');
  if (!Number.isFinite(options.timeout) || options.timeout < 1000 || options.timeout > 180000) throw new Error('--timeout must be 1000..180000 ms.');
  if (!['doctor', 'build', 'render', 'decorate'].includes(mode)) throw new Error(help);
  if (mode === 'render' && (options.design || options.plain)) throw new Error('render preserves the scene. Use decorate --design to create a styled copy.');
  if (mode === 'doctor' && (options.design || options.plain)) throw new Error('--design and --plain apply to build/decorate only.');
  if (options.design && options.plain) throw new Error('--design and --plain cannot be combined.');
  if (mode !== 'doctor' && (!input || !options.out)) throw new Error('Input and --out are required.\n' + help);
  return { mode, input, options };
}

try {
  if (process.argv.length === 2 || process.argv.includes('--help')) console.log(help);
  else {
    const started = performance.now();
    const { mode, input, options } = parseArgs(process.argv.slice(2));
    const cli = prerequisites();
    if (mode === 'doctor') {
      const result = { ok: true, cliVersion: cli.version, cliEntry: cli.entry, node: cli.node, rendering: 'not checked; pass --smoke for full verification' };
      if (options.smoke) {
        const smokeDir = mkdtempSync(join(tmpdir(), 'cjx-sketchmind-smoke-'));
        try {
          // Full diagnostics continue to exercise both exporters, independent of the fast default.
          const smoke = build('build', join(skillRoot, 'templates', 'architecture.mmd'), join(smokeDir, '中文 path', 'overview'), { ...options, preview: 'both' }, cli);
          const scene = JSON.parse(readFileSync(smoke.scene, 'utf8'));
          if (!scene.elements.some(e => e.type === 'text' && e.text?.includes('用户提问'))) throw new Error('Chinese label was lost.');
          result.rendering = { verified: true, elements: smoke.elements, shapes: smoke.shapes, texts: smoke.texts, images: smoke.images, width: smoke.width, height: smoke.height, chineseLabels: true };
          result.timingsMs = smoke.timingsMs;
        } finally { rmSync(smokeDir, { recursive: true, force: true }); }
      }
      result.timingsMs = { ...(result.timingsMs || cli.timingsMs), total: Math.round(performance.now() - started) };
      console.log(JSON.stringify(result, null, 2));
    } else {
      const result = build(mode, input, options.out, options, cli);
      result.timingsMs.total = Math.round(performance.now() - started);
      console.log(JSON.stringify(result, null, 2));
    }
  }
} catch (error) {
  console.error(`cjx-sketchmind: ${error.message}`);
  process.exitCode = 1;
}
