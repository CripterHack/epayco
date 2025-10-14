import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractIdEntity } from '../../../database/entities/abstract-id.entity';
import { PaymentSessionEntity } from '../../payment-sessions/entities/payment-session.entity';
import { WalletEntity } from '../../wallets/entities/wallet.entity';

@Index('IDX_payments_wallet_id', ['walletId'])
@Index('IDX_payments_session_id', ['sessionId'], { unique: true })
@Entity({ name: 'payments' })
export class PaymentEntity extends AbstractIdEntity {
  @Column({ name: 'wallet_id', type: 'char', length: 36 })
  walletId!: string;

  @Column({ name: 'session_id', type: 'char', length: 36, unique: true })
  sessionId!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount!: string;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.payments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: WalletEntity;

  @OneToOne(() => PaymentSessionEntity, (session) => session.payment, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'session_id' })
  session!: PaymentSessionEntity;
}
