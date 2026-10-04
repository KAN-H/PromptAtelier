const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 30000;
  let lastError;
  while (Date.now() < deadline && child.exitCode === null) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`Server returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Packaged server did not start: ${lastError?.message || 'process exited'}`);
}

async function main() {
  if (process.platform !== 'linux') {
    throw new Error('The packaged smoke test requires the Linux CI runner.');
  }

  const executable = path.resolve(process.argv[2] || '');
  if (!process.argv[2]) throw new Error('Usage: node scripts/smoke-packaged-app.js <executable>');

  const port = await reservePort();
  const dataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'promptatelier-smoke-'));
  const child = spawn(executable, [], {
    env: {
      ...process.env,
      PORT: String(port),
      CI: 'true',
      PROMPTATELIER_DATA_DIR: dataDirectory
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let logs = '';
  child.stdout.on('data', data => { logs += data; });
  child.stderr.on('data', data => { logs += data; });

  try {
    await waitForServer(`http://127.0.0.1:${port}/health`, child);
    const response = await fetch(`http://127.0.0.1:${port}/api/skills/nippon-colors`);
    if (!response.ok) {
      throw new Error(`Skill endpoint returned HTTP ${response.status}: ${await response.text()}\n${logs}`);
    }

    const result = await response.json();
    if (!result.success || result.data?.meta?.id !== 'nippon-colors' ||
        !result.data.instructions?.includes('日本') && !result.data.instructions?.includes('Japanese')) {
      throw new Error('The packaged NipponColors Skill is missing or incomplete.');
    }

    console.log('Packaged application serves the NipponColors Skill successfully.');
  } finally {
    child.kill('SIGTERM');
    await new Promise(resolve => {
      if (child.exitCode !== null) return resolve();
      child.once('exit', resolve);
      setTimeout(resolve, 5000).unref();
    });
    fs.rmSync(dataDirectory, { recursive: true, force: true });
    if (child.exitCode && child.exitCode !== 0) {
      console.error(logs);
    }
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
