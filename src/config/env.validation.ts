import Joi from 'joi';

export interface EnvConfig {
  NODE_ENV: 'DEVELOPMENT' | 'UAT' | 'PRODUCTION';
  PORT: number;

  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;

  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRATION: string;
  JWT_REFRESH_TOKEN_EXPIRATION: string;

  API_KEY: string;
  ALLOWED_ORIGINS: string;

  REDIS_URL: string;

  TEMPORAL_ADDRESS: string;
  TEMPORAL_NAMESPACE: string;
  TEMPORAL_TASK_QUEUE: string;

  WALLET_WEBHOOK_KEY: string;
}

export const envValidationSchema = Joi.object<EnvConfig>({
  NODE_ENV: Joi.string().valid('DEVELOPMENT', 'UAT', 'PRODUCTION').required(),
  PORT: Joi.number().default(3000),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION: Joi.number().required(),
  JWT_REFRESH_TOKEN_EXPIRATION: Joi.number().required(),

  API_KEY: Joi.string().required(),
  ALLOWED_ORIGINS: Joi.string().required(),

  REDIS_URL: Joi.string().required(),

  TEMPORAL_ADDRESS: Joi.string().required(),
  TEMPORAL_NAMESPACE: Joi.string().required(),
  TEMPORAL_TASK_QUEUE: Joi.string().required(),

  WALLET_WEBHOOK_KEY: Joi.string().required(),
}).required();
