<template>
  <section class="page">
    <header class="page-header">
      <h2>{{ t('paymentConfirm.title') }}</h2>
      <p>{{ t('paymentConfirm.subtitle') }}</p>
    </header>

    <p class="inline-feedback">
      {{ t('paymentConfirm.helper') }}
      <span v-if="currentSession" aria-live="polite">{{
        t('paymentConfirm.sessionPrefilled')
      }}</span>
      <span v-else aria-live="polite">{{ t('paymentConfirm.sessionMissing') }}</span>
    </p>

    <form class="form-card" novalidate @submit.prevent="onSubmit">
      <div class="form-grid cols-2">
        <div class="form-field">
          <label for="payment-confirm-session">{{ t('fields.sessionId.label') }}</label>
          <input
            id="payment-confirm-session"
            v-model="form.sessionId"
            :aria-invalid="String(Boolean(errors.sessionId))"
            :aria-describedby="errors.sessionId ? 'payment-confirm-session-error' : undefined"
            :disabled="paymentConfirmState.loading"
            autocomplete="off"
            inputmode="text"
            name="sessionId"
            required
            @input="clearFieldError('sessionId')"
          />
          <p
            v-if="errors.sessionId"
            id="payment-confirm-session-error"
            class="field-error"
            role="alert"
          >
            {{ errors.sessionId }}
          </p>
        </div>

        <div class="form-field">
          <label for="payment-confirm-token">{{ t('fields.token6.label') }}</label>
          <input
            id="payment-confirm-token"
            v-model="form.token6"
            :aria-invalid="String(Boolean(errors.token6))"
            :aria-describedby="errors.token6 ? 'payment-confirm-token-error' : undefined"
            :disabled="paymentConfirmState.loading"
            autocomplete="one-time-code"
            inputmode="numeric"
            name="token6"
            required
            @input="onTokenInput"
          />
          <p v-if="errors.token6" id="payment-confirm-token-error" class="field-error" role="alert">
            {{ errors.token6 }}
          </p>
        </div>
      </div>

      <StatusMessage
        :message="paymentConfirmState.message"
        :type="paymentConfirmState.feedbackType"
      />

      <button class="primary-button" type="submit" :disabled="paymentConfirmState.loading">
        <span v-if="paymentConfirmState.loading">{{ t('common.loading') }}</span>
        <span v-else>{{ t('paymentConfirm.action') }}</span>
      </button>
    </form>

    <section v-if="paymentConfirmState.data" class="result-card" aria-live="polite">
      <h3>{{ t('paymentConfirm.resultTitle') }}</h3>
      <div class="result-row">
        <span>{{ t('paymentConfirm.resultBalance') }}</span>
        <strong>{{ formattedBalance }}</strong>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import StatusMessage from '../components/StatusMessage.vue';
import { useOperationsStore } from '../stores/useOperationsStore';
import { formatCOP } from '../utils/currency';
import type { PaymentConfirmResponse } from '@epayco/shared';

interface PaymentConfirmForm {
  sessionId: string;
  token6: string;
}

const { t } = useI18n();
const operations = useOperationsStore();
const paymentConfirmState = operations.paymentConfirmState;
const currentSession = operations.currentSession;

const form = reactive<PaymentConfirmForm>({
  sessionId: '',
  token6: '',
});

const errors = reactive<Record<keyof PaymentConfirmForm, string>>({
  sessionId: '',
  token6: '',
});

watch(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  () => currentSession.value,
  (session: { sessionId: string; expiresAt: string } | null) => {
    if (session && session.sessionId && (!form.sessionId || form.sessionId === session.sessionId)) {
      form.sessionId = session.sessionId;
    }
  },
  { immediate: true },
);

const formattedBalance = computed((): string => {
  const data = paymentConfirmState.data as PaymentConfirmResponse | null;
  if (data && typeof data.balance === 'number') {
    return formatCOP(data.balance);
  }
  return '';
});

function clearFieldError(field: keyof PaymentConfirmForm): void {
  errors[field] = '';
}

function onTokenInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  form.token6 = target.value.replace(/\D/g, '').slice(0, 6);
  clearFieldError('token6');
}

function validate(): boolean {
  let isValid = true;

  if (!form.sessionId.trim()) {
    errors.sessionId = t('validation.sessionId');
    isValid = false;
  }

  if (!form.token6) {
    errors.token6 = t('validation.required');
    isValid = false;
  } else if (!/^\d{6}$/.test(form.token6)) {
    errors.token6 = t('validation.token6');
    isValid = false;
  }

  return isValid;
}

async function onSubmit(): Promise<void> {
  errors.sessionId = '';
  errors.token6 = '';

  if (!validate()) {
    return;
  }

  try {
    await operations.confirmPayment({
      sessionId: form.sessionId.trim(),
      token6: form.token6,
    });
  } catch {
    // El estado de error queda gestionado por la tienda.
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header h2 {
  margin: 0;
  font-size: 2rem;
}

.inline-feedback {
  background-color: #f3e8ff;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
