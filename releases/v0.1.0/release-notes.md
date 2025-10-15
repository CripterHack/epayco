# EPayco Wallet Platform v0.1.0

## Resumen

Primera versión pública que integra:

- Frontend Vue 3 con flujos completos de registro, recarga, pagos (inicio/confirmación) y consulta de saldo.
- API pública en NestJS con validaciones, mapeo de errores y colección Postman.
- Servicio interno con integración MySQL, tokens por correo y migraciones/seed.
- Pruebas e2e que validan caminos felices y de error en el BFF.
- Documentación completa (guías, .env, video script, changelog, convenciones de commits).

## Requisitos

- Node.js >= 20, pnpm >= 8.
- Docker Compose v2 (para infraestructura local).

## Instalación rápida

```bash
pnpm install
cp .env.example .env                     # repetir en apps/frontend y services/*
pnpm --filter @epayco/infra docker:up
pnpm --filter @epayco/wallet-db-service start:dev
pnpm --filter @epayco/wallet-api-service start:dev
pnpm --filter @epayco/frontend dev
```

Swagger: `http://localhost:3000/api/docs`
Frontend: `http://localhost:5173`
MailHog: `http://localhost:8025`

## Pruebas

- Unitarias frontend: `pnpm --filter @epayco/frontend test`
- Unitarias API pública: `pnpm --filter @epayco/wallet-api-service test`
- End-to-end API pública: `pnpm --filter @epayco/wallet-api-service test:e2e`
- Unitarias servicio interno: `pnpm --filter @epayco/wallet-db-service test`

> Nota: en este entorno de documentación, los comandos no se pudieron ejecutar por ausencia del binario `node`. Verifica tu instalación antes de correrlos.

## Artefactos

- Colección Postman: `services/wallet-api-service/postman/epayco-wallet-api.postman_collection.json`
- Environment Postman: `services/wallet-api-service/postman/epayco-wallet-local.postman_environment.json`
- Guion de video: `docs/video-script.md`
- Guía de contribución: `docs/contributing.md`

## Known Issues

- Se requiere tener Node.js instalado para ejecutar los scripts; en entornos sin `node` las tareas de pnpm fallarán.
- Las pruebas e2e mockean el servicio interno; para pruebas integradas se necesita levantar `wallet-db-service` y MySQL.
