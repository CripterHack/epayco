import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsFacadeService } from './payments.service';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [PaymentsController],
  providers: [PaymentsFacadeService],
})
export class PaymentsApiModule {}
