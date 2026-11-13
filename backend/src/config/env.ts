import path from 'node:path';
import dotenv from 'dotenv';

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
};

export const dataFilePath = path.join(env.dataDir, env.dataFile);
