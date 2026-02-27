# FreelanceappFront

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

---

## 🏗️ Structure du Projet

```text
src/app/
├── 📂 core/                # Singleton Services & App-wide config
│   ├── 📂 auth/            # AuthService, AuthGuard, TokenInterceptor
│   ├── 📂 interceptors/    # Logging, Error Handling, JWT
│   ├── 📂 models/          # Interfaces globales (User, APIResponse)
│   └── 📂 services/        # ToastService, ApiService, ConfigService
├── 📂 shared/              # Reusable UI & Utilities
│   ├── 📂 components/      # Loader, Button, Modal, Sidebar
│   ├── 📂 pipes/           # CurrencyFormat, TimeAgo
│   ├── 📂 directives/      # RoleAccess, ClickOutside
│   └── ui-kit.module.ts    # Export de PrimeNG/Tailwind components
├── 📂 features/            # Lazy-loaded business modules
│   ├── 📂 auth/            # Login, Register pages
│   ├── 📂 dashboard/       # Vue d'ensemble, Graphiques
│   ├── 📂 missions/        # CRUD Missions
│   └── 📂 invoices/        # Génération & Liste factures
├── app.component.ts        # Conteneur racine (Router-outlet uniquement)
├── app.routes.ts           # Configuration du Lazy Loading
└── app.config.ts           # Providers globaux (ProvideHttpClient, etc.)

```

---

## Détail des Modules et Composants

### A. Le Dossier `Core/` (La Colonne Vertébrale)

Ce dossier contient tout ce qui ne doit être instancié **qu'une seule fois**.

* **`AuthService`** : Gère le login/logout et le stockage du JWT (en mémoire ou `sessionStorage`).
* **`TokenInterceptor`** : Intercepte chaque requête sortante pour injecter le Header `Authorization: Bearer <JWT>`. C'est une exigence de sécurité majeure.
* **`ToastService`** : Un service centralisé pour afficher des notifications (Succès, Erreur) via PrimeNG `MessageService`.

### B. Le Dossier `Shared/` (La Boîte à Outils)

Contient des composants "bêtes" (Stateless) qui reçoivent des données par `@Input` et émettent par `@Output`.

* **`SpinnerComponent`** : Un loader élégant (ex: un anneau de chargement CSS) affiché pendant les appels API.
* **`LayoutComponent`** : Contient la `Navbar` et la `Sidebar`. Les composants de `features` seront injectés à l'intérieur.

### C. Le Dossier `Features/` (Le Métier)

Chaque dossier ici est un module (ou un set de standalone components) **chargé à la demande (Lazy Loading)** pour optimiser le temps de chargement initial.
