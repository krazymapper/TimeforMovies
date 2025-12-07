# Architecture Movtime 🏗️

## Vue d'ensemble

Movtime est une application web complète construite avec une architecture monorepo (Turborepo) permettant de trouver où regarder légalement des films, animes et séries TV. L'application est composée d'un frontend Next.js 15 et d'un backend NestJS, partageant des types et configurations communs.

## Structure du Monorepo

```
movtime/
├── apps/
│   ├── web/          # Frontend Next.js 15
│   └── api/          # Backend NestJS
├── packages/
│   ├── types/        # Types TypeScript partagés
│   ├── config/       # Configurations partagées
│   └── ui/           # Composants UI partagés (optionnel)
├── turbo.json        # Configuration Turborepo
└── package.json      # Workspace root
```

## Stack Technique

### Frontend (apps/web)

- **Framework**: Next.js 15 avec App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Authentification**: NextAuth.js v5 (OAuth: Google, GitHub, Apple)
- **Recherche**: Meilisearch (suggestions instantanées)
- **State Management**: React Server Components + Client Components
- **Image Optimization**: Next.js Image avec TMDB CDN

### Backend (apps/api)

- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL avec Prisma ORM
- **Cache**: Redis (Upstash) avec fallback mémoire
- **APIs Externes**:
  - TMDB (The Movie Database) - Données films/séries
  - Watchmode (optionnel) - Agrégateur de plateformes
- **Validation**: class-validator + Zod
- **Monitoring**: Sentry (optionnel)
- **Rate Limiting**: @nestjs/throttler

### Infrastructure

- **Monorepo**: Turborepo pour la gestion multi-packages
- **CI/CD**: GitHub Actions
- **Tests**: Vitest (unitaire) + Playwright (e2e)
- **Package Manager**: pnpm

## Architecture Backend

### Modules Principaux

#### 1. Media Module
Gère les films et séries TV:
- Recherche de contenus
- Détails d'un film/série
- Contenus populaires
- Intégration TMDB API

**Endpoints**:
- `GET /api/v1/media/search?query=...` - Recherche
- `GET /api/v1/media/movie/:id` - Détails film
- `GET /api/v1/media/tv/:id` - Détails série
- `GET /api/v1/media/popular/movies` - Films populaires
- `GET /api/v1/media/popular/tv` - Séries populaires

#### 2. Watch Providers Module
Gère les plateformes de streaming:
- Agrégation TMDB + Watchmode
- Filtrage par pays
- Types de disponibilité (SVOD, TVOD, AVOD)

#### 3. Favorites Module
Gestion des favoris utilisateur:
- Ajout/Suppression
- Liste des favoris
- Vérification si favori

#### 4. Lists Module
Listes personnalisées:
- Création/Modification/Suppression
- Items dans les listes
- Listes publiques/privées

#### 5. Search Module
Historique de recherche:
- Sauvegarde des recherches
- Récupération de l'historique
- Suppression

### Services Externes

#### TMDB Service
- Gestion des appels API TMDB
- Retry logic avec backoff exponentiel
- Transformation des réponses
- Gestion des images

#### Watchmode Service
- Intégration Watchmode API (optionnel)
- Mapping des sources de streaming

#### HTTP Client Utility
- Wrapper Axios avec retry
- Gestion d'erreurs standardisée
- Rate limiting awareness

### Stratégies de Cache

1. **Cache Redis** (production):
   - TTL dynamique basé sur popularité
   - Films populaires: 30min
   - Films moins populaires: 2h
   - Watch providers: 24h

2. **Cache mémoire** (fallback):
   - Si Redis indisponible
   - Même stratégie TTL

3. **Cache HTTP**:
   - Intercepteurs NestJS
   - Décorateurs pour contrôle granulaire

### Gestion d'Erreurs

- **Filtre global d'exceptions** standardisant les réponses
- **Codes d'erreur** cohérents (ERROR_CODES)
- **Retry logic** pour APIs externes
- **Fallbacks** gracieux
- **Logging** structuré

### Sécurité

- **Rate Limiting**: 100 requêtes/min par IP
- **CORS**: Configuré pour origine frontend
- **Validation**: Toutes les entrées validées
- **Auth**: NextAuth (à implémenter)

## Architecture Frontend

### Structure des Pages

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout racine
│   ├── page.tsx           # Page d'accueil
│   ├── search/            # Page de recherche
│   ├── movie/[id]/        # Page détail film
│   ├── tv/[id]/           # Page détail série
│   └── api/auth/          # NextAuth routes
├── components/
│   ├── ui/                # Composants shadcn/ui
│   ├── media/             # Composants média
│   ├── search/            # Composants recherche
│   └── providers.tsx      # Context providers
├── lib/
│   ├── api.ts            # Client API
│   └── utils.ts          # Utilitaires
└── hooks/                # React hooks personnalisés
```

### Composants Principaux

1. **SearchBar**: Barre de recherche avec suggestions (Meilisearch)
2. **MediaCard**: Carte d'affichage film/série
3. **MediaDetails**: Page détail complète
4. **WatchProviders**: Liste des plateformes disponibles
5. **FavoritesButton**: Bouton favoris

### Authentification

- **NextAuth.js v5** avec OAuth
- **Providers**: Google, GitHub, Apple
- **Session**: JWT ou database
- **Middleware**: Protection de routes

### Recherche Intelligente

- **Meilisearch** pour suggestions instantanées
- **Debouncing** des requêtes
- **Historique** des recherches
- **Filtres** par type (movie/tv)

### Optimisations

1. **Server Components**: Maximum de composants serveur
2. **Image Optimization**: Next.js Image avec TMDB
3. **ISR**: Incremental Static Regeneration pour contenu populaire
4. **Lazy Loading**: Composants lourds chargés à la demande
5. **Code Splitting**: Automatique via Next.js

## Base de Données

### Schéma Prisma

#### User
- Informations utilisateur (compatible NextAuth)
- Relations avec favorites, lists, searchHistory

#### Favorite
- Relation User ↔ Media (movie/tv)
- Contrainte unique (userId, mediaId, mediaType)

#### List
- Listes personnalisées utilisateur
- Public/Privé
- Items associés

#### ListItem
- Items dans une liste
- Contrainte unique (listId, mediaId, mediaType)

#### SearchHistory
- Historique des recherches
- Index sur userId et createdAt

### Migrations

- Prisma Migrate pour versioning
- Seeds pour données de test
- Backups réguliers en production

## Gestion des Edge Cases

### APIs Externes

1. **Rate Limiting**:
   - Monitoring des limites TMDB/Watchmode
   - Retry avec backoff exponentiel
   - Cache agressif pour réduire appels

2. **Absence de réponse**:
   - Timeouts configurés (10s)
   - Fallbacks gracieux
   - Messages d'erreur utilisateur

3. **Données manquantes**:
   - Fallback images (placeholder)
   - Validation des champs requis
   - Valeurs par défaut sensées

### Données

1. **Slugs dupliqués**:
   - Utilisation des IDs TMDB (uniques)
   - Pas de slugs custom

2. **Films introuvables**:
   - 404 avec message clair
   - Suggestions alternatives

3. **Titres multilingues**:
   - Stockage originalTitle + title
   - Sélection basée sur langue préférée

### Frontend

1. **Hydration Mismatch**:
   - SSR/ISR cohérent
   - Composants client marqués 'use client'
   - Pas de différence serveur/client

2. **Changement de région**:
   - Stockage préférence utilisateur
   - Mise à jour watch providers
   - Cache invalidé sur changement

3. **Pagination infinie**:
   - Limite raisonnable (100 items max)
   - Cursor-based pagination si nécessaire

## CI/CD

### GitHub Actions

1. **Tests**:
   - Tests unitaires (Vitest)
   - Tests e2e (Playwright)
   - Linting (ESLint)

2. **Build**:
   - Build monorepo (Turborepo)
   - Vérification types TypeScript

3. **Déploiement**:
   - Backend: Vercel/Heroku/Railway
   - Frontend: Vercel
   - Database: Migrations automatiques

## Monitoring

### Sentry

- **Backend**: Erreurs NestJS
- **Frontend**: Erreurs React
- **Performance**: Tracing des requêtes lentes

### Logs

- **Structured Logging**: Winston/Pino
- **Log Levels**: error, warn, info, debug
- **Centralisation**: Logtail/DataDog

## Performance

### Backend

- **Cache Redis**: Réduction appels APIs
- **Connection Pooling**: Prisma
- **Compression**: gzip
- **CDN**: Pour assets statiques

### Frontend

- **Code Splitting**: Automatique Next.js
- **Image Optimization**: Next.js Image
- **ISR**: Contenu statique régénéré
- **Lazy Loading**: Composants/images

## Sécurité

1. **Rate Limiting**: Backend + CDN
2. **CORS**: Origines autorisées uniquement
3. **Validation**: Toutes les entrées
4. **Sanitization**: XSS protection
5. **HTTPS**: Forcé en production
6. **Secrets**: Variables d'environnement

## Évolutivité

### Horizontal Scaling

- **Stateless Backend**: Facilement scalable
- **Redis**: Partage entre instances
- **Database**: Connection pooling
- **CDN**: Distribution globale

### Vertical Scaling

- **Cache agressif**: Réduction charge DB
- **Optimisation requêtes**: Indexes Prisma
- **Async Processing**: Jobs pour tâches lourdes

## Tests

### Unitaires (Vitest)

- **Services**: Logique métier
- **Utils**: Fonctions utilitaires
- **API Routes**: Next.js API

### E2E (Playwright)

- **Flux utilisateur**: Recherche, détails, favoris
- **Authentification**: Login, logout
- **Responsive**: Mobile, tablette, desktop

## Prochaines Étapes

1. ✅ Structure monorepo
2. ✅ Backend NestJS de base
3. ✅ Frontend Next.js de base
4. ⏳ Intégration Meilisearch complète
5. ⏳ Authentification NextAuth
6. ⏳ Tests unitaires et e2e
7. ⏳ CI/CD GitHub Actions
8. ⏳ Documentation API (Swagger)

## Dépendances Clés

### Backend
- `@nestjs/*`: Framework NestJS
- `@prisma/client`: ORM
- `axios`: Client HTTP
- `cache-manager`: Système de cache
- `ioredis`: Client Redis

### Frontend
- `next`: Framework React
- `next-auth`: Authentification
- `tailwindcss`: Styling
- `meilisearch`: Recherche
- `lucide-react`: Icônes

## Configuration Requise

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 14
- Redis (ou Upstash)

## Commandes Utiles

```bash
# Développement
pnpm dev                    # Démarrer tout
pnpm --filter web dev       # Frontend seul
pnpm --filter api dev       # Backend seul

# Build
pnpm build                  # Build tout
pnpm --filter web build     # Build frontend

# Tests
pnpm test                   # Tous les tests
pnpm --filter web test:e2e  # Tests e2e frontend

# Database
cd apps/api
pnpm prisma migrate dev     # Migration
pnpm prisma studio          # Interface DB
```

## Support

Pour toute question ou problème, consulter:
- README.md pour setup
- Code commenté pour détails d'implémentation
- Issues GitHub pour bugs

