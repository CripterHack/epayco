import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { AbstractIdEntity } from '../../../database/entities/abstract-id.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { PaymentEntity } from '../../payments/entities/payment.entity';
import { PaymentSessionEntity } from '../../payment-sessions/entities/payment-session.entity';
import { TopUpEntity } from '../../top-ups/entities/top-up.entity';

@Index('IDX_wallets_customer_id', ['customerId'], { unique: true })
@Entity({ name: 'wallets' })
export class WalletEntity extends AbstractIdEntity {
  @Column({ name: 'customer_id', type: 'char', length: 36, unique: true })
  customerId!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: '0.00' })
  balance!: string;

  @OneToOne(() => CustomerEntity, (customer) => customer.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @OneToMany(() => TopUpEntity, (topUp) => topUp.wallet)
  topUps!: TopUpEntity[];

  @OneToMany(() => PaymentSessionEntity, (session) => session.wallet)
  paymentSessions!: PaymentSessionEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.wallet)
  payments!: PaymentEntity[];
}
