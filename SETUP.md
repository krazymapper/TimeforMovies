# Guide de Setup Movtime 🚀

## Prérequis

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0 (installer avec `npm install -g pnpm`)
- **PostgreSQL** >= 14
- **Redis** (ou compte Upstash gratuit)

## Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd Movtime
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration de la base de données

#### Créer une base PostgreSQL

```bash
# Avec psql
createdb movtime

# Ou avec SQL
psql -U postgres
CREATE DATABASE movtime;
```

#### Configurer Prisma

1. Copier le fichier d'environnement:

```bash
cd apps/api
cp .env.example .env
```

2. Modifier `.env` avec vos credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/movtime?schema=public"
```

3. Lancer les migrations:

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

### 4. Configuration Redis

#### Option A: Redis local

Installer et démarrer Redis:

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Télécharger depuis https://redis.io/download
```

Configurer dans `apps/api/.env`:

```env
REDIS_URL="redis://localhost:6379"
```

#### Option B: Upstash (recommandé pour production)

1. Créer un compte sur [Upstash](https://upstash.com)
2. Créer une base Redis
3. Copier l'URL de connexion
4. Ajouter dans `apps/api/.env`:

```env
REDIS_URL="redis://default:password@your-endpoint:6379"
```

### 5. Configuration des APIs externes

#### TMDB (Requis)

1. Créer un compte sur [TMDB](https://www.themoviedb.org)
2. Obtenir une clé API depuis [Settings > API](https://www.themoviedb.org/settings/api)
3. Ajouter dans `apps/api/.env`:

```env
TMDB_API_KEY="votre_cle_tmdb"
```

#### Watchmode (Optionnel)

1. Créer un compte sur [Watchmode](https://www.watchmode.com)
2. Obtenir une clé API
3. Ajouter dans `apps/api/.env`:

```env
WATCHMODE_API_KEY="votre_cle_watchmode"
```

### 6. Configuration Meilisearch (Recherche)

#### Option A: Local

```bash
# macOS/Linux
curl -L https://install.meilisearch.com | sh
./meilisearch

# Ou avec Docker
docker run -d -p 7700:7700 getmeili/meilisearch:latest
```

#### Option B: Cloud (Meilisearch Cloud)

1. Créer un compte sur [Meilisearch Cloud](https://www.meilisearch.com/cloud)
2. Créer un projet
3. Copier host et clé

Configurer dans `apps/api/.env` et `apps/web/.env.local`:

```env
MEILISEARCH_HOST="https://your-instance.meilisearch.com"
MEILISEARCH_MASTER_KEY="votre_cle"
```

### 7. Configuration Frontend

1. Copier le fichier d'environnement:

```bash
cd apps/web
cp .env.example .env.local
```

2. Configurer `.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="générer-une-clé-secrète-aléatoire"
NEXT_PUBLIC_MEILISEARCH_HOST="http://localhost:7700"
```

#### Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 8. Configuration OAuth (Optionnel)

#### Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet
3. Activer Google+ API
4. Créer credentials OAuth 2.0
5. Ajouter redirect URI: `http://localhost:3000/api/auth/callback/google`

Ajouter dans `apps/web/.env.local`:

```env
GOOGLE_CLIENT_ID="votre_client_id"
GOOGLE_CLIENT_SECRET="votre_client_secret"
```

#### GitHub OAuth

1. Aller sur [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Créer une nouvelle OAuth App
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`

Ajouter dans `apps/web/.env.local`:

```env
GITHUB_CLIENT_ID="votre_client_id"
GITHUB_CLIENT_SECRET="votre_client_secret"
```

## Démarrage

### Mode Développement

Démarrer tous les services:

```bash
pnpm dev
```

Ou individuellement:

```bash
# Terminal 1: Backend
cd apps/api
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev

# Terminal 3: Meilisearch (si local)
meilisearch
```

### Vérification

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- API Health: http://localhost:3001/api/v1/health
- Prisma Studio: `cd apps/api && pnpm prisma studio`
- Meilisearch: http://localhost:7700 (si local)

## Troubleshooting

### Erreur de connexion à la base de données

- Vérifier que PostgreSQL est démarré
- Vérifier les credentials dans `.env`
- Vérifier que la base de données existe

### Erreur Redis

- Si Redis local: vérifier qu'il est démarré (`redis-cli ping`)
- Si Upstash: vérifier l'URL de connexion
- Le cache fonctionnera en mémoire si Redis est indisponible

### Erreur TMDB API

- Vérifier que la clé API est valide
- Vérifier les quotas d'API (limite de requêtes)
- Vérifier la connexion internet

### Erreur de build

- Vérifier les versions Node.js et pnpm
- Supprimer `node_modules` et réinstaller: `pnpm clean && pnpm install`
- Vérifier les types TypeScript: `pnpm type-check`

### Port déjà utilisé

- Backend (3001): Modifier `PORT` dans `apps/api/.env`
- Frontend (3000): Modifier dans `apps/web/package.json` script dev
- Meilisearch (7700): Modifier la configuration

## Commandes Utiles

```bash
# Nettoyer et réinstaller
pnpm clean
pnpm install

# Lancer les migrations
cd apps/api
pnpm prisma migrate dev

# Générer Prisma Client
pnpm prisma generate

# Voir la base de données
pnpm prisma studio

# Linter
pnpm lint

# Tests
pnpm test

# Build production
pnpm build
```

## Structure des Fichiers d'Environnement

### Backend (`apps/api/.env`)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://..."

# APIs
TMDB_API_KEY="..."
WATCHMODE_API_KEY="..."

# Meilisearch
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_MASTER_KEY="..."

# Monitoring (optionnel)
SENTRY_DSN="..."
SENTRY_ENVIRONMENT="development"
```

### Frontend (`apps/web/.env.local`)

```env
# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Meilisearch
NEXT_PUBLIC_MEILISEARCH_HOST="http://localhost:7700"
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY="..."
```

## Prochaines Étapes

Une fois le setup terminé:

1. ✅ Vérifier que tout fonctionne (health check API)
2. ⏳ Configurer l'authentification (OAuth)
3. ⏳ Indexer les données dans Meilisearch
4. ⏳ Ajouter des données de test
5. ⏳ Lancer les tests

## Support

Pour toute question, consultez:
- `ARCHITECTURE.md` pour l'architecture
- `README.md` pour la vue d'ensemble
- Issues GitHub pour les problèmes connus

