# 1. Start with a lightweight Linux machine that has Node.js installed
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only the package files first (for efficient caching)
COPY package*.json ./

# 4. Install the dependencies inside the container
RUN npm install

# 5. Copy the rest of your backend code into the container
COPY . .

# 6. Expose the port your server runs on
EXPOSE 3000

# 7. The command to start the server
CMD ["npm", "start"]