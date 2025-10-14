import { PaymentsFacadeService } from './payments.service';
import { InternalDbService } from '../proxy/internal-db.service';
import { InitPaymentDto } from './dto/init-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import {
  PaymentInitResponse,
  PaymentConfirmResponse,
  InternalResponse,
  ErrorCodes,
} from '@epayco/shared';

describe('PaymentsFacadeService', () => {
  let service: PaymentsFacadeService;
  let internalDbServiceMock: jest.Mocked<InternalDbService>;

  beforeAll(() => {
    internalDbServiceMock = {
      initPayment: jest.fn(),
      confirmPayment: jest.fn(),
    } as jest.Mocked<Partial<InternalDbService>> as jest.Mocked<InternalDbService>;

    service = new PaymentsFacadeService(internalDbServiceMock);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initPayment', () => {
    const initPaymentDto: InitPaymentDto = {
      document: '12345678',
      phone: '1234567890',
      amount: 100.5,
    };

    it('should initialize payment successfully', async () => {
      const mockResponse: InternalResponse<PaymentInitResponse> = {
        code: ErrorCodes.OK,
        message: 'Success',
        data: {
          sessionId: 'session-123',
          expiresAt: '2025-10-06T12:00:00.000Z',
        },
      };

      internalDbServiceMock.initPayment.mockResolvedValue(mockResponse);

      const result = await service.initPayment(initPaymentDto);

      expect(result).toEqual({
        code: ErrorCodes.OK,
        message: 'Success',
        data: mockResponse.data,
      });

      const initPaymentSpy = jest.spyOn(internalDbServiceMock, 'initPayment');
      expect(initPaymentSpy).toHaveBeenCalledWith({
        document: initPaymentDto.document,
        phone: initPaymentDto.phone,
        amount: initPaymentDto.amount,
      });
    });

    it('should handle payment initialization failure', async () => {
      const mockResponse: InternalResponse<PaymentInitResponse> = {
        code: ErrorCodes.NOT_FOUND,
        message: 'Customer not found',
      };

      internalDbServiceMock.initPayment.mockResolvedValue(mockResponse);

      await expect(service.initPayment(initPaymentDto)).rejects.toThrow();

      const initPaymentSpy = jest.spyOn(internalDbServiceMock, 'initPayment');
      expect(initPaymentSpy).toHaveBeenCalledWith({
        document: initPaymentDto.document,
        phone: initPaymentDto.phone,
        amount: initPaymentDto.amount,
      });
    });

    it('should handle service exception during payment initialization', async () => {
      internalDbServiceMock.initPayment.mockRejectedValue(new Error('Network error'));

      await expect(service.initPayment(initPaymentDto)).rejects.toThrow('Network error');

      const initPaymentSpy = jest.spyOn(internalDbServiceMock, 'initPayment');
      expect(initPaymentSpy).toHaveBeenCalledWith({
        document: initPaymentDto.document,
        phone: initPaymentDto.phone,
        amount: initPaymentDto.amount,
      });
    });
  });

  describe('confirmPayment', () => {
    const confirmPaymentDto: ConfirmPaymentDto = {
      sessionId: 'session-123',
      token6: '123456',
    };

    it('should confirm payment successfully', async () => {
      const mockResponse: InternalResponse<PaymentConfirmResponse> = {
        code: ErrorCodes.OK,
        message: 'Success',
        data: {
          balance: 100.5,
        },
      };

      internalDbServiceMock.confirmPayment.mockResolvedValue(mockResponse);

      const result = await service.confirmPayment(confirmPaymentDto);

      expect(result).toEqual({
        code: ErrorCodes.OK,
        message: 'Success',
        data: mockResponse.data,
      });

      const confirmPaymentSpy = jest.spyOn(internalDbServiceMock, 'confirmPayment');
      expect(confirmPaymentSpy).toHaveBeenCalledWith({
        sessionId: confirmPaymentDto.sessionId,
        token6: confirmPaymentDto.token6,
      });
    });

    it('should handle payment confirmation failure', async () => {
      const mockResponse: InternalResponse<PaymentConfirmResponse> = {
        code: ErrorCodes.TOKEN_INVALID,
        message: 'Invalid token provided',
      };

      internalDbServiceMock.confirmPayment.mockResolvedValue(mockResponse);

      await expect(service.confirmPayment(confirmPaymentDto)).rejects.toThrow();

      const confirmPaymentSpy = jest.spyOn(internalDbServiceMock, 'confirmPayment');
      expect(confirmPaymentSpy).toHaveBeenCalledWith({
        sessionId: confirmPaymentDto.sessionId,
        token6: confirmPaymentDto.token6,
      });
    });

    it('should handle service exception during payment confirmation', async () => {
      internalDbServiceMock.confirmPayment.mockRejectedValue(new Error('Database error'));

      await expect(service.confirmPayment(confirmPaymentDto)).rejects.toThrow('Database error');

      const confirmPaymentSpy = jest.spyOn(internalDbServiceMock, 'confirmPayment');
      expect(confirmPaymentSpy).toHaveBeenCalledWith({
        sessionId: confirmPaymentDto.sessionId,
        token6: confirmPaymentDto.token6,
      });
    });
  });
});
