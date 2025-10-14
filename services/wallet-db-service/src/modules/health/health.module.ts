import { Module } from '@nestjs/common';
import {
  HealthController,
  RootHealthController,
  GlobalHealthController,
} from './health.controller';

@Module({
  controllers: [HealthController, RootHealthController, GlobalHealthController],
})
export class HealthModule {}
