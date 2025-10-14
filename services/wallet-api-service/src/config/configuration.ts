interface AppConfig {
  nodeEnv: string;
  app: {
    port: number;
    apiPrefix: string;
    corsAllowedOrigins: string[];
    swagger: {
      enabled: boolean;
      path: string;
      title: string;
      description: string;
      version: string;
    };
  };
  security: {
    internalApiKey: string;
    dbServiceBaseUrl: string;
  };
  rateLimiting: {
    ttl: number;
    limit: number;
  };
  http: {
    timeout: number;
    retries: number;
  };
}

const configuration = (): AppConfig => {
  const corsOrigins = (
    process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:4173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    app: {
      port: Number(process.env.PORT ?? 3000),
      apiPrefix: process.env.API_PREFIX ?? 'api',
      corsAllowedOrigins: corsOrigins,
      swagger: {
        enabled: (process.env.SWAGGER_ENABLED ?? 'true').toLowerCase() === 'true',
        path: process.env.SWAGGER_PATH ?? 'docs',
        title: 'Wallet API',
        description: 'Public API for wallet clients',
        version: process.env.API_VERSION ?? '1.0.0',
      },
    },
    security: {
      internalApiKey: process.env.INTERNAL_API_KEY ?? 'local-internal-api-key',
      dbServiceBaseUrl: process.env.DB_SERVICE_BASE_URL ?? 'http://wallet-db-service:3001/internal',
    },
    rateLimiting: {
      ttl: Number(process.env.RATE_LIMIT_TTL ?? 60),
      limit: Number(process.env.RATE_LIMIT_LIMIT ?? 100),
    },
    http: {
      timeout: Number(process.env.HTTP_CLIENT_TIMEOUT ?? 5000),
      retries: Number(process.env.HTTP_CLIENT_RETRIES ?? 2),
    },
  };
};

export type { AppConfig };
export default configuration;
