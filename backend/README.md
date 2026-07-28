# 🪑 Dar Athath — Backend API

## 📦 Description
API REST complète pour le site e-commerce "Dar Athath" (La Maison du Mobilier).
Gestion des produits, catégories, panier, commandes, authentification et administration.

## 🚀 Installation

```bash
# Cloner le projet
git clone [url-du-repo]

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables d'environnement
nano .env

# Créer la base de données
npm run db:create

# Exécuter les migrations
npm run db:migrate

# Charger les données de test
npm run db:seed

# Démarrer le serveur en mode développement
npm run dev

# Démarrer le serveur en production
npm start
