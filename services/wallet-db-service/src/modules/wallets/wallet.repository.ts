import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';

@Injectable()
export class WalletRepository extends Repository<WalletEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(WalletEntity, dataSource.createEntityManager());
  }

  async findByCustomerId(customerId: string): Promise<WalletEntity | null> {
    return this.findOne({ where: { customerId } });
  }

  async lockById(walletId: string, manager?: EntityManager): Promise<WalletEntity | null> {
    const runner = manager ?? this.manager;
    return runner.findOne(WalletEntity, {
      where: { id: walletId },
      lock: { mode: 'pessimistic_write' },
    });
  }
}
