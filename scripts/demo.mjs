import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import { seedDatabase } from './seed.mjs';
import { loadEnv } from './load-env.mjs';

loadEnv();

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');

let mongod;
let child;
let shuttingDown = false;

async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (child && !child.killed) child.kill('SIGTERM');
  if (mongod) {
    try { await mongod.stop(); } catch {}
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

try {
  console.log('[demo] Starting in-memory MongoDB (first run may download a binary)...');
  mongod = await MongoMemoryServer.create({
    instance: { ip: '127.0.0.1', dbName: 'codomax' },
  });
  const uri = mongod.getUri('codomax');
  console.log('[demo] MongoDB ready.');

  const seed = await seedDatabase(uri);
  console.log(`[demo] Seeded ${seed.posts} posts. Demo login: ${seed.demoEmail} / ${seed.demoPassword}`);

  const env = {
    ...process.env,
    MONGODB_URI: uri,
    JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex'),
    DEMO_MODE: 'true',
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_TELEMETRY_DISABLED: '1',
  };

  child = spawn(process.execPath, [nextBin, 'dev', '--hostname', '0.0.0.0', '--port', '3000'], {
    env,
    stdio: 'inherit',
  });

  child.on('exit', (code) => shutdown(code ?? 0));
  child.on('error', (err) => {
    console.error('[demo] Failed to start Next.js:', err);
    shutdown(1);
  });
} catch (err) {
  console.error('[demo] Demo startup failed:', err);
  await shutdown(1);
}
