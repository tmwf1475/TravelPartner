FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY node_modules ./node_modules
COPY dist ./dist
COPY index.html vite.config.ts ./

EXPOSE 4173

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
