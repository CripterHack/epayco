# Infrastructure

Docker Compose stack for local development. Orchestrates MySQL 8, MailHog, wallet services, and the Vue frontend.

## Commands

- `pnpm --filter @epayco/infra docker:up`: start the stack in detached mode.
- `pnpm --filter @epayco/infra docker:down`: stop and remove containers.
- `pnpm --filter @epayco/infra docker:logs`: follow logs across services.

Ensure you copy the `.env.example` files into real `.env` files before running the stack.