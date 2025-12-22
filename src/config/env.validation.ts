import Joi from 'joi';

export interface EnvConfig {
  NODE_ENV: 'DEVELOPMENT' | 'UAT' | 'PRODUCTION';
  PORT: number;
}

export const envValidationSchema = Joi.object<EnvConfig>({
  NODE_ENV: Joi.string().valid('DEVELOPMENT', 'UAT', 'PRODUCTION').required(),
  PORT: Joi.number().default(3000),
}).required();
