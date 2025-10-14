interface AppConfig {
  nodeEnv: string;
  app: {
    port: number;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    logging: boolean;
    synchronize: boolean;
  };
  mail: {
    host: string;
    port: number;
    user: string | null;
    password: string | null;
    secure: boolean;
    defaultFrom: string;
  };
  tokens: {
    ttlMinutes: number;
  };
}

const configuration = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  app: {
    port: Number(process.env.PORT ?? 3001),
  },
  database: {
    host: process.env.DB_HOST ?? 'mysql',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'wallet',
    password: process.env.DB_PASSWORD ?? 'wallet',
    name: process.env.DB_NAME ?? 'wallet',
    logging: (process.env.DB_LOGGING ?? 'false') === 'true',
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
  },
  mail: {
    host: process.env.MAIL_HOST ?? 'mailhog',
    port: Number(process.env.MAIL_PORT ?? 1025),
    user: process.env.MAIL_USER ?? null,
    password: process.env.MAIL_PASSWORD ?? null,
    secure: (process.env.MAIL_SECURE ?? 'false') === 'true',
    defaultFrom: process.env.MAIL_DEFAULT_FROM ?? 'no-reply@wallet.local',
  },
  tokens: {
    ttlMinutes: Number(process.env.TOKEN_TTL_MINUTES ?? 10),
  },
});

export type { AppConfig };
export default configuration;
