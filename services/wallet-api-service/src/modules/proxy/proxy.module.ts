import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InternalDbService } from './internal-db.service';
import type { AppConfig } from '../../config/configuration';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const security = configService.get('security', { infer: true });
        const http = configService.get('http', { infer: true });

        return {
          baseURL: security.dbServiceBaseUrl,
          timeout: http.timeout,
          maxRedirects: 0,
          headers: {
            'x-internal-api-key': security.internalApiKey,
          },
        };
      },
    }),
  ],
  providers: [InternalDbService],
  exports: [InternalDbService],
})
export class ProxyModule {}
