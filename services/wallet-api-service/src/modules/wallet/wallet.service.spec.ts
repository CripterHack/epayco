import { WalletService } from './wallet.service';
import { InternalDbService } from '../proxy/internal-db.service';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { WalletBalanceQueryDto } from './dto/wallet-balance-query.dto';
import { TopUpResponse, BalanceQueryResponse, InternalResponse, ErrorCodes } from '@epayco/shared';

describe('WalletService', () => {
  let service: WalletService;
  let internalDbServiceMock: jest.Mocked<InternalDbService>;

  beforeAll(() => {
    internalDbServiceMock = {
      topUp: jest.fn(),
      getBalance: jest.fn(),
    } as jest.Mocked<Partial<InternalDbService>> as jest.Mocked<InternalDbService>;

    service = new WalletService(internalDbServiceMock);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('topUp', () => {
    const topUpWalletDto: TopUpWalletDto = {
      document: '12345678',
      phone: '1234567890',
      amount: 100.5,
    };

    it('should top up wallet successfully', async () => {
      const mockResponse: InternalResponse<TopUpResponse> = {
        code: ErrorCodes.OK,
        message: 'Success',
        data: {
          balance: 150.5,
        },
      };

      internalDbServiceMock.topUp.mockResolvedValue(mockResponse);

      const result = await service.topUp(topUpWalletDto);

      expect(result).toEqual({
        code: ErrorCodes.OK,
        message: 'Success',
        data: mockResponse.data,
      });

      const topUpSpy = jest.spyOn(internalDbServiceMock, 'topUp');
      expect(topUpSpy).toHaveBeenCalledWith({
        document: topUpWalletDto.document,
        phone: topUpWalletDto.phone,
        amount: topUpWalletDto.amount,
      });
    });

    it('should handle wallet top up failure', async () => {
      const mockResponse: InternalResponse<TopUpResponse> = {
        code: ErrorCodes.NOT_FOUND,
        message: 'Wallet not found for customer',
      };

      internalDbServiceMock.topUp.mockResolvedValue(mockResponse);

      await expect(service.topUp(topUpWalletDto)).rejects.toThrow();

      const topUpSpy = jest.spyOn(internalDbServiceMock, 'topUp');
      expect(topUpSpy).toHaveBeenCalledWith({
        document: topUpWalletDto.document,
        phone: topUpWalletDto.phone,
        amount: topUpWalletDto.amount,
      });
    });

    it('should handle invalid amount', async () => {
      const invalidDto: TopUpWalletDto = {
        document: '12345678',
        phone: '1234567890',
        amount: -50,
      };

      const mockResponse: InternalResponse<TopUpResponse> = {
        code: ErrorCodes.VALIDATION,
        message: 'Amount must be positive',
      };

      internalDbServiceMock.topUp.mockResolvedValue(mockResponse);

      await expect(service.topUp(invalidDto)).rejects.toThrow();

      const topUpSpy = jest.spyOn(internalDbServiceMock, 'topUp');
      expect(topUpSpy).toHaveBeenCalledWith({
        document: invalidDto.document,
        phone: invalidDto.phone,
        amount: invalidDto.amount,
      });
    });

    it('should handle service exception during top up', async () => {
      internalDbServiceMock.topUp.mockRejectedValue(new Error('Database connection error'));

      await expect(service.topUp(topUpWalletDto)).rejects.toThrow('Database connection error');

      const topUpSpy = jest.spyOn(internalDbServiceMock, 'topUp');
      expect(topUpSpy).toHaveBeenCalledWith({
        document: topUpWalletDto.document,
        phone: topUpWalletDto.phone,
        amount: topUpWalletDto.amount,
      });
    });
  });

  describe('getBalance', () => {
    const walletBalanceQueryDto: WalletBalanceQueryDto = {
      document: '12345678',
      phone: '1234567890',
    };

    it('should get wallet balance successfully', async () => {
      const mockResponse: InternalResponse<BalanceQueryResponse> = {
        code: ErrorCodes.OK,
        message: 'Success',
        data: {
          balance: 250.75,
        },
      };

      internalDbServiceMock.getBalance.mockResolvedValue(mockResponse);

      const result = await service.getBalance(walletBalanceQueryDto);

      expect(result).toEqual({
        code: ErrorCodes.OK,
        message: 'Success',
        data: mockResponse.data,
      });

      const getBalanceSpy = jest.spyOn(internalDbServiceMock, 'getBalance');
      expect(getBalanceSpy).toHaveBeenCalledWith({
        document: walletBalanceQueryDto.document,
        phone: walletBalanceQueryDto.phone,
      });
    });

    it('should handle customer not found', async () => {
      const mockResponse: InternalResponse<BalanceQueryResponse> = {
        code: ErrorCodes.NOT_FOUND,
        message: 'Customer not found',
      };

      internalDbServiceMock.getBalance.mockResolvedValue(mockResponse);

      await expect(service.getBalance(walletBalanceQueryDto)).rejects.toThrow();

      const getBalanceSpy = jest.spyOn(internalDbServiceMock, 'getBalance');
      expect(getBalanceSpy).toHaveBeenCalledWith({
        document: walletBalanceQueryDto.document,
        phone: walletBalanceQueryDto.phone,
      });
    });

    it('should handle wallet not found', async () => {
      const mockResponse: InternalResponse<BalanceQueryResponse> = {
        code: ErrorCodes.NOT_FOUND,
        message: 'Wallet not found for customer',
      };

      internalDbServiceMock.getBalance.mockResolvedValue(mockResponse);

      await expect(service.getBalance(walletBalanceQueryDto)).rejects.toThrow();

      const getBalanceSpy = jest.spyOn(internalDbServiceMock, 'getBalance');
      expect(getBalanceSpy).toHaveBeenCalledWith({
        document: walletBalanceQueryDto.document,
        phone: walletBalanceQueryDto.phone,
      });
    });

    it('should handle service exception during balance query', async () => {
      internalDbServiceMock.getBalance.mockRejectedValue(new Error('Service unavailable'));

      await expect(service.getBalance(walletBalanceQueryDto)).rejects.toThrow(
        'Service unavailable',
      );

      const getBalanceSpy = jest.spyOn(internalDbServiceMock, 'getBalance');
      expect(getBalanceSpy).toHaveBeenCalledWith({
        document: walletBalanceQueryDto.document,
        phone: walletBalanceQueryDto.phone,
      });
    });
  });
});
