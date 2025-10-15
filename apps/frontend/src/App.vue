<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">{{ t('accessibility.skipToContent') }}</a>
    <header class="app-header" role="banner">
      <div class="brand">
        <img alt="EPayco Wallet" class="logo" src="/epayco-logo.png" />
        <h1>{{ t('app.title') }}</h1>
      </div>
      <nav aria-label="Main navigation">
        <RouterLink class="nav-link" to="/register">{{ t('nav.register') }}</RouterLink>
        <RouterLink class="nav-link" to="/top-up">{{ t('nav.topUp') }}</RouterLink>
        <RouterLink class="nav-link" to="/payments/init">{{ t('nav.initPayment') }}</RouterLink>
        <RouterLink class="nav-link" to="/payments/confirm">{{
          t('nav.confirmPayment')
        }}</RouterLink>
        <RouterLink class="nav-link" to="/balance">{{ t('nav.balance') }}</RouterLink>
      </nav>
    </header>
    <main id="main" class="app-main" role="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f9fc;
  color: #0f172a;
}

.app-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  background-color: #0f172a;
  color: #f8fafc;
}

@media (min-width: 768px) {
  .app-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: contain;
  background-color: #e2e2e2;
  padding: 4px;
  border-radius: 8px;
}

.app-header h1 {
  margin: 0;
  font-size: 1.75rem;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.nav-link {
  color: #f8fafc;
  text-decoration: none;
  font-weight: 500;
}

.nav-link:focus-visible,
.nav-link:hover {
  text-decoration: underline;
}

.app-main {
  flex: 1;
  width: min(960px, 100%);
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.skip-link {
  position: absolute;
  left: -999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: -1;
}

.skip-link:focus {
  left: 1rem;
  top: 1rem;
  width: auto;
  height: auto;
  padding: 0.75rem 1rem;
  background-color: #22d3ee;
  color: #0f172a;
  border-radius: 0.5rem;
  z-index: 1000;
}
</style>
