import Joi from 'joi';

export interface EnvConfig {
  ENV: 'DEVELOPMENT' | 'UAT' | 'PRODUCTION';
  PORT: number;
}

export const envValidationSchema = Joi.object<EnvConfig>({
  ENV: Joi.string().valid('DEVELOPMENT', 'UAT', 'PRODUCTION').required(),
  PORT: Joi.number().default(3000),
}).required();
