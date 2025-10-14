import { InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { of, throwError } from 'rxjs';
import { InternalDbService } from './internal-db.service';
import { ApiErrorException } from '../../common/exceptions/api-error.exception';
import {
  RegisterCustomerRequest,
  RegisterCustomerResponse,
  TopUpRequest,
  TopUpResponse,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentConfirmRequest,
  PaymentConfirmResponse,
  BalanceQueryParams,
  BalanceQueryResponse,
  InternalResponse,
  ApiResponse,
  ErrorCodes,
} from '@epayco/shared';

describe('InternalDbService', () => {
  let service: InternalDbService;
  let httpServiceMock: jest.Mocked<HttpService>;

  beforeEach(() => {
    httpServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      delete: jest.fn(),
      head: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      options: jest.fn(),
      postForm: jest.fn(),
      putForm: jest.fn(),
      patchForm: jest.fn(),
      axiosRef: {} as AxiosResponse,
      instance: {} as AxiosResponse,
      makeObservable: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    service = new InternalDbService(httpServiceMock);
  });

  describe('registerCustomer', () => {
    const payload: RegisterCustomerRequest = {
      document: '12345678',
      phone: '1234567890',
      fullName: 'John Doe',
      email: 'john@example.com',
    };

    it('should register customer successfully', async () => {
      const mockResponse: InternalResponse<RegisterCustomerResponse> = {
        code: ErrorCodes.OK,
        message: 'Success',
        data: {
          customerId: 'customer-123',
        },
      };

      const axiosResponse: AxiosResponse<InternalResponse<RegisterCustomerResponse>> = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: '/customers/register',
          method: 'post',
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      httpServiceMock.post.mockReturnValue(of(axiosResponse));
      const postSpy = jest.spyOn(httpServiceMock, 'post');

      const result = await service.registerCustomer(payload);

      expect(result).toEqual(mockResponse);
      expect(postSpy).toHaveBeenCalledWith('/customers', payload);
    });

    it('should throw ApiErrorException when API returns error', async () => {
      const apiError: ApiResponse = {
        message: 'Customer already exists',
        code: ErrorCodes.DUPLICATE,
      };

      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        data: apiError,
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpServiceMock.post.mockReturnValue(throwError(() => axiosError));
      const postSpy = jest.spyOn(httpServiceMock, 'post');

      await expect(service.registerCustomer(payload)).rejects.toThrow(ApiErrorException);
      expect(postSpy).toHaveBeenCalledWith('/customers', payload);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const axiosError = new AxiosError('Network error');
      axiosError.response = {
        status: 503,
        data: { message: 'Service temporarily unavailable' },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      httpServiceMock.post.mockReturnValue(throwError(() => axiosError));
      const postSpy = jest.spyOn(httpServiceMock, 'post');

      await expect(service.registerCustomer(payload)).rejects.toThrow(InternalServerErrorException);
      expect(postSpy).toHaveBeenCalledWith('/customers', payload);
    });
  });

  describe('topUp', () => {
    const payload: TopUpRequest = {
      document: '12345678',
      phone: '1234567890',
      amount: 100.5,
    };

    it('should top up wallet successfully', async () => {
      const mockResponse: InternalResponse<TopUpResponse> = {
        code: ErrorCodes.OK,
        message: 'Success',
        data: {
          balance: 100.5,
        },
      };

      const axiosResponse: AxiosResponse<InternalResponse<TopUpResponse>> = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      httpServiceMock.post.mockReturnValue(of(axiosResponse));
      const postSpy = jest.spyOn(httpServiceMock, 'post');

      const result = await service.topUp(payload);

      expect(result).toEqual(mockResponse);
      expect(postSpy).toHaveBeenCalledWith('/wallets/topup', payload);
    });
  });

  describe('initPayment', () => {
    const payload: PaymentInitRequest = {
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
          expiresAt: '2024-01-01T00:00:00Z',
        },
      };

      const axiosResponse: AxiosResponse<InternalResponse<PaymentInitResponse>> = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      httpServiceMock.post.mockReturnValue(of(axiosResponse));
      const postSpy = jest.spyOn(httpServiceMock, 'post');

      const result = await service.initPayment(payload);

      expect(result).toEqual(mockResponse);
      expect(postSpy).toHaveBeenCalledWith('/payments/init', payload);
    });
  });

  describe('confirmPayment', () => {
    const payload: PaymentConfirmRequest = {
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

      const axiosResponse: AxiosResponse<InternalResponse<PaymentConfirmResponse>> = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      httpServiceMock.post.mockReturnValue(of(axiosResponse));
      const postSpy = jest.spyOn(httpServiceMock, 'post');

      const result = await service.confirmPayment(payload);

      expect(result).toEqual(mockResponse);
      expect(postSpy).toHaveBeenCalledWith('/payments/confirm', payload);
    });
  });

  describe('getBalance', () => {
    const params: BalanceQueryParams = {
      document: '12345678',
      phone: '1234567890',
    };

    it('should get balance successfully', async () => {
      const mockResponse: InternalResponse<BalanceQueryResponse> = {
        code: ErrorCodes.OK,
        message: 'Success',
        data: {
          balance: 150.75,
        },
      };

      const axiosResponse: AxiosResponse<InternalResponse<BalanceQueryResponse>> = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      httpServiceMock.get.mockReturnValue(of(axiosResponse));
      const getSpy = jest.spyOn(httpServiceMock, 'get');

      const result = await service.getBalance(params);

      expect(result).toEqual(mockResponse);
      expect(getSpy).toHaveBeenCalledWith('/wallets/balance', {
        params: {
          document: params.document,
          phone: params.phone,
        },
      });
    });

    it('should throw InternalServerErrorException on error', async () => {
      const axiosError = new AxiosError('Network error');
      axiosError.response = {
        status: 503,
        data: { message: 'Service temporarily unavailable' },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      httpServiceMock.get.mockReturnValue(throwError(() => axiosError));
      const getSpy = jest.spyOn(httpServiceMock, 'get');

      await expect(service.getBalance(params)).rejects.toThrow(InternalServerErrorException);
      expect(getSpy).toHaveBeenCalledWith('/wallets/balance', {
        params: {
          document: params.document,
          phone: params.phone,
        },
      });
    });
  });

  describe('error handling', () => {
    it('should handle non-Axios errors in registerCustomer', async () => {
      const payload: RegisterCustomerRequest = {
        document: '12345678',
        phone: '1234567890',
        fullName: 'John Doe',
        email: 'john@example.com',
      };

      const genericError = new Error('Generic error');
      httpServiceMock.post.mockReturnValue(throwError(() => genericError));

      await expect(service.registerCustomer(payload)).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle Axios errors with non-API response format in registerCustomer', async () => {
      const payload: RegisterCustomerRequest = {
        document: '12345678',
        phone: '1234567890',
        fullName: 'John Doe',
        email: 'john@example.com',
      };

      const axiosError = new AxiosError('Network error');
      axiosError.response = {
        status: 500,
        data: 'Internal Server Error',
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      httpServiceMock.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.registerCustomer(payload)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
