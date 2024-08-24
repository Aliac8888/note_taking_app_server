# Build stage
FROM node:20.16.0-alpine3.20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Production stage
FROM node:20.16.0-alpine3.20
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Environment variables for conditional execution
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

EXPOSE 1337

# Conditionally use nodemon in development or node in production
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = 'development' ]; then npm run dev; else npm start; fi"]
