<template>
  <section class="page">
    <header class="page-header">
      <h2>{{ t('register.title') }}</h2>
      <p>{{ t('register.subtitle') }}</p>
    </header>

    <p class="inline-feedback">{{ t('register.helper') }} {{ t('common.allFieldsRequired') }}</p>

    <form class="form-card" novalidate @submit.prevent="onSubmit">
      <div class="form-grid cols-2">
        <div class="form-field">
          <label for="register-document">{{ t('fields.document.label') }}</label>
          <input
            id="register-document"
            v-model="form.document"
            :aria-invalid="String(Boolean(errors.document))"
            :aria-describedby="errors.document ? 'register-document-error' : undefined"
            :disabled="registerState.loading"
            autocomplete="off"
            inputmode="numeric"
            name="document"
            required
            @input="onDocumentInput"
          />
          <p v-if="errors.document" id="register-document-error" class="field-error" role="alert">
            {{ errors.document }}
          </p>
        </div>

        <div class="form-field">
          <label for="register-full-name">{{ t('fields.fullName.label') }}</label>
          <input
            id="register-full-name"
            v-model="form.fullName"
            :aria-invalid="String(Boolean(errors.fullName))"
            :aria-describedby="errors.fullName ? 'register-full-name-error' : undefined"
            :disabled="registerState.loading"
            autocomplete="name"
            name="fullName"
            required
            @input="clearFieldError('fullName')"
          />
          <p v-if="errors.fullName" id="register-full-name-error" class="field-error" role="alert">
            {{ errors.fullName }}
          </p>
        </div>

        <div class="form-field">
          <label for="register-email">{{ t('fields.email.label') }}</label>
          <input
            id="register-email"
            v-model="form.email"
            :aria-invalid="String(Boolean(errors.email))"
            :aria-describedby="errors.email ? 'register-email-error' : undefined"
            :disabled="registerState.loading"
            autocomplete="email"
            inputmode="email"
            name="email"
            required
            @input="clearFieldError('email')"
          />
          <p v-if="errors.email" id="register-email-error" class="field-error" role="alert">
            {{ errors.email }}
          </p>
        </div>

        <div class="form-field">
          <label for="register-phone">{{ t('fields.phone.label') }}</label>
          <input
            id="register-phone"
            v-model="form.phone"
            :aria-invalid="String(Boolean(errors.phone))"
            :aria-describedby="errors.phone ? 'register-phone-error' : undefined"
            :disabled="registerState.loading"
            autocomplete="tel"
            inputmode="tel"
            name="phone"
            required
            @input="onPhoneInput"
          />
          <p v-if="errors.phone" id="register-phone-error" class="field-error" role="alert">
            {{ errors.phone }}
          </p>
        </div>
      </div>

      <StatusMessage :message="registerState.message" :type="registerState.feedbackType" />

      <button class="primary-button" type="submit" :disabled="registerState.loading">
        <span v-if="registerState.loading">{{ t('common.loading') }}</span>
        <span v-else>{{ t('register.action') }}</span>
      </button>
    </form>

    <section v-if="registerState.data" class="result-card" aria-live="polite">
      <h3>{{ t('register.resultTitle') }}</h3>
      <div class="result-row">
        <span>{{ t('register.resultCustomerId') }}</span>
        <strong>{{ registerState.data.customerId }}</strong>
      </div>
      <p>{{ t('register.successInstructions') }}</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import StatusMessage from '../components/StatusMessage.vue';
import { useOperationsStore } from '../stores/useOperationsStore';

interface RegisterForm {
  document: string;
  fullName: string;
  email: string;
  phone: string;
}

const { t } = useI18n();
const operations = useOperationsStore();
const registerState = operations.registerState;

const form = reactive<RegisterForm>({
  document: '',
  fullName: '',
  email: '',
  phone: '',
});

const errors = reactive<Record<keyof RegisterForm, string>>({
  document: '',
  fullName: '',
  email: '',
  phone: '',
});

function clearFieldError(field: keyof RegisterForm): void {
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

  if (!form.fullName.trim()) {
    errors.fullName = t('validation.fullName');
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = t('validation.required');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('validation.email');
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
  errors.fullName = '';
  errors.email = '';
  errors.phone = '';

  if (!validate()) {
    return;
  }

  try {
    await operations.registerClient({
      document: form.document,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
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
  background-color: #e0f2fe;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
}
</style>
