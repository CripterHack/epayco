import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  DB_HOST: Joi.string().hostname().default('mysql'),
  DB_PORT: Joi.number().port().default(3306),
  DB_USERNAME: Joi.string().default('wallet'),
  DB_PASSWORD: Joi.string().allow('').default('wallet'),
  DB_NAME: Joi.string().default('wallet'),
  DB_LOGGING: Joi.boolean().truthy('true').falsy('false').default(false),
  DB_SYNCHRONIZE: Joi.boolean().truthy('true').falsy('false').default(false),
  MAIL_HOST: Joi.string().default('mailhog'),
  MAIL_PORT: Joi.number().port().default(1025),
  MAIL_USER: Joi.string().allow('').default(''),
  MAIL_PASSWORD: Joi.string().allow('').default(''),
  MAIL_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  MAIL_DEFAULT_FROM: Joi.string().default('no-reply@wallet.local'),
  TOKEN_TTL_MINUTES: Joi.number().positive().default(10),
});

export default validationSchema;
