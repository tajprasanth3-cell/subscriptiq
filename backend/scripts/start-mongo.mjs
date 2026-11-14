import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '..');
dotenv.config({ path: path.join(backendRoot, '.env') });

const bin =
  process.env.MONGOD_BIN ?? 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';
const dbPath = path.resolve(
  backendRoot,
  process.env.MONGOD_DBPATH ?? 'C:\\Users\\HPADMIN\\mongo-portable\\data'
);
const port = process.env.MONGOD_PORT ?? '27017';
const logPath = path.join(dbPath, 'mongod.log');

if (!fs.existsSync(bin)) {
  console.error(`mongod not found at: ${bin}`);
  console.error('Set MONGOD_BIN in backend/.env to the mongod executable.');
  process.exit(1);
}

fs.mkdirSync(dbPath, { recursive: true });

console.log(`Starting MongoDB on 127.0.0.1:${port}`);
console.log(`  binary : ${bin}`);
console.log(`  dbpath : ${dbPath}`);
console.log(`  log    : ${logPath}`);

const detach = process.argv.includes('--detach');

const child = spawn(
  bin,
  [
    '--dbpath',
    dbPath,
    '--port',
    String(port),
    '--bind_ip',
    '127.0.0.1',
    '--logpath',
    logPath,
    '--logappend',
  ],
  { stdio: detach ? 'ignore' : 'inherit', detached: detach }
);

if (detach) {
  child.unref();
  console.log(`Started detached (pid ${child.pid}). Log: ${logPath}`);
  process.exit(0);
}

child.on('exit', (code) => process.exit(code ?? 0));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
