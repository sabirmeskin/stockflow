# 📦 StockFlow — Solution de Gestion de Stocks Multi-Entrepôts

StockFlow est une plateforme web moderne, intuitive et hautement sécurisée de gestion de stocks multi-entrepôts. Conçue pour optimiser le suivi des flux physiques, tracer les flux de marchandises en temps réel et générer des analyses décisionnelles précises, elle offre une interface premium entièrement traduite en **Français** avec gestion de la devise locale (**MAD**).

L'application cible trois profils d'utilisateurs distincts — les opérateurs terrain, les responsables logistiques et les consultants — et propose une interface interactive avec support natif des modes clair et sombre.

---

## 🛡️ Structure des Rôles & Habilitations (RBAC)

Le système intègre un contrôle d'accès basé sur les rôles (**RBAC**) permettant de délimiter finement les droits de chaque utilisateur. 

### 👥 Rôles Système par Défaut
*   **Administrateur** : Accès complet au système, configuration générale, sécurité et validation critique.
*   **Opérateur Terrain** : Responsable des saisies physiques, de la gestion opérationnelle du catalogue d'articles et du suivi des stocks de sécurité.
*   **Consultant Logistique** : Profil d'audit disposant d'un accès complet en lecture seule pour analyser les performances logistiques et exporter des rapports.

### 🔑 Grille d'Habilitations Dynamique
Depuis la console visuelle d'habilitations (`/roles`), l'administrateur peut cocher et modifier en temps réel les permissions associées à chaque rôle :
*   `manage_users` : Gestion des utilisateurs (CRUD, suspension, attribution de rôles).
*   `manage_warehouses` / `read_warehouses` : Gestion et lecture des fiches entrepôts.
*   `manage_items` / `read_items` : Gestion et lecture des fiches articles.
*   `manage_movements` : Création de flux d'entrées, sorties et transferts.
*   `validate_movements` : Validation et rejet des flux d'opérateurs.
*   `view_dashboard` : Accès aux métriques clés et jauges graphiques.
*   `manage_alerts` / `read_alerts` : Configuration et lecture des seuils de sécurité de stock.
*   `export_reports` : Génération des documents Excel et rapports PDF d'inventaire.
*   `configure_system` : Modification des paramètres de l'entreprise (Nom, Adresse, Téléphone, Devise).
*   `read_audit_logs` : Visualisation de l'historique immuable des activités de sécurité.

### 🔒 Sécurité Critique & Suspension
*   **Protection anti-lockout** : Le rôle Administrateur est protégé en écriture seule pour empêcher toute désactivation accidentelle de ses permissions système.
*   **Suspension de compte** : Désactivation instantanée d'un profil par l'administrateur. Un middleware dédié (`EnsureUserIsActive`) déconnecte instantanément les sessions actives du compte suspendu et bloque toute nouvelle tentative de connexion.

---

## 💡 Fonctionnalités Clés du Système

### 🏢 1. Gestion Multi-Entrepôts & Capacité
*   **Annuaire de Stockage** : Enregistrement structuré de chaque site (nom, adresse, capacité volumétrique/quantité maximum autorisée).
*   **Taux d'Occupation Visuel** : Graphiques dynamiques en jauge (`Recharts`) affichant instantanément le taux de remplissage physique de chaque entrepôt.
*   **Surveillance de Surcharge** : Alerte visuelle et blocage en cas de dépassement de la capacité maximale autorisée pour un site lors des transferts ou entrées de marchandises.

### 📋 2. Smart Catalogue & Double Niveau d'Alerte
*   **Catalogue d'Articles** : Chaque produit dispose d'un SKU unique, d'une désignation, d'une catégorie (ex: Électronique, Outillage, Fournitures) et d'un prix unitaire HT.
*   **Double Seuil de Sécurité** :
    1.  *Seuil Global* : Défini sur la fiche article générale (quantité minimale par défaut).
    2.  *Surcharge Spécifique (Override)* : Permet de configurer individuellement un seuil de sécurité différent pour un article au sein d'un entrepôt spécifique (ex: adapter le stock d'alerte à la rotation locale d'un entrepôt).
*   **Indicateurs Visuels** : Affichage d'un badge clignotant **« Bas Stock »** ou **« Rupture »** dès que la quantité physique d'un produit descend sous le seuil configuré.

### 🔄 3. Gestion des Flux de Stocks & Anti-Stock Négatif
*   **Trois Types de Mouvements** :
    *   **Entrée (IN)** : Approvisionnement depuis un fournisseur externe vers un entrepôt.
    *   **Sortie (OUT)** : Expédition client, perte ou consommation interne de stock.
    *   **Transfert (TRANSFER)** : Déplacement interne de marchandises entre deux entrepôts.
*   **Sécurité Anti-Stock Négatif** : L'application effectue une validation transactionnelle en temps réel (client et serveur) interdisant toute sortie ou transfert d'une quantité supérieure au stock disponible dans l'entrepôt source.

### 🔐 4. Cycle d'Approbation Collaboratif & Auto-Validation
*   **Flux Collaboratif** : Tout mouvement de stock initié par un opérateur terrain est enregistré à l'état **En attente** (`pending`) sans impacter les stocks physiques.
*   **Espace d'Approbation Dédié** : Les administrateurs ont accès à une vue listant toutes les demandes en attente avec possibilité de :
    *   *Valider* : Applique instantanément la transaction aux stocks physiques.
    *   *Rejeter* : Annule la transaction et requiert la saisie obligatoire d'un motif de rejet (affiché ensuite dans l'historique de l'opérateur).
*   **Auto-Validation Admin** : Les mouvements saisis directement par un administrateur contournent le cycle d'approbation et s'appliquent immédiatement.

### 🔔 5. Notifications WebSockets Temps Réel
*   **Diffusion en Direct** : Utilisation de connexions WebSockets pour diffuser instantanément des notifications à l'écran sans rafraîchissement manuel de la page.
*   **Alerte Sous-Stockage** : Notification instantanée envoyée à l'équipe logistique dès qu'un mouvement fait passer le stock d'un produit sous son seuil critique.
*   **Mise à Jour de Statuts** : L'opérateur reçoit une alerte push immédiate dès que sa demande de mouvement est officiellement validée ou rejetée.

### 📊 6. Rapports PDF, Exports Excel & Analyses
*   **Exports Excel** : Génération instantanée de tableaux structurés contenant l'inventaire physique global ou l'historique complet des mouvements (avec dates au format `jj/mm/aaaa`).
*   **Rapports PDF Professionnels** : Fiches d'état des stocks et historiques de flux mis en page proprement, prêts pour l'impression ou l'audit physique de fin d'année.
*   **Tableau de Bord Exécutif** : Indicateurs clés consolidant l'occupation des entrepôts, la valorisation financière globale du stock en MAD et la répartition catégorielle des articles.

### 🛡️ 7. Journal d'Audit Système
*   **Traçabilité Immuable** : Enregistrement automatique de chaque événement sensible (connexions, modifications d'articles, validation/rejet de mouvements, modifications d'habilitations).
*   **Métadonnées de Sécurité** : Chaque log enregistre l'auteur du changement, l'action précise, une description explicite et l'adresse IP cliente pour garantir la conformité lors des audits.

### 🗂️ 8. Pagination & Recherche Serveur Optimisées
*   **Performance Scalable** : Toutes les tables clés (Utilisateurs, Articles, Entrepôts, Mouvements de stock, Demandes d'approbation et Journal d'audit) disposent d'une pagination côté serveur.
*   **Recherche Serveur** : Le filtrage par mot-clé (nom, SKU, action, utilisateur, adresse) est exécuté directement sur la base de données, réduisant le volume de données transféré et garantissant une réactivité maximale sur les grands catalogues.
