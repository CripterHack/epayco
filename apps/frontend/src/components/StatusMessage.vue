<template>
  <p v-if="message" :class="statusClasses" :role="computedRole" :aria-live="ariaLive">
    {{ message }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  message: string;
  type?: 'success' | 'error' | 'idle';
}>();

const type = computed(() => props.type ?? 'idle');
const ariaLive = computed(() => (type.value === 'error' ? 'assertive' : 'polite'));
const computedRole = computed(() => (type.value === 'error' ? 'alert' : 'status'));
const statusClasses = computed(() => ['status-message', 'status-message--' + type.value]);
</script>

<style scoped>
.status-message {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  font-weight: 500;
}

.status-message--success {
  background-color: #ecfdf5;
  color: #047857;
  border-color: #34d399;
}

.status-message--error {
  background-color: #fef2f2;
  color: #b91c1c;
  border-color: #fca5a5;
}

.status-message--idle {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-color: #93c5fd;
}
</style>
