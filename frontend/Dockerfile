FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--port", "4173"]
