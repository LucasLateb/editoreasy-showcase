#!/bin/bash

# Port par défaut pour Vite preview (ou utilise PORT si défini)
PORT=${PORT:-4173}

echo "Lancement de Vite en mode preview sur le port $PORT..."

# Lancer le serveur preview avec écoute sur toutes les interfaces
npm run preview -- --host 0.0.0.0 --port $PORT