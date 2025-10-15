# Checklist de Validación v0.1.0

| Ítem | Resultado | Observaciones |
| --- | --- | --- |
| Lint monorepo (`pnpm lint`) | ⚠️ No ejecutado | Falló (`node: not found`) en el entorno actual. |
| Tests frontend (`pnpm --filter @epayco/frontend test`) | ⚠️ No ejecutado | Falló (`node: not found`). |
| Tests API (`pnpm --filter @epayco/wallet-api-service test`) | ⚠️ No ejecutado | Falló (`node: not found`). |
| Tests e2e API (`pnpm --filter @epayco/wallet-api-service test:e2e`) | ⚠️ No ejecutado | Falló (`node: not found`). |
| Tests servicio interno (`pnpm --filter @epayco/wallet-db-service test`) | ⚠️ No ejecutado | Falló (`node: not found`). |
| Accesibilidad básica (revisión manual) | ✅ | Formularios con `aria-live`, `aria-invalid` y mensajes asociados. |
| Estados vacíos/error en frontend | ✅ | Vistas muestran `StatusMessage` y bloques `aria-live` (ej. `RegisterView.vue`, `TopUpView.vue`). |
| Colección Postman actualizada | ✅ | `services/wallet-api-service/postman/*`. |
| Documentación actualizada | ✅ | README principal, guías de servicios, `.env.example`, `docs/*`, `CHANGELOG.md`. |
