# Movtime 🎬

Application web complète pour trouver où regarder légalement vos films, animes et séries TV préférés.

## 🚀 Quick Start

### Prérequis

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 14
- Redis (ou compte Upstash)

### Installation

1. Cloner le repository et installer les dépendances :

```bash
pnpm install
```

2. Configurer les variables d'environnement :

```bash
# Copier les fichiers d'exemple
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

3. Configurer la base de données :

```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma generate
```

4. Démarrer les services :

```bash
# Démarrer tout en mode développement
pnpm dev

# Ou démarrer individuellement
pnpm --filter web dev
pnpm --filter api dev
```

## 📁 Structure du Monorepo

```
movtime/
├── apps/
│   ├── web/          # Frontend Next.js 15
│   └── api/          # Backend NestJS
├── packages/
│   ├── ui/           # Composants shadcn/ui partagés
│   ├── config/       # Configurations partagées
│   └── types/        # Types TypeScript partagés
└── turbo.json        # Configuration Turborepo
```

## 🔧 Technologies

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: NestJS, TypeScript, Prisma
- **Database**: PostgreSQL
- **Cache**: Redis (Upstash)
- **Search**: Meilisearch
- **Auth**: NextAuth.js
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture détaillée et décisions techniques
- **[SETUP.md](./SETUP.md)** - Guide complet de configuration et installation
- **[Instructions.txt](./Instructions.txt)** - Spécifications originales du projet

## 🎯 Fonctionnalités

- ✅ Recherche de films, séries et animes
- ✅ Détails complets avec synopsis, casting, bande-annonce
- ✅ Disponibilités légales par pays (plateformes de streaming)
- ✅ Favoris et listes personnalisées
- ✅ Historique de recherche
- ✅ Détection automatique du pays
- ✅ Interface moderne et responsive

## 📋 Prérequis

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 14
- Redis (ou compte Upstash)
- Clé API TMDB (gratuite)

## 🧪 Tests

```bash
# Tous les tests
pnpm test

# Tests e2e
pnpm --filter web test:e2e
```

## 📝 License

MIT

