# Multi-stage Dockerfile for Puper

# Backend stage
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 3001
CMD ["npm", "start"]

# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Frontend serve stage
FROM nginx:alpine AS frontend
COPY --from=frontend-build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
