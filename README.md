# 🍣 Sushi Group

"Sushi Group" est une application conçue pour faciliter les commandes groupées sur le site Easy Sushi. 🥢 Grâce à elle, plus besoin de se perdre dans les détails : vous pouvez facilement vérifier qui commande quoi et connaître le total par personne. Construite avec une combinaison de technologies puissantes, dont Node.js, Express, TypeScript, Socket.io et Angular, cette application offre une expérience utilisateur intuitive et dynamique.

## 🌟 Fonctionnalités

- **📦 Commandes Groupées** : Facilité de passer des commandes groupées avec une visualisation en temps réel des commandes des autres membres du groupe.
- **⏲️ Visualisation en Temps Réel** : Grâce à l'intégration de Socket.io, les utilisateurs peuvent voir les mises à jour de commandes en temps réel, renforçant ainsi l'expérience collaborative.
- **🍱 Intégration avec Easy Sushi** : L'application récupère les données de menu, lieux et horaires directement depuis le site Easy Sushi pour garantir des informations à jour.
- **👤 Gestion des Profils Utilisateurs** : Chaque utilisateur a la possibilité de créer un profil avec des informations telles que le nom, l'email, la photo de profil et les détails de livraison.

## 📂 Structure du Projet

- **🖥️ Backend (Node.js & Express)** :
  - `controllers/` : Contient la logique des contrôleurs pour gérer les routes API et la logique Socket.io.
  - `models/` : Définitions des modèles et des types utilisés dans l'application, y compris les utilisateurs et les commandes.
  - `index.ts` : Point d'entrée principal du backend.
- **🖼️ Frontend (Angular)** :
  - `src/app` : Contient les principaux composants, services et modules Angular pour la construction de l'interface utilisateur.
  - `src/styles` : Styles globaux pour l'application.

## 📌 À Propos

Le projet "Sushi Group" est né de la nécessité de simplifier le processus de commande groupée pour les amateurs de sushi. 🍜 Au lieu de se faire passer un téléphone pour que chacun commande, "Sushi Group" centralise l'expérience en un seul endroit, rendant les commandes de groupe simples et rapide.
