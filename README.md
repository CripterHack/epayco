<p align="center">
  <img src="epayco.png" alt="ePayco — Paga crecer juntos" width="420">
</p>

<h1 align="center">Wallet Virtual (Prueba Técnica) — Node/Nest + MySQL + Vue</h1>

**Objetivo**: Simular una billetera virtual con dos servicios REST (uno privado con acceso a base de datos y otro público que lo consume) y un cliente web en Vue. Tiempo máximo de entrega: **48 horas**.

## Funcionalidad
- Registro de cliente (documento, nombre, email, celular)
- Recarga de billetera
- Iniciar pago (genera `sessionId` y envía `token` de 6 dígitos por email)
- Confirmar pago (descuenta saldo si token válido/no expirado)
- Consulta de saldo (documento + celular)

> Requisitos completos en el documento original (dos servicios, ORM MySQL, frontend Vue, Postman, guía de video). 

## Arquitectura

```mermaid
flowchart LR
  subgraph Client
    WebApp[Vue 3 WebApp]
    Postman[(Postman)]
  end

  subgraph Public[wallet-api-service (NestJS)]
    Swagger
  end

  subgraph Private[wallet-db-service (NestJS)]
    Domain[(Casos de Uso)]
    ORM[(TypeORM)]
  end

  DB[(MySQL)]
  Mail[SMTP/MailHog]

  WebApp -->|HTTP/JSON| Public
  Postman -->|HTTP/JSON| Public
  Public -->|API interna (JWT/API-Key, red interna)| Private
  Private --> ORM --> DB
  Private --> Mail
  Swagger -.-> Public
