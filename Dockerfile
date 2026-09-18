FROM node:20-alpine AS frontend-build

WORKDIR /frontend
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE

COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
COPY --from=frontend-build /frontend/dist ./public

ENV PORT=80
EXPOSE 80

CMD ["npm", "start"]
