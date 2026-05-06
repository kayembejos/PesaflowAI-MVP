# Règles d'Architecture et de Développement - PesaflowAI

Ce document définit les standards obligatoires pour le développement de PesaflowAI. Toute modification ou ajout au codebase doit s'y conformer.

## 1. Stack Technique Obligatoire

- **Framework :** Angular (Version 21+).
  - **Composants :** Utilisation systématique des *Standalone Components*.
  - **Réactivité :** Utilisation des *Signals* pour la gestion de l'état local et partagé. Éviter les Observables pour le simple binding de données.
  - **Templates :** Utilisation exclusive du nouveau *Control Flow* (`@if`, `@for`, `@switch`).
- **Backend :** AngularFire (Firebase) pour l'authentification, Firestore et le Storage.
- **UI :** Angular Material pour tous les composants d'interface. Les styles personnalisés doivent être gérés via Tailwind CSS v4, en respectant le design système Material.

## 2. Structure des Dossiers (Architecture Clean)

Le projet doit suivre strictement cette hiérarchie sous `src/app` :

```text
src/app/
├── core/               # Singleton services, modèles globaux, gardes
│   ├── models/         # Interfaces et types de données
│   ├── services/       # auth, firestore, storage, etc.
│   └── guards/
├── pages/              # Composants de routage de haut niveau
├── features/           # Fonctionnalités métier réutilisables
│   ├── shared/         # UI Components partagés (boutons, cartes, etc.)
│   └── helpers/        # Pipes, utilitaires, fonctions pures
```

## 3. Règles Métier & Réalités Africaines

L'application est optimisée pour les utilisateurs en Afrique, ce qui impose les contraintes suivantes :

- **Offline-First :** 
  - La persistance Firestore doit être activée.
  - L'interface doit rester fonctionnelle sans connexion (optimiste UI).
  - Gestion gracieuse des erreurs de synchronisation dues aux connexions instables.
- **Gestion Multidevise :** 
  - Support natif et conversion dynamique entre devises locales (XOF, CDF, RWF) et devises de référence (USD, EUR).
- **Épargne d'Urgence :** 
  - Le système doit prioriser et inciter l'utilisateur à constituer un fond d'urgence avant toute autre forme d'investissement ou dépense "WANT".
- **Performance :** 
  - Optimisation du poids des assets pour les forfaits data limités.

## 4. Standards de Code

- Tout nouveau composant doit être documenté succinctement (JSDoc).
- Les services Firestore doivent inclure des mécanismes de gestion de cache.
- Les formulaires doivent être réactifs (`ReactiveFormsModule`).
