
FROM node:18-bullseye AS base

# Install dependencies needed by onnxruntime
RUN apt-get update && apt-get install -y \
    libc6 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app


COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile


COPY . .


RUN npm run build

# =============================
# 6. Runtime
# =============================
FROM node:18-bullseye AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
