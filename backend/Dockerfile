FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 80

CMD ["npm", "start"]

# Production stage: same app, but with dev dependencies (nodemon) pruned.
# docker-compose.prod.yml builds this stage via `target: production`.
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 80

CMD ["npm", "start"]
