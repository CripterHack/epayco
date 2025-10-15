<template>
  <section class="page">
    <header class="page-header">
      <h2>{{ t('balance.title') }}</h2>
      <p>{{ t('balance.subtitle') }}</p>
    </header>

    <p class="inline-feedback">{{ t('balance.helper') }} {{ t('common.allFieldsRequired') }}</p>

    <form class="form-card" novalidate @submit.prevent="onSubmit">
      <div class="form-grid cols-2">
        <div class="form-field">
          <label for="balance-document">{{ t('fields.document.label') }}</label>
          <input
            id="balance-document"
            v-model="form.document"
            :aria-invalid="String(Boolean(errors.document))"
            :aria-describedby="errors.document ? 'balance-document-error' : undefined"
            :disabled="balanceState.loading"
            autocomplete="off"
            inputmode="numeric"
            name="document"
            required
            @input="onDocumentInput"
          />
          <p v-if="errors.document" id="balance-document-error" class="field-error" role="alert">
            {{ errors.document }}
          </p>
        </div>

        <div class="form-field">
          <label for="balance-phone">{{ t('fields.phone.label') }}</label>
          <input
            id="balance-phone"
            v-model="form.phone"
            :aria-invalid="String(Boolean(errors.phone))"
            :aria-describedby="errors.phone ? 'balance-phone-error' : undefined"
            :disabled="balanceState.loading"
            autocomplete="tel"
            inputmode="tel"
            name="phone"
            required
            @input="onPhoneInput"
          />
          <p v-if="errors.phone" id="balance-phone-error" class="field-error" role="alert">
            {{ errors.phone }}
          </p>
        </div>
      </div>

      <StatusMessage :message="balanceState.message" :type="balanceState.feedbackType" />

      <button class="primary-button" type="submit" :disabled="balanceState.loading">
        <span v-if="balanceState.loading">{{ t('common.loading') }}</span>
        <span v-else>{{ t('balance.action') }}</span>
      </button>
    </form>

    <section v-if="balanceState.data" class="result-card" aria-live="polite">
      <h3>{{ t('balance.resultTitle') }}</h3>
      <div class="result-row">
        <span>{{ t('balance.resultBalance') }}</span>
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

interface BalanceForm {
  document: string;
  phone: string;
}

const { t } = useI18n();
const operations = useOperationsStore();
const balanceState = operations.balanceState;

const form = reactive<BalanceForm>({
  document: '',
  phone: '',
});

const errors = reactive<Record<keyof BalanceForm, string>>({
  document: '',
  phone: '',
});

const formattedBalance = computed(() =>
  balanceState.data ? formatCOP(balanceState.data.balance) : '',
);

function clearFieldError(field: keyof BalanceForm): void {
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

  return isValid;
}

async function onSubmit(): Promise<void> {
  errors.document = '';
  errors.phone = '';

  if (!validate()) {
    return;
  }

  try {
    await operations.getBalance({
      document: form.document,
      phone: form.phone,
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
  background-color: #ede9fe;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
}
</style>
