import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [PersistenceModule, MailerModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
