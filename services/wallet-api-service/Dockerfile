# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
WORKDIR /workspace
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
RUN corepack enable && npm i -g pnpm@8.15.4 --force

FROM base AS deps
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY services/wallet-api-service/package.json services/wallet-api-service/
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --filter @epayco/wallet-api-service... --frozen-lockfile

FROM deps AS build
WORKDIR /workspace
COPY . .
RUN pnpm --filter @epayco/wallet-api-service... build

FROM base AS production
WORKDIR /workspace
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY services/wallet-api-service/package.json services/wallet-api-service/
COPY packages/shared/package.json packages/shared/package.json
COPY --from=build /workspace/services/wallet-api-service/dist services/wallet-api-service/dist
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
WORKDIR /workspace/services/wallet-api-service
CMD ["node", "dist/main.js"]