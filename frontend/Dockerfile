FROM node:18-slim

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Switch to non-root user
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
