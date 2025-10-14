import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponse, ErrorCodes, RegisterCustomerResponse } from '@epayco/shared';
import { successResponse } from '../../common/responses/response.util';
import { ApiErrorException } from '../../common/exceptions/api-error.exception';
import { CustomerRepository } from './customer.repository';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import { WalletEntity } from '../wallets/entities/wallet.entity';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async registerCustomer(dto: RegisterCustomerDto): Promise<ApiResponse<RegisterCustomerResponse>> {
    const { document, email, phone } = dto;

    await this.ensureCustomerUniqueness(document, email, phone);

    const createdCustomer = await this.dataSource.transaction(async (manager) => {
      const customerRepo = manager.getRepository(CustomerEntity);
      const walletRepo = manager.getRepository(WalletEntity);

      const customer = customerRepo.create({
        document,
        fullName: dto.fullName,
        email,
        phone,
      });

      const savedCustomer = await customerRepo.save(customer);

      const wallet = walletRepo.create({
        customerId: savedCustomer.id,
        balance: '0.00',
      });

      await walletRepo.save(wallet);

      return savedCustomer;
    });

    this.logger.log(`Customer registered: ${createdCustomer.id}`);

    return successResponse('Customer registered successfully.', {
      customerId: createdCustomer.id,
    });
  }

  private async ensureCustomerUniqueness(
    document: string,
    email: string,
    phone: string,
  ): Promise<void> {
    if (await this.customerRepository.findByDocument(document)) {
      throw new ApiErrorException(
        HttpStatus.CONFLICT,
        ErrorCodes.DUPLICATE,
        'Document already registered.',
      );
    }

    if (await this.customerRepository.findByEmail(email)) {
      throw new ApiErrorException(
        HttpStatus.CONFLICT,
        ErrorCodes.DUPLICATE,
        'Email already registered.',
      );
    }

    if (await this.customerRepository.findByPhone(phone)) {
      throw new ApiErrorException(
        HttpStatus.CONFLICT,
        ErrorCodes.DUPLICATE,
        'Phone already registered.',
      );
    }
  }
}
