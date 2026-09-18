FROM node:20-alpine AS production

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/src ./src

ENV PORT=80
EXPOSE 80

CMD ["npm", "start"]
