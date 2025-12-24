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
}

export const envValidationSchema = Joi.object<EnvConfig>({
  NODE_ENV: Joi.string().valid('DEVELOPMENT', 'UAT', 'PRODUCTION').required(),
  PORT: Joi.number().default(3000),

  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION: Joi.number().default(900),
  JWT_REFRESH_TOKEN_EXPIRATION: Joi.number().default(604800),

  API_KEY: Joi.string().required(),
  ALLOWED_ORIGINS: Joi.string().required(),
}).required();
