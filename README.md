# 📦 StockFlow - Système de Gestion de Stocks Multi-Entrepôts

StockFlow est une application web moderne et performante conçue pour gérer efficacement le stock de plusieurs entrepôts, tracer chaque mouvement de marchandise en temps réel et générer des rapports analytiques de haut niveau.

L'application s'appuie sur une gestion des accès basée sur les rôles (RBAC) pour s'adapter précisément aux opérateurs terrain, aux responsables logistiques et aux consultants.

---

## ✨ Fonctionnalités Majeures

### 🔒 Gestion des Profils (RBAC)
Trois rôles prédéfinis avec des permissions distinctes :
*   **Administrateur** : Gestion complète des comptes utilisateurs, entrepôts, articles, configuration système globale, consultation et validation de tous les flux de marchandises, et accès au journal d'audit.
*   **Opérateur Terrain** : Lecture des entrepôts, gestion du catalogue d'articles, saisie des flux de stocks (soumis à validation) et gestion des alertes.
*   **Consultant Logistique** : Accès en lecture seule au tableau de bord, aux stocks et aux alertes. Droit de téléchargement des exports de rapports.

### 🔄 Cycle de Mouvement avec Double Validation
*   Toute saisie de flux (Entrée, Sortie ou Transfert) initiée par un **Opérateur** est enregistrée en état *En attente* (`pending`).
*   L'**Administrateur** examine les flux soumis, vérifie les stocks et choisit de les *Valider* (ce qui met à jour les stocks réels) ou de les *Rejeter* (avec un motif obligatoire).
*   Les mouvements créés par l'**Administrateur** sont auto-validés.

### ⚠️ Vérification de Stock & Alertes
*   **Contrôle en temps réel** : L'interface calcule dynamiquement la disponibilité lors de la saisie d'une sortie (`OUT`) ou d'un transfert (`TRANSFER`) et bloque toute soumission si la quantité demandée excède le stock de l'entrepôt source.
*   **Seuils d'alertes** : Configuration de seuils minimums globaux (par article) ou spécifiques (par entrepôt/article) avec indicateurs visuels animés en cas de sous-stockage.

### 📊 Analyses & Exports Multi-Formats
*   Génération et téléchargement d'états de stock physiques et d'historiques de flux en un clic.
*   **PDF** : Rapports professionnels mis en page avec **DomPDF**.
*   **Excel** : Tableaux de données structurés générés par **Laravel Excel**.

### 📝 Journal d'Audit
*   Traçabilité complète des actions critiques (connexions, créations, modifications, approbations, rejets) avec horodatage, utilisateur responsable et adresse IP d'origine.

---

## 🛠️ Stack Technique

*   **Backend** : Laravel 13.x
*   **Frontend** : React 19 / TypeScript, Inertia.js
*   **Design** : TailwindCSS v4, Radix UI & Shadcn
*   **Base de Données** : PostgreSQL
*   **Rôles/Permissions** : Spatie Laravel Permission
*   **Moteur PDF** : Barryvdh Laravel DomPDF
*   **Moteur Excel** : Maatwebsite Laravel Excel

---

## 🚀 Installation & Lancement

### Prérequis
*   PHP $\ge$ 8.3 (avec les extensions `pdo_pgsql`, `pgsql` et `gd` activées dans votre `php.ini`)
*   Composer
*   Node.js & npm
*   Un serveur PostgreSQL local actif

### 1. Installation des Dépendances
```bash
# Dépendances PHP
composer install --ignore-platform-req=php

# Dépendances JS
npm install
```

### 2. Configuration de l'environnement
Copiez le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```
Configurez ensuite vos variables de connexion à la base de données PostgreSQL dans le fichier `.env` :
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=entrepots_db
DB_USERNAME=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
```

Générez la clé d'application :
```bash
php artisan key:generate
```

### 3. Base de données & Données de démo
Exécutez les migrations pour initialiser le schéma de base de données ainsi que le seeder pour générer les rôles, permissions et données de test (entrepôts, articles, utilisateurs, configurations) :
```bash
php artisan migrate --seed
```

### 4. Lancement de l'application
Démarrez les serveurs de développement (Laravel Artisan & Vite) en une seule commande :
```bash
npm run dev
```
L'application sera accessible par défaut à l'adresse [http://localhost:8000](http://localhost:8000).

---

## 🔐 Identifiants de Test

Utilisez les comptes suivants pour tester les différents comportements et limitations d'accès :

| Profil / Rôle | Adresse Email | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin@stockflow.com` | `password` |
| **Opérateur Terrain** | `operator@stockflow.com` | `password` |
| **Consultant** | `consultant@stockflow.com` | `password` |

---

## 📜 Licence
Ce projet est sous licence MIT.
