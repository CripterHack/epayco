# Wallet API Service

BFF público escrito en NestJS. Expone endpoints REST documentados con Swagger, aplica rate limiting y oficia de proxy seguro hacia el servicio interno de dominio.

## Instalación

```bash
pnpm install
cp .env.example .env
pnpm --filter @epayco/wallet-db-service start:dev   # servicio interno
docker compose -f ../../infra/docker-compose.yml up -d mysql mailhog  # opcional
pnpm start:dev
```

Swagger: `http://localhost:3000/api/docs` (prefijo configurable vía `API_PREFIX`).

## Scripts

- `pnpm start:dev` – arranca el servidor en modo watch.
- `pnpm build` – compila a JavaScript listo para producción.
- `pnpm lint` – ejecuta ESLint.
- `pnpm test` – pruebas unitarias con Jest.
- `pnpm test:e2e` – pruebas end-to-end con Supertest (requiere mock del servicio interno, ya incluido).

## Pruebas e2e

El archivo `test/wallet-api.e2e-spec.ts` mockea `InternalDbService` para cubrir:

- Registro de clientes (éxito y conflicto).
- Recargas (éxito y errores de validación).
- Flujo de pagos (inicio y confirmación) con códigos de error mapeados.
- Consulta de saldo (éxito y `NOT_FOUND`).

Ejecuta `pnpm --filter @epayco/wallet-api-service test:e2e`.

## Postman

Importa los archivos ubicados en `postman/`:

- `epayco-wallet-api.postman_collection.json`
- `epayco-wallet-local.postman_environment.json`

Configura la variable `baseUrl` (por defecto `http://localhost:3000/api`).

## Convenciones

- Sigue Conventional Commits (`feat:`, `fix:`, `docs:`…).
- Registra cambios relevantes en `CHANGELOG.md` del monorepo.
