import { Column, Entity, Index, OneToOne } from 'typeorm';
import { AbstractIdEntity } from '../../../database/entities/abstract-id.entity';
import { WalletEntity } from '../../wallets/entities/wallet.entity';

@Index('IDX_customers_document_phone', ['document', 'phone'])
@Entity({ name: 'customers' })
export class CustomerEntity extends AbstractIdEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  document!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 160 })
  fullName!: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @OneToOne(() => WalletEntity, (wallet) => wallet.customer)
  wallet?: WalletEntity;
}
