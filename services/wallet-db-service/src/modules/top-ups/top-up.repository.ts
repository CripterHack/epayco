import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TopUpEntity } from './entities/top-up.entity';

@Injectable()
export class TopUpRepository extends Repository<TopUpEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(TopUpEntity, dataSource.createEntityManager());
  }

  async listByWallet(walletId: string): Promise<TopUpEntity[]> {
    return this.find({ where: { walletId }, order: { createdAt: 'DESC' } });
  }
}
