import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ApiResponse, BalanceQueryResponse, ErrorCodes, TopUpResponse } from '@epayco/shared';
import { successResponse } from '../../common/responses/response.util';
import { ApiErrorException } from '../../common/exceptions/api-error.exception';
import { CustomerRepository } from '../customers/customer.repository';
import { WalletRepository } from './wallet.repository';
import { TopUpEntity } from '../top-ups/entities/top-up.entity';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { BalanceQueryDto } from './dto/balance-query.dto';
import { fromMinorUnits, toMinorUnits, toNumber } from '../../common/utils/money.util';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly customerRepository: CustomerRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async topUpWallet(dto: TopUpWalletDto): Promise<ApiResponse<TopUpResponse>> {
    const customer = await this.customerRepository.findByDocumentAndPhone(dto.document, dto.phone);

    if (!customer) {
      throw new ApiErrorException(
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        'Customer not found.',
      );
    }

    const wallet = await this.walletRepository.findByCustomerId(customer.id);

    if (!wallet) {
      throw new ApiErrorException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL,
        'Wallet not found for customer.',
      );
    }

    const amountMinor = toMinorUnits(dto.amount);

    if (amountMinor <= 0n) {
      throw new ApiErrorException(
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION,
        'Top-up amount must be greater than zero.',
      );
    }

    const updatedWallet = await this.dataSource.transaction(async (manager: EntityManager) => {
      const lockedWallet = await this.walletRepository.lockById(wallet.id, manager);

      if (!lockedWallet) {
        throw new ApiErrorException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCodes.INTERNAL,
          'Wallet not found for customer.',
        );
      }

      const currentBalance = toMinorUnits(lockedWallet.balance);
      const newBalance = currentBalance + amountMinor;
      lockedWallet.balance = fromMinorUnits(newBalance);

      await manager.save(lockedWallet);

      const topUp = manager.create(TopUpEntity, {
        walletId: lockedWallet.id,
        amount: fromMinorUnits(amountMinor),
        metadata: {
          source: 'internal-service',
          document: dto.document,
          phone: dto.phone,
        },
      });

      await manager.save(topUp);

      return lockedWallet;
    });

    const balanceMinor = toMinorUnits(updatedWallet.balance);

    this.logger.log(`Wallet ${updatedWallet.id} topped up.`);

    return successResponse('Wallet topped up successfully.', {
      balance: Number(toNumber(balanceMinor).toFixed(2)),
    });
  }

  async getBalance(dto: BalanceQueryDto): Promise<ApiResponse<BalanceQueryResponse>> {
    const customer = await this.customerRepository.findByDocumentAndPhone(dto.document, dto.phone);

    if (!customer) {
      throw new ApiErrorException(
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        'Customer not found.',
      );
    }

    const wallet = await this.walletRepository.findByCustomerId(customer.id);

    if (!wallet) {
      throw new ApiErrorException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL,
        'Wallet not found for customer.',
      );
    }

    const balanceMinor = toMinorUnits(wallet.balance);

    return successResponse('Balance retrieved successfully.', {
      balance: Number(toNumber(balanceMinor).toFixed(2)),
    });
  }
}
