FROM node:20-bookworm-slim AS builder

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl gosu openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run prisma:generate
RUN npm run build

FROM node:20-bookworm-slim AS runner

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl gosu openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/storage ./storage
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/docker ./docker

RUN mkdir -p /app/storage/reports \
  && chmod +x /app/docker/entrypoint.sh \
  && chown -R node:node /app

ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["npm", "run", "start:web"]
