import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import configuration, { AppConfig } from './config/configuration';
import validationSchema from './config/validation.schema';
import { DatabaseConfigService } from './database/database-config.service';
import { PersistenceModule } from './modules/persistence/persistence.module';
import { HealthModule } from './modules/health/health.module';
import { CustomersModule } from './modules/customers/customers.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
      validationSchema,
      cache: true,
      expandVariables: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  translateTime: 'SYS:standard',
                  singleLine: true,
                },
              }
            : undefined,
      },
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const mail = configService.get('mail', { infer: true });

        if (!mail) {
          throw new Error('Mail configuration missing');
        }

        return {
          transport: {
            host: mail.host,
            port: mail.port,
            secure: mail.secure,
            auth:
              mail.user && mail.password
                ? {
                    user: mail.user,
                    pass: mail.password,
                  }
                : undefined,
          },
          defaults: {
            from: mail.defaultFrom,
          },
        };
      },
    }),
    HealthModule,
    PersistenceModule,
    CustomersModule,
    WalletsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
