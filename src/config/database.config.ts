import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export interface AppConfig {
    messagePrefix: string;
}

export const typeOrmConfig = registerAs("database", (): TypeOrmModuleOptions => ({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.DB_SYNC === 'true',
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
}));