import { HttpStatus } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ApiErrorException } from '../../common/exceptions/api-error.exception';
import { WalletsService } from './wallets.service';
import { ErrorCodes } from '@epayco/shared';
import { CustomerRepository } from '../customers/customer.repository';
import { WalletRepository } from './wallet.repository';
import { WalletEntity } from './entities/wallet.entity';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { TopUpEntity } from '../top-ups/entities/top-up.entity';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { BalanceQueryDto } from './dto/balance-query.dto';

describe('WalletsService', () => {
  let dataSourceMock: jest.Mocked<Partial<DataSource>>;
  let customerRepositoryMock: jest.Mocked<CustomerRepository>;
  let walletRepositoryMock: jest.Mocked<WalletRepository>;
  let service: WalletsService;
  let managerMock: jest.Mocked<Partial<EntityManager>>;

  beforeAll(() => {
    managerMock = {
      save: jest.fn(),
      create: jest.fn(),
    } as jest.Mocked<Partial<EntityManager>>;

    dataSourceMock = {
      transaction: jest.fn(
        async (runInTransaction: (entityManager: EntityManager) => Promise<unknown>) => {
          return await runInTransaction(managerMock as EntityManager);
        },
      ),
    } as jest.Mocked<Partial<DataSource>>;

    customerRepositoryMock = {
      findByDocumentAndPhone: jest.fn(),
    } as unknown as jest.Mocked<CustomerRepository>;

    walletRepositoryMock = {
      findByCustomerId: jest.fn(),
      lockById: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<WalletRepository>;

    service = new WalletsService(
      dataSourceMock as DataSource,
      customerRepositoryMock as CustomerRepository,
      walletRepositoryMock as WalletRepository,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('topUpWallet', () => {
    const topUpDto: TopUpWalletDto = {
      document: '12345678',
      phone: '3001234567',
      amount: 100.5,
    };

    it('should throw NOT_FOUND error when customer does not exist', async () => {
      customerRepositoryMock.findByDocumentAndPhone.mockResolvedValue(null);

      await expect(service.topUpWallet(topUpDto)).rejects.toThrow(
        new ApiErrorException(HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND, 'Customer not found.'),
      );

      const findByDocumentAndPhoneSpy = jest.spyOn(
        customerRepositoryMock,
        'findByDocumentAndPhone',
      );
      expect(findByDocumentAndPhoneSpy).toHaveBeenCalledWith(topUpDto.document, topUpDto.phone);
    });

    it('should throw INTERNAL error when wallet does not exist for customer', async () => {
      const customer = { id: 'customer-id' } as Partial<CustomerEntity>;
      customerRepositoryMock.findByDocumentAndPhone.mockResolvedValue(customer);
      walletRepositoryMock.findByCustomerId.mockResolvedValue(null);

      await expect(service.topUpWallet(topUpDto)).rejects.toThrow(
        new ApiErrorException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCodes.INTERNAL,
          'Wallet not found for customer.',
        ),
      );

      const findByCustomerIdSpy = jest.spyOn(walletRepositoryMock, 'findByCustomerId');
      expect(findByCustomerIdSpy).toHaveBeenCalledWith(customer.id);
    });

    it('should throw VALIDATION error when amount is zero or negative', async () => {
      const invalidDto = { ...topUpDto, amount: 0 };
      const customer = { id: 'customer-id' } as Partial<CustomerEntity>;
      const wallet = { id: 'wallet-id', balance: '100.00' } as Partial<WalletEntity>;

      customerRepositoryMock.findByDocumentAndPhone.mockResolvedValue(customer);
      walletRepositoryMock.findByCustomerId.mockResolvedValue(wallet);

      await expect(service.topUpWallet(invalidDto)).rejects.toThrow(
        new ApiErrorException(
          HttpStatus.BAD_REQUEST,
          ErrorCodes.VALIDATION,
          'Top-up amount must be greater than zero.',
        ),
      );
    });

    it('should successfully top up wallet and return updated balance', async () => {
      const customer = { id: 'customer-id' } as Partial<CustomerEntity>;
      const wallet = { id: 'wallet-id', balance: '100.00' } as Partial<WalletEntity>;
      const lockedWallet = { ...wallet, balance: 251 };

      (managerMock.save as jest.Mock).mockResolvedValue(undefined);
      (managerMock.create as jest.Mock).mockReturnValue({
        walletId: wallet.id,
        amount: topUpDto.amount,
        metadata: {
          source: 'internal-service',
          document: topUpDto.document,
          phone: topUpDto.phone,
        },
      });

      customerRepositoryMock.findByDocumentAndPhone.mockResolvedValue(customer);
      walletRepositoryMock.findByCustomerId.mockResolvedValue(wallet);
      walletRepositoryMock.lockById.mockResolvedValue(lockedWallet);

      const result = await service.topUpWallet(topUpDto);

      expect(result).toEqual({
        code: 0,
        message: 'Wallet topped up successfully.',
        data: {
          balance: 351.5,
        },
      });

      const lockByIdSpy = jest.spyOn(walletRepositoryMock, 'lockById');
      expect(lockByIdSpy).toHaveBeenCalledWith(wallet.id, managerMock);
      expect(managerMock.save).toHaveBeenCalledTimes(2);
      expect(managerMock.create).toHaveBeenCalledWith(TopUpEntity, {
        walletId: wallet.id,
        amount: '100.50',
        metadata: {
          source: 'internal-service',
          document: topUpDto.document,
          phone: topUpDto.phone,
        },
      });
    });

    it('should throw INTERNAL error when locked wallet is not found during transaction', async () => {
      const customer = { id: 'customer-id' } as Partial<CustomerEntity>;
      const wallet = { id: 'wallet-id', balance: '50.00' } as Partial<WalletEntity>;

      customerRepositoryMock.findByDocumentAndPhone.mockResolvedValue(customer);
      walletRepositoryMock.findByCustomerId.mockResolvedValue(wallet);
      walletRepositoryMock.lockById.mockResolvedValue(null);

      await expect(service.topUpWallet(topUpDto)).rejects.toThrow(
        new ApiErrorException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCodes.INTERNAL,
          'Wallet not found for customer.',
        ),
      );
    });
  });

  describe('getBalance', () => {
    const balanceDto: BalanceQueryDto = {
      document: '12345678',
      phone: '3001234567',
    };

    it('should throw NOT_FOUND error when customer does not exist', async () => {
      customerRepositoryMock.findByDocumentAndPhone.mockResolvedValue(null);

      await expect(service.getBalance(balanceDto)).rejects.toThrow(
        new ApiErrorException(HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND, 'Customer not found.'),
      );

      const findByDocumentAndPhoneSpy = jest.spyOn(
        customerRepositoryMock,
        'findByDocumentAndPhone',
      );
      expect(findByDocumentAndPhoneSpy).toHaveBeenCalledWith(balanceDto.document, balanceDto.phone);
    });

    it('should throw INTERNAL error when wallet does not exist for customer', async () => {
      const customer = { id: 'customer-id' } as Partial<CustomerEntity>;
      customerRepositoryMock.findByDocumentAndPhone.mockResolvedValue(customer);
      walletRepositoryMock.findByCustomerId.mockResolvedValue(null);

      await expect(service.getBalance(balanceDto)).rejects.toThrow(
        new ApiErrorException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCodes.INTERNAL,
          'Wallet not found for customer.',
        ),
      );

      const findByCustomerIdSpy = jest.spyOn(walletRepositoryMock, 'findByCustomerId');
      expect(findByCustomerIdSpy).toHaveBeenCalledWith(customer.id);
    });

    it('should return wallet balance successfully', async () => {
      const customer = { id: 'customer-id' } as Partial<CustomerEntity>;
      const wallet = { id: 'wallet-id', balance: '50.00' } as Partial<WalletEntity>;
      customerRepositoryMock.findByDocumentAndPhone.mockResolvedValue(customer);
      walletRepositoryMock.findByCustomerId.mockResolvedValue(wallet);

      const result = await service.getBalance(balanceDto);

      expect(result).toEqual({
        code: 0,
        message: 'Balance retrieved successfully.',
        data: {
          balance: 100,
        },
      });

      const findByDocumentAndPhoneSpy = jest.spyOn(
        customerRepositoryMock,
        'findByDocumentAndPhone',
      );
      const findByCustomerIdSpy = jest.spyOn(walletRepositoryMock, 'findByCustomerId');
      expect(findByDocumentAndPhoneSpy).toHaveBeenCalledWith(balanceDto.document, balanceDto.phone);
      expect(findByCustomerIdSpy).toHaveBeenCalledWith(customer.id);
    });
  });
});
