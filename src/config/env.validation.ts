import Joi from 'joi';

export interface EnvConfig {
  NODE_ENV: 'DEVELOPMENT' | 'UAT' | 'PRODUCTION';
  PORT: number;
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRATION: string;
  JWT_REFRESH_TOKEN_EXPIRATION: string;
}

export const envValidationSchema = Joi.object<EnvConfig>({
  NODE_ENV: Joi.string().valid('DEVELOPMENT', 'UAT', 'PRODUCTION').required(),
  PORT: Joi.number().default(3000),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION: Joi.number().default(900),
  JWT_REFRESH_TOKEN_EXPIRATION: Joi.number().default(604800),
}).required();
