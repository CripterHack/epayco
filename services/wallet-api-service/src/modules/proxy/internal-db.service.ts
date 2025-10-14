/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  ApiResponse,
  BalanceQueryParams,
  BalanceQueryResponse,
  InternalResponse,
  PaymentConfirmRequest,
  PaymentConfirmResponse,
  PaymentInitRequest,
  PaymentInitResponse,
  RegisterCustomerRequest,
  RegisterCustomerResponse,
  TopUpRequest,
  TopUpResponse,
} from '@epayco/shared';
import { ApiErrorException } from '../../common/exceptions/api-error.exception';
import { resolveHttpStatus } from '../../common/constants/error-http-status.map';

function isApiResponseLike(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { code?: unknown; message?: unknown };
  return typeof candidate.code === 'number' && typeof candidate.message === 'string';
}

@Injectable()
export class InternalDbService {
  private readonly logger = new Logger(InternalDbService.name);

  constructor(private readonly http: HttpService) {}

  async registerCustomer(
    payload: RegisterCustomerRequest,
  ): Promise<InternalResponse<RegisterCustomerResponse>> {
    return this.post<InternalResponse<RegisterCustomerResponse>>('/customers', payload);
  }

  async topUp(payload: TopUpRequest): Promise<InternalResponse<TopUpResponse>> {
    return this.post<InternalResponse<TopUpResponse>>('/wallets/topup', payload);
  }

  async initPayment(payload: PaymentInitRequest): Promise<InternalResponse<PaymentInitResponse>> {
    return this.post<InternalResponse<PaymentInitResponse>>('/payments/init', payload);
  }

  async confirmPayment(
    payload: PaymentConfirmRequest,
  ): Promise<InternalResponse<PaymentConfirmResponse>> {
    return this.post<InternalResponse<PaymentConfirmResponse>>('/payments/confirm', payload);
  }

  async getBalance(params: BalanceQueryParams): Promise<InternalResponse<BalanceQueryResponse>> {
    return this.get<InternalResponse<BalanceQueryResponse>>('/wallets/balance', {
      document: params.document,
      phone: params.phone,
    });
  }

  private async post<T>(path: string, data: unknown): Promise<T> {
    try {
      const response = await firstValueFrom(this.http.post<T>(path, data));
      return response.data;
    } catch (error) {
      this.handleHttpError(error, 'POST', path);
    }
  }

  private async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await firstValueFrom(this.http.get<T>(path, { params }));
      return response.data;
    } catch (error) {
      this.handleHttpError(error, 'GET', path);
    }
  }

  private handleHttpError(error: unknown, method: string, path: string): never {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>;
      const { response } = axiosError;
      this.logger.error(
        {
          err: error.message,
          status: response?.status,
          data: response?.data,
        },
        `Failed internal request ${method} ${path}`,
      );

      const payload = response?.data;
      if (isApiResponseLike(payload)) {
        const errors = Array.isArray(payload.errors) ? payload.errors : undefined;

        throw new ApiErrorException(
          resolveHttpStatus(payload.code),
          payload.code,
          payload.message,
          errors,
        );
      }
    }

    throw new InternalServerErrorException('Internal service communication error');
  }
}

/* eslint-enable @typescript-eslint/no-unsafe-assignment */
