import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import * as path from 'path';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: path.resolve(__dirname, '../../../.env'), // 절대 경로로 변경
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('dev'),
    JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
    JWT_ACCESS_TOKEN_EXPIRE_TIME: Joi.string().required(),
    JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
    JWT_REFRESH_TOKEN_EXPIRE_TIME: Joi.string().required(),
  }),
});
