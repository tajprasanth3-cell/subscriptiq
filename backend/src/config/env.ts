import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

// Load .env from backend/.env or root .env
const candidates = [
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
];
for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config();

function parseOrigins(value: string | undefined): string[] {
  if (!value) return ['http://localhost:5173'];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-production-supersecret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  dataDir: path.resolve(process.cwd(), process.env.DATA_DIR ?? 'data'),
  dataFile: process.env.DATA_FILE ?? 'db.json',
  mongoUri: process.env.MONGODB_URI ?? '',
};

export const dataFilePath = path.join(env.dataDir, env.dataFile);
