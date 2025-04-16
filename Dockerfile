# Étape 1 : Construction du projet
FROM node:18 AS build

# Crée un dossier de travail dans le conteneur
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers du projet
COPY . .

# Build de l'application Vite
RUN npm run build

# Étape 2 : Lancement en mode preview (production)
FROM node:18 AS production

# Dossier de travail pour le conteneur final
WORKDIR /app

# Copie le build et les fichiers nécessaires
COPY --from=build /app ./

EXPOSE 4173

# Lancement du serveur de prévisualisation Vite
CMD ["./run.sh"]
