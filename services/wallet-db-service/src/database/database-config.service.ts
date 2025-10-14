import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import type { AppConfig } from '../config/configuration';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const database = this.configService.get('database', { infer: true });

    return {
      type: 'mysql',
      host: database.host,
      port: database.port,
      username: database.username,
      password: database.password,
      database: database.name,
      autoLoadEntities: true,
      synchronize: database.synchronize,
      logging: database.logging,
      migrationsRun: false,
      migrationsTableName: 'migrations_history',
      entities: [__dirname + '/../**/*.entity.{ts,js}'],
      migrations: [__dirname + '/../migrations/*.{ts,js}'],
    };
  }
}
