import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { CustomerEntity } from './entities/customer.entity';

@Injectable()
export class CustomerRepository extends Repository<CustomerEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(CustomerEntity, dataSource.createEntityManager());
  }

  async findByDocument(document: string): Promise<CustomerEntity | null> {
    return this.findOne({ where: { document } });
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    return this.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<CustomerEntity | null> {
    return this.findOne({ where: { phone } });
  }

  async findByDocumentAndPhone(document: string, phone: string): Promise<CustomerEntity | null> {
    const where: FindOptionsWhere<CustomerEntity> = { document, phone };
    return this.findOne({ where });
  }
}
