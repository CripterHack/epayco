import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractIdEntity } from '../../../database/entities/abstract-id.entity';
import { WalletEntity } from '../../wallets/entities/wallet.entity';
import { PaymentEntity } from '../../payments/entities/payment.entity';

export enum PaymentSessionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Index('IDX_payment_sessions_wallet_id', ['walletId'])
@Index('IDX_payment_sessions_session_id', ['sessionId'], { unique: true })
@Index('IDX_payment_sessions_status', ['status'])
@Entity({ name: 'payment_sessions' })
export class PaymentSessionEntity extends AbstractIdEntity {
  @Column({ name: 'wallet_id', type: 'char', length: 36 })
  walletId!: string;

  @Column({ name: 'session_id', type: 'char', length: 36, unique: true })
  sessionId!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount!: string;

  @Column({ name: 'token_hash', type: 'varchar', length: 128 })
  tokenHash!: string;

  @Column({ type: 'enum', enum: PaymentSessionStatus, default: PaymentSessionStatus.PENDING })
  status!: PaymentSessionStatus;

  @Column({ name: 'expires_at', type: 'timestamp', precision: 6 })
  expiresAt!: Date;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.paymentSessions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: WalletEntity;

  @OneToOne(() => PaymentEntity, (payment) => payment.session)
  payment?: PaymentEntity;
}
