FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy everything
COPY . .

EXPOSE 3000

# Re-install deps (in case volume overrides node_modules) then start dev server
CMD ["sh", "-c", "npm ci && npm run dev"]
