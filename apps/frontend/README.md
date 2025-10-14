![EPayco Wallet](./public/epayco-logo.png)

# Wallet Frontend

SPA construida con Vue 3 + Vite que interactúa con el API de la billetera. Incluye rutas completas para registro de clientes, recargas, pagos (inicio y confirmación) y consulta de saldo. Usa Pinia para el estado compartido y Axios con `baseURL` configurable a través de `VITE_API_BASE_URL`.

## Instalación

```bash
pnpm install
cp .env.example .env
pnpm dev
```

El servidor se levanta en `http://localhost:5173`. Ajusta `VITE_API_BASE_URL` si el BFF corre en otra URL.

## Funcionalidades

- Registro de clientes con validación de campos y confirmación accesible.
- Recarga de billeteras con actualización del saldo en pantalla.
- Flujo de pagos en dos pasos (generación de sesión y confirmación con token).
- Consulta de saldo en tiempo real.
- Mensajes de estado accesibles (`aria-live`) y manejo de estados de carga.

## Scripts

- `pnpm dev`: inicia el servidor de desarrollo en `http://localhost:5173`.
- `pnpm build`: genera los artefactos listos para producción.
- `pnpm preview`: sirve la build localmente.
- `pnpm test`: ejecuta Vitest.
- `pnpm lint`: corre ESLint sobre el código fuente.

Configura las variables de entorno en `.env` (ver `.env.example`).
