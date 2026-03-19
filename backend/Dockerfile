FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ ./

# Load env from root (Railway injects env vars directly)
EXPOSE 3001
CMD ["node", "index.js"]
