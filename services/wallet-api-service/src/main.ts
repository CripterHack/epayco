import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService<AppConfig, true>);
  const appConfig = configService.get('app', { infer: true });

  app.setGlobalPrefix(appConfig.apiPrefix);
  app.use(helmet());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (appConfig.corsAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn({ origin }, 'Blocked CORS origin');
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
      validationError: { target: false },
    }),
  );

  if (appConfig.swagger.enabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(appConfig.swagger.title)
      .setDescription(appConfig.swagger.description)
      .setVersion(appConfig.swagger.version)
      .addBearerAuth({
        type: 'apiKey',
        name: 'x-internal-api-key',
        in: 'header',
      })
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerPath = `${appConfig.apiPrefix}/${appConfig.swagger.path}`;
    SwaggerModule.setup(swaggerPath, app, document, {
      jsonDocumentUrl: `${swaggerPath}/json`,
    });
  }

  const port = appConfig.port;
  await app.listen(port);
  logger.log(`wallet-api-service running on port ${port}`, 'Bootstrap');
}

void bootstrap();
