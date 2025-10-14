import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
import { PaymentSessionEntity } from '../payment-sessions/entities/payment-session.entity';
import { TopUpEntity } from '../top-ups/entities/top-up.entity';
import { WalletEntity } from '../wallets/entities/wallet.entity';
import { CustomerRepository } from '../customers/customer.repository';
import { WalletRepository } from '../wallets/wallet.repository';
import { TopUpRepository } from '../top-ups/top-up.repository';
import { PaymentSessionRepository } from '../payment-sessions/payment-session.repository';
import { PaymentRepository } from '../payments/payment.repository';

const entities = [CustomerEntity, WalletEntity, TopUpEntity, PaymentSessionEntity, PaymentEntity];

const repositories = [
  CustomerRepository,
  WalletRepository,
  TopUpRepository,
  PaymentSessionRepository,
  PaymentRepository,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: repositories,
  exports: repositories,
})
export class PersistenceModule {}
