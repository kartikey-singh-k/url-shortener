# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# The --host flag is required for Vite to work inside a Docker container
CMD ["npm", "run", "dev", "--", "--host"]