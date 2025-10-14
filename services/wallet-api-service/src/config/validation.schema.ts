import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('1.0.0'),
  SWAGGER_ENABLED: Joi.boolean().truthy('true').falsy('false').default(true),
  SWAGGER_PATH: Joi.string().default('docs'),
  CORS_ALLOWED_ORIGINS: Joi.string()
    .allow('')
    .default('http://localhost:5173,http://localhost:4173'),
  INTERNAL_API_KEY: Joi.string().min(16).default('local-internal-api-key'),
  DB_SERVICE_BASE_URL: Joi.string().uri().default('http://wallet-db-service:3001/internal'),
  RATE_LIMIT_TTL: Joi.number().positive().default(60),
  RATE_LIMIT_LIMIT: Joi.number().positive().default(100),
  HTTP_CLIENT_TIMEOUT: Joi.number().positive().default(5000),
  HTTP_CLIENT_RETRIES: Joi.number().min(0).max(5).default(2),
});

export default validationSchema;
