import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaymentEntity } from './entities/payment.entity';

@Injectable()
export class PaymentRepository extends Repository<PaymentEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(PaymentEntity, dataSource.createEntityManager());
  }

  async findBySessionId(sessionId: string): Promise<PaymentEntity | null> {
    return this.findOne({ where: { sessionId } });
  }
}
