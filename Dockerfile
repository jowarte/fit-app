# Estágio de build
FROM node:20-alpine AS build
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./
RUN npm install

# Copia o restante do código e faz o build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY . .
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine
# Copia os arquivos compilados do Vite (dist) para a pasta padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Se você quiser usar a configuração personalizada do nginx.conf:
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
