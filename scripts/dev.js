const { spawn } = require('child_process');
const path = require('path');
const esbuild = require('esbuild');

async function buildMainAndPreload() {
  console.log('[Dev] Building main and preload...');
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../src/main/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.resolve(__dirname, '../dist/main/index.js'),
    external: ['electron']
  });

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../src/preload/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.resolve(__dirname, '../dist/preload/index.js'),
    external: ['electron']
  });
  console.log('[Dev] Main and preload built.');
}

async function start() {
  await buildMainAndPreload();

  console.log('[Dev] Starting Vite dev server...');
  const viteBin = path.resolve(__dirname, '../node_modules/vite/bin/vite.js');
  const patchFs = path.resolve(__dirname, 'patch-fs.js');
  const viteProcess = spawn('node', ['-r', `"${patchFs}"`, `"${viteBin}"`], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });

  // Give Vite server a moment to start up
  await new Promise((resolve) => setTimeout(resolve, 2500));

  console.log('[Dev] Launching Electron...');
  const electronBin = require('electron');
  const electronProcess = spawn(electronBin, [path.resolve(__dirname, '../dist/main/index.js')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: 'http://localhost:5173'
    }
  });

  electronProcess.on('close', () => {
    console.log('[Dev] Electron closed.');
    viteProcess.kill();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error('[Dev] Error starting dev server:', err);
  process.exit(1);
});
