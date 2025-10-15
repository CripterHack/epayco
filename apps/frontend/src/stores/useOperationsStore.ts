import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';
import { AxiosError } from 'axios';
import {
  ApiResponse,
  BalanceQueryParams,
  BalanceQueryResponse,
  PaymentConfirmRequest,
  PaymentConfirmResponse,
  PaymentInitRequest,
  PaymentInitResponse,
  RegisterCustomerRequest,
  RegisterCustomerResponse,
  TopUpRequest,
  TopUpResponse,
} from '@epayco/shared';
import apiClient from '../services/apiClient';

type FeedbackType = 'idle' | 'success' | 'error';

interface OperationState<TData> {
  loading: boolean;
  feedbackType: FeedbackType;
  message: string;
  data: TData | null;
}

function createInitialState<T>(): OperationState<T> {
  return {
    loading: false,
    feedbackType: 'idle',
    message: '',
    data: null,
  };
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const payload = error.response.data as Partial<ApiResponse>;
    if (payload?.message) {
      return payload.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}

export const useOperationsStore = defineStore('operations', () => {
  const registerState = reactive(createInitialState<RegisterCustomerResponse>());
  const topUpState = reactive(createInitialState<TopUpResponse>());
  const balanceState = reactive(createInitialState<BalanceQueryResponse>());
  const paymentInitState = reactive(createInitialState<PaymentInitResponse>());
  const paymentConfirmState = reactive(createInitialState<PaymentConfirmResponse>());
  const currentSession = ref<{ sessionId: string; expiresAt: string } | null>(null);

  async function handleRequest<TData>(
    state: OperationState<TData>,
    request: () => Promise<ApiResponse<TData>>,
    onSuccess?: (response: ApiResponse<TData>) => void,
  ): Promise<void> {
    state.loading = true;
    state.feedbackType = 'idle';
    state.message = '';

    try {
      const response = await request();
      state.data = response.data ?? null;
      state.feedbackType = 'success';
      state.message = response.message;
      onSuccess?.(response);
    } catch (error) {
      state.feedbackType = 'error';
      state.message = extractErrorMessage(error);
      throw error;
    } finally {
      state.loading = false;
    }
  }

  async function registerClient(payload: RegisterCustomerRequest): Promise<void> {
    await handleRequest(registerState, async () => {
      const { data } = await apiClient.post<ApiResponse<RegisterCustomerResponse>>(
        '/clients/register',
        payload,
      );
      return data;
    });
  }

  async function topUpWallet(payload: TopUpRequest): Promise<void> {
    await handleRequest(topUpState, async () => {
      const { data } = await apiClient.post<ApiResponse<TopUpResponse>>('/wallet/topup', payload);
      return data;
    });
  }

  async function getBalance(params: BalanceQueryParams): Promise<void> {
    await handleRequest(balanceState, async () => {
      const { data } = await apiClient.get<ApiResponse<BalanceQueryResponse>>('/wallet/balance', {
        params,
      });
      return data;
    });
  }

  async function initPayment(payload: PaymentInitRequest): Promise<void> {
    await handleRequest(
      paymentInitState,
      async () => {
        const { data } = await apiClient.post<ApiResponse<PaymentInitResponse>>(
          '/payments/init',
          payload,
        );
        return data;
      },
      (response) => {
        if (response.data) {
          currentSession.value = {
            sessionId: response.data.sessionId,
            expiresAt: response.data.expiresAt,
          };
        }
      },
    );
  }

  async function confirmPayment(payload: PaymentConfirmRequest): Promise<void> {
    await handleRequest(
      paymentConfirmState,
      async () => {
        const { data } = await apiClient.post<ApiResponse<PaymentConfirmResponse>>(
          '/payments/confirm',
          payload,
        );
        return data;
      },
      () => {
        currentSession.value = null;
      },
    );
  }

  function resetPaymentStates(): void {
    paymentInitState.data = null;
    paymentInitState.feedbackType = 'idle';
    paymentInitState.message = '';
    paymentConfirmState.data = null;
    paymentConfirmState.feedbackType = 'idle';
    paymentConfirmState.message = '';
    currentSession.value = null;
  }

  return {
    registerState,
    topUpState,
    balanceState,
    paymentInitState,
    paymentConfirmState,
    currentSession,
    registerClient,
    topUpWallet,
    getBalance,
    initPayment,
    confirmPayment,
    resetPaymentStates,
  };
});
