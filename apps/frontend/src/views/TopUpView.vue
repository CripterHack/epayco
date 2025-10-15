<template>
  <section class="page">
    <header class="page-header">
      <h2>{{ t('topUp.title') }}</h2>
      <p>{{ t('topUp.subtitle') }}</p>
    </header>

    <p class="inline-feedback">{{ t('topUp.helper') }} {{ t('common.allFieldsRequired') }}</p>

    <form class="form-card" novalidate @submit.prevent="onSubmit">
      <div class="form-grid cols-2">
        <div class="form-field">
          <label for="topup-document">{{ t('fields.document.label') }}</label>
          <input
            id="topup-document"
            v-model="form.document"
            :aria-invalid="String(Boolean(errors.document))"
            :aria-describedby="errors.document ? 'topup-document-error' : undefined"
            :disabled="topUpState.loading"
            autocomplete="off"
            inputmode="numeric"
            name="document"
            required
            @input="onDocumentInput"
          />
          <p v-if="errors.document" id="topup-document-error" class="field-error" role="alert">
            {{ errors.document }}
          </p>
        </div>

        <div class="form-field">
          <label for="topup-phone">{{ t('fields.phone.label') }}</label>
          <input
            id="topup-phone"
            v-model="form.phone"
            :aria-invalid="String(Boolean(errors.phone))"
            :aria-describedby="errors.phone ? 'topup-phone-error' : undefined"
            :disabled="topUpState.loading"
            autocomplete="tel"
            inputmode="tel"
            name="phone"
            required
            @input="onPhoneInput"
          />
          <p v-if="errors.phone" id="topup-phone-error" class="field-error" role="alert">
            {{ errors.phone }}
          </p>
        </div>

        <div class="form-field">
          <label for="topup-amount">{{ t('fields.amount.label') }}</label>
          <input
            id="topup-amount"
            v-model="form.amount"
            :aria-invalid="String(Boolean(errors.amount))"
            :aria-describedby="errors.amount ? 'topup-amount-error' : undefined"
            :disabled="topUpState.loading"
            inputmode="numeric"
            name="amount"
            required
            @input="onAmountInput"
          />
          <p v-if="errors.amount" id="topup-amount-error" class="field-error" role="alert">
            {{ errors.amount }}
          </p>
        </div>
      </div>

      <StatusMessage :message="topUpState.message" :type="topUpState.feedbackType" />

      <button class="primary-button" type="submit" :disabled="topUpState.loading">
        <span v-if="topUpState.loading">{{ t('common.loading') }}</span>
        <span v-else>{{ t('topUp.action') }}</span>
      </button>
    </form>

    <section v-if="topUpState.data" class="result-card" aria-live="polite">
      <h3>{{ t('topUp.resultTitle') }}</h3>
      <div class="result-row">
        <span>{{ t('topUp.resultBalance') }}</span>
        <strong>{{ formattedBalance }}</strong>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import StatusMessage from '../components/StatusMessage.vue';
import { useOperationsStore } from '../stores/useOperationsStore';
import { formatCOP } from '../utils/currency';

interface TopUpForm {
  document: string;
  phone: string;
  amount: string;
}

const { t } = useI18n();
const operations = useOperationsStore();
const topUpState = operations.topUpState;

const form = reactive<TopUpForm>({
  document: '',
  phone: '',
  amount: '',
});

const errors = reactive<Record<keyof TopUpForm, string>>({
  document: '',
  phone: '',
  amount: '',
});

const formattedBalance = computed(() =>
  topUpState.data ? formatCOP(topUpState.data.balance) : '',
);

function clearFieldError(field: keyof TopUpForm): void {
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
    await operations.topUpWallet({
      document: form.document,
      phone: form.phone,
      amount: parseAmount(),
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
  background-color: #fef3c7;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
}
</style>
