# 📦 StockFlow - Solution de Gestion de Stocks Multi-Entrepôts

StockFlow est une plateforme web moderne et intuitive de gestion de stocks multi-entrepôts, conçue pour optimiser le suivi des flux physiques, tracer les flux de marchandises et générer des analyses décisionnelles précises. L'application cible trois profils d'utilisateurs distincts — les opérateurs terrain, les responsables logistiques et les consultants — et propose une interface premium entièrement traduite en Français.

---

## 🚀 Fonctionnalités Clés du Système

### 🏢 Gestion Multi-Entrepôts & Capacité
*   **Annuaire d'Entrepôts** : Enregistrement structuré des différents sites de stockage avec adresse physique et capacité maximale de stockage.
*   **Taux d'Occupation Visuel** : Graphiques dynamiques en jauge sur le tableau de bord pour surveiller le taux de remplissage en temps réel de chaque entrepôt.
*   **Répartition Globale** : Vue détaillée de l'inventaire affichant la répartition exacte des quantités d'un produit spécifique à travers tous les entrepôts.

### 📋 Catalogue d'Articles & Alertes Intelligent
*   **Fiches Articles Complètes** : Fiches avec code SKU unique, désignation, description textuelle, catégorisation et prix unitaire HT (EUR).
*   **Double Niveau d'Alerte** :
    *   *Seuil global* défini sur la fiche de l'article (quantité de sécurité minimale par défaut).
    *   *Surcharge spécifique (override)* configurée individuellement par entrepôt pour adapter le stock de sécurité aux spécificités locales (ex: taux de rotation plus élevé).
*   **Indicateurs Visuels Dynamiques** : Affichage d'un badge clignotant **« Bas Stock »** lorsque la quantité en stock d'un entrepôt descend sous le seuil critique configuré.

### 🔄 Flux de Stock & Saisie de Mouvements
*   **Trois Types de Mouvements** :
    *   **Entrée (IN)** : Approvisionnement externe de marchandises vers un entrepôt.
    *   **Sortie (OUT)** : Sorties de stock, expéditions clients ou consommation interne.
    *   **Transfert (TRANSFER)** : Déplacement interne de stocks entre deux entrepôts enregistrés.
*   **Vérification Instantanée du Stock (Sécurité Anti-Stock Négatif)** : 
    *   Lors de la saisie d'un flux de type *Sortie* ou *Transfert*, l'application effectue une vérification en temps réel.
    *   Le système bloque la soumission côté client et rejette la transaction côté serveur si le stock disponible dans l'entrepôt source est insuffisant.

### 🔐 Cycle d'Approbation & Double Validation Admin
*   **Flux Collaboratif** : Tout mouvement de stock initié par un **Opérateur Terrain** est enregistré à l'état **En attente** (`pending`) sans impacter immédiatement les stocks physiques.
*   **Espace d'Approbation Dédié** : Les administrateurs ont accès à une vue **« Approbations »** listant toutes les demandes en attente. Ils peuvent :
    *   **Valider** : Applique immédiatement les déductions/ajouts physiques de stocks correspondants.
    *   **Rejeter** : Annule la transaction et requiert la saisie obligatoire d'un motif de rejet (affiché ensuite dans l'historique).
*   **Auto-Validation** : Les flux initiés directement par un profil **Administrateur** sont automatiquement validés à la création.
*   **Badge Notification** : Affichage en temps réel du nombre de mouvements en attente directement sur le menu latéral via un badge rouge dynamique.

### 🛡️ Rôles, Permissions & Habilitations (RBAC)
*   **Contrôle d'Accès basé sur les Rôles (RBAC)** : Intégration fine de Spatie Laravel Permission assurant que chaque profil ne réalise que les actions autorisées par son rôle.
*   **Console d'Habilitations Visuelle (`/roles`)** : Permet à l'administrateur d'éditer dynamiquement les droits associés à chaque rôle via des grilles de cases à cocher classées par modules (Sécurité, Entrepôts, Mouvements, Système).
*   **Sécurité Critique Anti-Lockout** : Le rôle **Administrateur** principal est protégé en écriture seule pour empêcher toute désactivation de ses permissions système.
*   **Suspension de Compte** : Désactivation en un clic des comptes utilisateurs. Un middleware (`EnsureUserIsActive`) déconnecte instantanément les sessions inactives et bloque l'authentification avec un message explicite.

### 📊 Analyses Analytiques & Rapports
*   **Exports Excel Premium** : Génération instantanée de tableaux structurés contenant l'inventaire physique global ou l'historique complet des mouvements via *Laravel Excel*.
*   **Rapports PDF Professionnels** : Fiches d'inventaire et historiques des flux mis en page proprement avec *DomPDF*, prêts pour l'impression ou l'audit physique.
*   **Journal d'Audit Système** : Historisation immuable de chaque événement sensible (connexions, modifications d'articles, validation/rejet de mouvements, modifications d'habilitations) enregistrant l'auteur, la nature de l'action et l'adresse IP.

---

## 🎨 Design & Expérience Utilisateur (UX)

*   **Aesthétique Premium** : Design soigné basé sur des palettes de couleurs harmonieuses (mode clair/sombre supporté).
*   **Micro-Animations** : Transitions fluides, badges animés pour les alertes critiques de sous-stockage et toasts interactifs instantanés (`sonner`) confirmant chaque succès ou erreur opérationnelle.
*   **Ergonomie Responsive** : Conçu pour s'adapter parfaitement aux écrans d'ordinateurs de bureau, tablettes et terminaux mobiles pour les opérateurs sur le terrain.

---

## 🛠️ Technologies de Pointe

*   **Framework Applicatif** : Laravel 13 (PHP)
*   **Technologie Frontend** : React 19 & TypeScript, propulsés par Inertia.js (liaison directe sans API REST publique)
*   **Style & UI Components** : TailwindCSS v4, Radix UI & composants Shadcn
*   **Moteur de Base de Données** : PostgreSQL (avec support SQLite en mémoire pour l'exécution rapide de la suite de tests unitaires et d'intégration)
