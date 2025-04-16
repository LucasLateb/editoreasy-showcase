############################
# Étape 1 : construction
############################
FROM node:18 AS build

WORKDIR /app

# Copie des fichiers de dépendances seulement
COPY package*.json ./

# Installation (npm ci plus rapide et fiable en CI)
RUN npm ci

# Copie du reste du code
COPY . .

# Build Vite (génère dist/)
RUN npm run build


############################
# Étape 2 : image finale
############################
FROM node:18 AS production

WORKDIR /app

# Copie tout le dossier compilé (code + dist + run.sh)
COPY --from=build /app .

# Assure‑toi que le script est exécutable
RUN chmod +x run.sh

# Port par défaut de vite preview
ENV PORT=4173
EXPOSE 4173

# On lance bash (et non Node) pour exécuter le script
ENTRYPOINT ["bash", "/app/run.sh"]
