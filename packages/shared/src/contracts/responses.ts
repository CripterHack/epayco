import { ErrorCodes } from '../constants/error-codes';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  code: ErrorCodes;
  message: string;
  data?: T;
  errors?: ValidationErrorDetail[];
}

export type InternalResponse<T = unknown> = ApiResponse<T>;

export interface RegisterCustomerRequest {
  document: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface RegisterCustomerResponse {
  customerId: string;
}

export interface TopUpRequest {
  document: string;
  phone: string;
  amount: number;
}

export interface TopUpResponse {
  balance: number;
}

export interface PaymentInitRequest {
  document: string;
  phone: string;
  amount: number;
}

export interface PaymentInitResponse {
  sessionId: string;
  expiresAt: string;
}

export interface PaymentConfirmRequest {
  sessionId: string;
  token6: string;
}

export interface PaymentConfirmResponse {
  balance: number;
}

export interface BalanceQueryResponse {
  balance: number;
}

export interface BalanceQueryParams {
  document: string;
  phone: string;
}
