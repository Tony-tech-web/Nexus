import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../.env');
console.log(`[Prisma] Env path: ${envPath}`);
dotenv.config({ path: envPath });

console.log(`[Prisma] DATABASE_URL value: "${process.env.DATABASE_URL}"`);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

let dbUrl = process.env.DATABASE_URL;
if (typeof dbUrl !== 'string') {
    throw new Error(`DATABASE_URL is not a string: ${typeof dbUrl}`);
}

const dbPath = dbUrl.replace('file:', '');
console.log(`[Prisma] Extracted dbPath: ${dbPath}`);

const absoluteDbPath = dbPath.startsWith('./') 
  ? path.resolve(__dirname, '../../', dbPath)
  : dbPath;

console.log(`[Prisma] Absolute dbPath: ${absoluteDbPath}`);

const sqlite = new Database(absoluteDbPath);
const adapter = new PrismaBetterSqlite3(sqlite);
const prisma = new PrismaClient({ adapter });

export default prisma;
