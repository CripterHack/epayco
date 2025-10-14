import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PaymentSessionEntity, PaymentSessionStatus } from './entities/payment-session.entity';

@Injectable()
export class PaymentSessionRepository extends Repository<PaymentSessionEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(PaymentSessionEntity, dataSource.createEntityManager());
  }

  async findBySessionId(sessionId: string): Promise<PaymentSessionEntity | null> {
    return this.findOne({ where: { sessionId } });
  }

  async lockPendingBySessionId(
    sessionId: string,
    manager?: EntityManager,
  ): Promise<PaymentSessionEntity | null> {
    const runner = manager ?? this.manager;
    return runner.findOne(PaymentSessionEntity, {
      where: { sessionId, status: PaymentSessionStatus.PENDING },
      lock: { mode: 'pessimistic_write' },
    });
  }
}
