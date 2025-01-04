# Gebruik een officiële Node.js runtime als basis image
FROM node:18-alpine

# Stel de werkdirectory in
WORKDIR /usr/src/app

# Kopieer package.json en package-lock.json
COPY package*.json ./

# Installeer dependencies
RUN npm ci --only=production

# Kopieer de rest van de applicatiecode
COPY . .

# Maak een volume voor logs
VOLUME ["/usr/src/app/logs"]

# Stel environment variabelen in
ENV NODE_ENV=production
ENV PORT=3006

# Expose de poort die de app gebruikt
EXPOSE 3006

# Start de applicatie
CMD ["node", "server.js"]
