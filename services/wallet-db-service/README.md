# Wallet DB Service

Servicio NestJS privado que encapsula la lógica de negocio y el acceso a la base de datos MySQL. Expone endpoints internos bajo `/internal` consumidos por el BFF público.

## Instalación

```bash
pnpm install
cp .env.example .env
pnpm run migration:run   # crea el esquema
pnpm run seed:run        # datos demo opcionales
pnpm start:dev
```

### Dependencias externas

- MySQL (se provisiona automáticamente con `pnpm --filter @epayco/infra docker:up`).
- MailHog (recibe los correos con tokens y notificaciones).

## Scripts clave

- `pnpm start:dev` – desarrollo con recarga en caliente.
- `pnpm build` – compila a distribución.
- `pnpm test` – pruebas unitarias.
- `pnpm lint` – ESLint.
- `pnpm migration:run|revert` – gestiona migraciones de TypeORM.
- `pnpm seed:run` – inserta datos de referencia.

## Variables de entorno

Revisa `.env.example`; los valores por defecto apuntan a los contenedores locales (`mysql`, `mailhog`). Ajusta credenciales si ejecutas servicios gestionados.

## Correo y tokens

Durante `POST /payments/init` se envía un token al correo configurado. Para verificarlo:

1. Ejecuta `pnpm --filter @epayco/infra docker:up`.
2. Abre `http://localhost:8025`.
3. Busca el asunto **"Token de confirmación de pago"**.

Los tokens expiran según `TOKEN_TTL_MINUTES`.
