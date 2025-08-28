import { TypeOrmModuleOptions } from '@nestjs/typeorm'; import * as Joi from 'joi';

import { AppConfig } from "./app.config";
import { AuthConfig } from './auth.config';

export interface ConfigType {
    app: AppConfig;
    database: TypeOrmModuleOptions,
    auth: AuthConfig
}

export const appConfigSchema = Joi.object({
    APP_MESSAGE_PREFIX: Joi.string().default("Hello "),
    DB_HOST: Joi.string().default("localhost"),
    DB_PORT: Joi.number().default(5432),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    DB_SYNC: Joi.string().valid('true', 'false').required(),
    DB_SSL: Joi.string().valid('true', 'false').required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().required()
});
