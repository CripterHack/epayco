import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractIdEntity } from '../../../database/entities/abstract-id.entity';
import { WalletEntity } from '../../wallets/entities/wallet.entity';

@Index('IDX_top_ups_wallet_id', ['walletId'])
@Entity({ name: 'top_ups' })
export class TopUpEntity extends AbstractIdEntity {
  @Column({ name: 'wallet_id', type: 'char', length: 36 })
  walletId!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount!: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.topUps, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: WalletEntity;
}
