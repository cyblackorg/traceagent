## Build stage
FROM node:20-alpine AS build

WORKDIR /app

ENV NODE_OPTIONS=--max_old_space_size=2048 \
    CI=false

COPY package*.json ./
RUN npm ci || npm install --no-fund --no-audit

COPY . .

# Expect production env vars to be passed at build time
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_ENV=production
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL \
    REACT_APP_ENV=$REACT_APP_ENV

RUN npm run build

## Runtime stage (nginx)
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config with reverse proxy to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]