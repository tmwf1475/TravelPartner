FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY node_modules ./node_modules
COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

VOLUME ["/app/data"]

CMD ["node", "dist/server.js"]
