# ----- Étape 1 : build -----
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ----- Étape 2 : image finale -----
FROM node:18 AS production
WORKDIR /app
COPY --from=build /app .

ENV PORT=4173
EXPOSE 4173

# On appelle directement vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
