FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Pass VITE_API_URL to build process
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Pass NODE_ENV to build process
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]