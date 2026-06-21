# 📦 StockFlow - Système de Gestion de Stocks Multi-Entrepôts

StockFlow est une application web moderne et performante conçue pour gérer efficacement le stock de plusieurs entrepôts, tracer chaque mouvement de marchandise en temps réel et générer des rapports analytiques de haut niveau. 

L'application est entièrement traduite en Français et s'appuie sur une gestion des accès basée sur les rôles (RBAC) pour s'adapter précisément aux opérateurs terrain, aux responsables logistiques et aux consultants.

---

## ✨ Fonctionnalités Majeures

### 🔒 Gestion des Profils & Habilitations (RBAC)
Une gestion d'accès fine et hautement sécurisée :
*   **Habilitations dynamiques** : Un panneau d'administration dédié permet d'activer ou de désactiver à la volée les permissions associées à chaque rôle.
*   **Protection du rôle Administrateur** : Pour des raisons de sécurité, les permissions du rôle administrateur principal ne peuvent pas être décochées, évitant ainsi tout verrouillage involontaire.
*   **Rôles Prédéfinis** :
    *   **Administrateur** : Gestion complète des utilisateurs, gestion des rôles et habilitations, configuration système globale, validation des flux de stock et accès au journal d'audit.
    *   **Opérateur Terrain** : Lecture des entrepôts, gestion du catalogue d'articles, saisie des flux de stocks (soumis à validation) et gestion des alertes.
    *   **Consultant Logistique** : Accès en lecture seule au tableau de bord, aux stocks et aux alertes. Droit de téléchargement des rapports.

### 🚫 Désactivation des Comptes Utilisateurs
*   L'administrateur peut à tout moment suspendre ou réactiver le compte d'un utilisateur.
*   **Déconnexion immédiate** : Un middleware système vérifie le statut d'activité à chaque requête. Dès qu'un compte est désactivé, l'utilisateur est instantanément déconnecté et redirigé.
*   **Blocage à la connexion** : Les tentatives de connexion sur des comptes désactivés sont immédiatement bloquées avec un message d'erreur clair.

### 🔄 Cycle de Mouvement avec Double Validation
*   Toute saisie de flux (Entrée, Sortie ou Transfert) initiée par un **Opérateur** est enregistrée à l'état *En attente* (`pending`).
*   L'**Administrateur** dispose d'un espace d'approbation exclusif avec un badge d'alerte en temps réel dans sa barre latérale. Il peut *Valider* la demande (ce qui applique la mise à jour physique des stocks) ou la *Rejeter* en renseignant un motif obligatoire.
*   Les mouvements créés par un **Administrateur** sont auto-validés.

### ⚠️ Vérification de Stock & Alertes
*   **Contrôle en temps réel** : Le système calcule dynamiquement la disponibilité lors de la saisie d'une sortie (`OUT`) ou d'un transfert (`TRANSFER`) et bloque toute soumission si la quantité demandée excède le stock disponible dans l'entrepôt source.
*   **Seuils d'alertes personnalisables** : Configuration de seuils minimaux globaux (par article) ou spécifiques (par entrepôt/article) avec indicateurs visuels animés en cas de sous-stockage.

### 📊 Analyses & Exports Multi-Formats
*   Génération et téléchargement d'états de stock physiques et d'historiques de flux en un clic.
*   **PDF** : Rapports professionnels de haute qualité mis en page avec **DomPDF**.
*   **Excel** : Tableaux de données structurés et formatés générés par **Laravel Excel**.

### 📝 Journal d'Audit & Sécurité
*   Traçabilité complète des actions critiques (connexions, créations, modifications, approbations, rejets, changement de statut de compte) avec horodatage, utilisateur responsable et adresse IP d'origine.

---

## 🛠️ Stack Technique

*   **Backend** : Laravel 13.x
*   **Frontend** : React 19 / TypeScript, Inertia.js
*   **Design** : TailwindCSS v4, Radix UI & Shadcn
*   **Base de Données** : PostgreSQL (avec support SQLite pour les tests unitaires)
*   **Rôles/Permissions** : Spatie Laravel Permission
*   **Moteur PDF** : Barryvdh Laravel DomPDF
*   **Moteur Excel** : Maatwebsite Laravel Excel
