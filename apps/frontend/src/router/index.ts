import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/register',
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: 'Registrar cliente' },
    },
    {
      path: '/top-up',
      name: 'topUp',
      component: () => import('../views/TopUpView.vue'),
      meta: { title: 'Recarga' },
    },
    {
      path: '/payments/init',
      name: 'initPayment',
      component: () => import('../views/PaymentInitView.vue'),
      meta: { title: 'Iniciar pago' },
    },
    {
      path: '/payments/confirm',
      name: 'confirmPayment',
      component: () => import('../views/PaymentConfirmView.vue'),
      meta: { title: 'Confirmar pago' },
    },
    {
      path: '/balance',
      name: 'balance',
      component: () => import('../views/BalanceView.vue'),
      meta: { title: 'Consultar saldo' },
    },
  ],
});

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title as string} | EPayco Wallet`;
  }
});
