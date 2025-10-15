# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
WORKDIR /workspace
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
RUN corepack enable && npm i -g pnpm@8.15.4 --force

FROM base AS deps
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --filter @epayco/frontend... --frozen-lockfile

FROM deps AS build
WORKDIR /workspace
COPY . .
RUN pnpm --filter @epayco/frontend... build

FROM nginx:1.25-alpine AS production
WORKDIR /usr/share/nginx/html
COPY --from=build /workspace/apps/frontend/dist ./
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf