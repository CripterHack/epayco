<template>
  <section class="page">
    <header class="page-header">
      <h2>{{ t('paymentInit.title') }}</h2>
      <p>{{ t('paymentInit.subtitle') }}</p>
    </header>

    <p class="inline-feedback">{{ t('paymentInit.helper') }} {{ t('common.allFieldsRequired') }}</p>

    <form class="form-card" novalidate @submit.prevent="onSubmit">
      <div class="form-grid cols-2">
        <div class="form-field">
          <label for="payment-init-document">{{ t('fields.document.label') }}</label>
          <input
            id="payment-init-document"
            v-model="form.document"
            :aria-invalid="String(Boolean(errors.document))"
            :aria-describedby="errors.document ? 'payment-init-document-error' : undefined"
            :disabled="paymentInitState.loading"
            autocomplete="off"
            inputmode="numeric"
            name="document"
            required
            @input="onDocumentInput"
          />
          <p
            v-if="errors.document"
            id="payment-init-document-error"
            class="field-error"
            role="alert"
          >
            {{ errors.document }}
          </p>
        </div>

        <div class="form-field">
          <label for="payment-init-phone">{{ t('fields.phone.label') }}</label>
          <input
            id="payment-init-phone"
            v-model="form.phone"
            :aria-invalid="String(Boolean(errors.phone))"
            :aria-describedby="errors.phone ? 'payment-init-phone-error' : undefined"
            :disabled="paymentInitState.loading"
            autocomplete="tel"
            inputmode="tel"
            name="phone"
            required
            @input="onPhoneInput"
          />
          <p v-if="errors.phone" id="payment-init-phone-error" class="field-error" role="alert">
            {{ errors.phone }}
          </p>
        </div>

        <div class="form-field">
          <label for="payment-init-amount">{{ t('fields.amount.label') }}</label>
          <input
            id="payment-init-amount"
            v-model="form.amount"
            :aria-invalid="String(Boolean(errors.amount))"
            :aria-describedby="errors.amount ? 'payment-init-amount-error' : undefined"
            :disabled="paymentInitState.loading"
            inputmode="numeric"
            name="amount"
            required
            @input="onAmountInput"
          />
          <p v-if="errors.amount" id="payment-init-amount-error" class="field-error" role="alert">
            {{ errors.amount }}
          </p>
        </div>
      </div>

      <StatusMessage :message="paymentInitState.message" :type="paymentInitState.feedbackType" />

      <button class="primary-button" type="submit" :disabled="paymentInitState.loading">
        <span v-if="paymentInitState.loading">{{ t('common.loading') }}</span>
        <span v-else>{{ t('paymentInit.action') }}</span>
      </button>
    </form>

    <section v-if="paymentInitState.data" class="result-card" aria-live="polite">
      <h3>{{ t('paymentInit.resultTitle') }}</h3>
      <div class="result-row">
        <span>{{ t('paymentInit.resultSessionId') }}</span>
        <strong>{{ paymentInitState.data.sessionId }}</strong>
      </div>
      <div class="result-row">
        <span>{{ t('paymentInit.resultExpiresAt') }}</span>
        <strong>{{ formattedExpiration }}</strong>
      </div>
      <button class="primary-button" type="button" @click="goToConfirm">
        {{ t('paymentInit.nextStep') }}
      </button>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import StatusMessage from '../components/StatusMessage.vue';
import { useOperationsStore } from '../stores/useOperationsStore';

interface PaymentInitForm {
  document: string;
  phone: string;
  amount: string;
}

const { t } = useI18n();
const router = useRouter();
const operations = useOperationsStore();
const paymentInitState = operations.paymentInitState;

const form = reactive<PaymentInitForm>({
  document: '',
  phone: '',
  amount: '',
});

const errors = reactive<Record<keyof PaymentInitForm, string>>({
  document: '',
  phone: '',
  amount: '',
});

const formattedExpiration = computed(() => {
  if (!paymentInitState.data) {
    return '';
  }

  const expiresAt = new Date(paymentInitState.data.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    return paymentInitState.data.expiresAt;
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(expiresAt);
});

function clearFieldError(field: keyof PaymentInitForm): void {
  errors[field] = '';
}

function onDocumentInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  form.document = target.value.replace(/\D/g, '').slice(0, 20);
  clearFieldError('document');
}

function onPhoneInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  form.phone = target.value.replace(/\D/g, '').slice(0, 15);
  clearFieldError('phone');
}

function onAmountInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  form.amount = target.value.replace(/[^\d]/g, '').slice(0, 9);
  clearFieldError('amount');
}

function parseAmount(): number {
  return Number.parseInt(form.amount, 10);
}

function validate(): boolean {
  let isValid = true;

  if (!form.document) {
    errors.document = t('validation.required');
    isValid = false;
  } else if (!/^\d{6,}$/.test(form.document)) {
    errors.document = t('validation.document');
    isValid = false;
  }

  if (!form.phone) {
    errors.phone = t('validation.required');
    isValid = false;
  } else if (!/^\d{7,15}$/.test(form.phone)) {
    errors.phone = t('validation.phone');
    isValid = false;
  }

  const amount = parseAmount();
  if (!form.amount) {
    errors.amount = t('validation.required');
    isValid = false;
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = t('validation.amount');
    isValid = false;
  }

  return isValid;
}

async function onSubmit(): Promise<void> {
  errors.document = '';
  errors.phone = '';
  errors.amount = '';

  if (!validate()) {
    return;
  }

  try {
    await operations.initPayment({
      document: form.document,
      phone: form.phone,
      amount: parseAmount(),
    });
  } catch {
    // El estado de error queda gestionado por la tienda.
  }
}

function goToConfirm(): void {
  void router.push({ name: 'confirmPayment' });
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
  background-color: #dcfce7;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
}

.result-card {
  gap: 1.5rem;
}

.result-card .primary-button {
  align-self: flex-start;
}
</style>
