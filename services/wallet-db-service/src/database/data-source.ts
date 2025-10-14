import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import configuration from '../config/configuration';

const envCandidates = ['.env.local', '.env'];
const envPath = envCandidates
  .map((file) => join(process.cwd(), file))
  .find((candidate) => existsSync(candidate));

loadEnv(envPath ? { path: envPath } : undefined);

const config = configuration();

export default new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  migrationsTableName: 'migrations_history',
  entities: [`${__dirname}/../modules/**/*.entity.{ts,js}`],
  migrations: [`${__dirname}/../migrations/*.{ts,js}`],
  logging: config.database.logging,
});
