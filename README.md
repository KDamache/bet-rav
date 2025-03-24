# BetRav

## Description

Ce projet consiste en la création d'une plateforme de paris sportifs fictifs en ligne (sans argent en jeu) développée sous forme de microservices. L'architecture repose sur plusieurs services communiquant entre eux via des API REST, avec un frontend permettant l'interaction avec ces services.

Les principales fonctionnalités incluent la gestion des utilisateurs, la gestion des paris sportifs en temps réel, ainsi que la sécurisation des communications via JWT. Le tout est conteneurisé avec Docker et déployé à l'aide de `docker-compose`.

## Architecture

Le projet se compose des éléments suivants :

- **Service d'authentification** : Permet de gérer les utilisateurs et leurs sessions (inscription, connexion, mise à jour du profil).
- **Service de paris** : Permet aux utilisateurs de parier sur des événements sportifs en récupérant les données depuis une API externe (The Odds API).
- **Frontend** : Interface utilisateur développée en React pour interagir avec les services via des requêtes API.

### Technologies utilisées

- **Frontend** : React, TypeScript, Vite, TailwindCSS
- **Backend** : Node.js avec Express
- **Base de données** : MongoDB
- **Conteneurisation** : Docker, docker-compose
- **Sécurité** : JWT pour l'authentification, validation des entrées avec Joi

## Fonctionnalités

- **Service d’authentification** :
  - Inscription des utilisateurs
  - Connexion et génération de jeton JWT
  - Mise à jour du profil utilisateur
  - Suppression du compte utilisateur
- **Service de paris** :
  - Récupération des sports disponibles
  - Affichage des cotes de matchs
  - Placement et suivi des paris
  - Mise à jour du solde de l'utilisateur
- **Frontend** :
  - Affichage des sports et des matchs en cours
  - Interface pour placer des paris et consulter l’historique
  - Gestion du compte utilisateur (modification, suppression, déconnexion)

## Installation

### Prérequis

Assurez-vous que Docker Desktop soit installé et lancé sur votre machine :
- [Docker Desktop](https://www.docker.com/)

### Cloner le dépôt
Clonez ce dépôt sur votre machine locale :
> git clone https://github.com/KDamache/bet-rav.git

Se déplacer dans le bon dossier :
> cd bet-rav\project

### Lancer les services avec Docker
Construisez les images Docker :
> docker-compose build

Lancez les services avec Docker Compose :
> docker-compose up

Cela démarrera les services backend et frontend. 
Vous pourrez accéder à l'application sur http://localhost:5173.

### Accéder à l'API
L'API peut être testée en accédant à l'interface Swagger aux adresses suivante (après avoir lancé les services avec Docker Compose):
- **Authentification** :
http://localhost:3001/api-docs/

- **Paris** :
http://localhost:3002/api-docs/

Le contenu de ces interfaces est disponible dans les deux pdf dans le dossier "annexe".

## Support
N'hésitez pas à créer des tickets au moindre questionnement ou comportement qui semble non prévu/expliqué dans le readme. Notre équipe est réactive :)
