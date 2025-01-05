# SEO-SEA Automation Platform Setup

## Project Structuur

### Root Directory

- `.env.*` - Verschillende environment configuratie bestanden
- `docker-compose.*` - Docker compose configuraties voor verschillende omgevingen
- `*.Dockerfile.*` - Docker configuraties voor verschillende services
- `vite.*.config.js` - Vite configuraties voor verschillende frontends
- `.npmrc` - NPM configuratie voor consistente builds
- `prometheus.yml` - Prometheus monitoring configuratie
- `traefik/config/dynamic.yml` - Traefik SSL en TLS configuratie

### Hoofdmappen

- `/src` - Hoofdbroncode

  - `/controllers` - API controllers
  - `/models` - Database models
  - `/services` - Business logic services
  - `/routes` - API route definities
  - `/middleware` - Express middleware
  - `/frontend` - Frontend applicatie
  - `/dashboard` - Dashboard applicatie
  - `/utils` - Utility functies en logging
  - `/config` - Applicatie configuraties
  - `/cron` - Geplande taken

- `/Documentation` - Project documentatie
- `/scripts` - Hulpscripts voor development en deployment
- `/tests` & `/__tests__` - Test suites
- `/public` - Statische bestanden
- `/traefik` - Traefik configuraties en SSL certificaten
  - `/config` - Dynamische configuratie
  - `/certificates` - SSL certificaten
- `/monitoring` - Monitoring configuraties
- `/logs` - Applicatie logs (in Docker volume)
- `/license-server` - Licentie server implementatie

## Dependencies

### Core Dependencies

- Node.js >= 20.0.0
- NPM >= 10.0.0
- MongoDB >= 6.0
- Redis >= 7.0

### NPM Packages

- Express.js - Web framework
- Winston - Logging met daily rotate
- Mongoose - MongoDB ODM
- IORedis - Redis client
- Helmet - Security middleware
- Express Rate Limit - Rate limiting
- Express Timeout Handler - Request timeouts
- CSURF - CSRF bescherming
- XSS Clean - XSS preventie
- Express Mongo Sanitize - NoSQL injectie preventie

### Development Tools

- ESLint - Code linting
- Prettier - Code formatting
- Jest/Vitest - Testing
- Cypress - E2E testing
- NPM Check - Dependency updates

## Docker Setup

### Services

1. API Service

   - Base: Node.js 23 Alpine
   - Production optimalisaties:
     - Multi-stage builds
     - npm ci voor exacte versies
     - Dependency caching
     - Security hardening
     - Process management (dumb-init)
   - Environment variables:
     - HOST=localhost
   - Volumes:
     - /app/logs - Applicatie logs
     - /app/src - Source code (development)

2. Redis Service

   - Alpine-based image
   - Persistence met AOF
   - Health checks
   - Exposed port: 6379

3. MongoDB Service

   - Version 6
   - Health checks
   - Exposed port: 27017

4. Frontend/Dashboard Services
   - Node.js 20 Alpine voor development
   - Environment variables:
     - HOST=localhost
     - VITE_HOST=localhost
   - Exposed ports:
     - Frontend: 3000
     - Dashboard: 3001

### Development Setup

```bash
# SSL certificaten genereren
mkdir -p traefik/certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout traefik/certificates/local-key.pem -out traefik/certificates/local-cert.pem -subj "/CN=*.seo-sea.local"

# Certificaat importeren in Windows
Import-Certificate -FilePath "traefik/certificates/local-cert.pem" -CertStoreLocation Cert:\LocalMachine\Root

# Start development omgeving
docker-compose -f docker-compose.dev.yml up --build

# Run tests
docker-compose -f docker-compose.cypress.yml up --build --exit-code-from cypress
```

### Production Setup

```bash
# Build en start productie omgeving
docker-compose -f docker-compose.prod.yml up --build -d
```

## Logging

### Log Levels

- Production: info en hoger
- Development: debug en hoger

### Log Files

- `error-%DATE%.log` - Error logs (daily rotate)
- `combined-%DATE%.log` - Alle logs (daily rotate)
- `exceptions-%DATE%.log` - Uncaught exceptions

### Log Retentie

- Maximum bestandsgrootte: 20MB
- Bewaarperiode: 14 dagen

## Security Features

### Implemented

- CSRF Protection
- XSS Prevention
- NoSQL Injection Prevention
- Rate Limiting
- Security Headers (Helmet)
- Request Timeouts
- Content Security Policy
- MongoDB Query Sanitization

### Best Practices

- Gebruik van non-root user in containers
- Secure dependency management
- Regular security audits
- Proper error handling
- Input validation
- Output encoding

## Performance Optimalisaties

### Node.js

- Garbage Collection tuning
- Memory limits configuratie
- Source maps in productie
- Proper process management

### Docker

- Multi-stage builds
- Layer caching
- Dependency caching
- Alpine-based images
- Volume mounting voor logs
- Health checks voor alle services

## Services Architectuur

### Frontend Services

1. Hoofdfrontend (Vite)

   - Config: vite.frontend.config.js
   - Source: /src/frontend
   - URL: https://app.seo-sea.local

2. Dashboard (Vite)
   - Config: vite.dashboard.config.js
   - Source: /src/dashboard
   - URL: https://dashboard.seo-sea.local

### Backend Services

1. API Server (Node.js/Express)

   - Entry: /src/index.js
   - Routes: /src/routes
   - Controllers: /src/controllers
   - URL: https://api.seo-sea.local

2. License Server
   - Directory: /license-server

### Infrastructure Services

1. Traefik (Reverse Proxy)

   - Config: traefik/config/dynamic.yml
   - Certificaten: /traefik/certificates
   - Dashboard URL: https://traefik.seo-sea.local
   - Poorten:
     - 80 (HTTP)
     - 443 (HTTPS)
     - 8080 (Dashboard)

2. Prometheus (Monitoring)
   - Config: prometheus.yml
   - URL: https://prometheus.seo-sea.local

## Development Setup

- Docker Compose Dev: docker-compose.dev.yml
- Development Dockerfile: Dockerfile.dev
- Hosts Configuration: scripts/update-hosts.ps1

## Production Setup

- Docker Compose Prod: docker-compose.prod.yml
- Production Dockerfile: Dockerfile
- Environment: .env.prod

## Testing

- Cypress E2E Tests: /cypress
- Unit Tests: /tests, /**tests**
- Configuration: cypress.config.js, vitest.config.js

## CI/CD

- GitHub Actions: /.github/workflows
- PM2 Config: ecosystem.config.js

## Monitoring & Logging

- Prometheus: prometheus.yml
- NewRelic: newrelic.js
- Logs Directory: /logs

## Security

- CSRF Protection
- Environment Variables
- Secrets Management: scripts/generate_secrets.py

Belangrijk voor Frontend Developers: Voor CSRF bescherming moeten alle POST/PUT/DELETE requests een CSRF token bevatten. Deze kan worden verkregen uit: De cookie 'XSRF-TOKEN'. Deze token moet worden meegestuurd in de 'CSRF-Token' header.

## License Server

- Docker Compose: docker-compose.license-server.yml
- Environment: .env.license-server

## Deployment

- Docker Compose: docker-compose.yml
- Environment: .env

## Docker Troubleshooting

- Port Conflicts
- Permission Issues
- Container Communication

## SSL Troubleshooting

- Development SSL Issues
- Production SSL Issues

## Best Practices

- Use mkcert for secure local development SSL certificates
- Use Let's Encrypt for secure production SSL certificates

## Docker Installation

- Docker Desktop
- Docker Compose
- Docker Hub

## License Management

- License Server
- License Client

## Licentie Server Setup

### Vereisten

- Node.js 18 of hoger
- Docker Desktop
- PostgreSQL 15 of hoger
- npm of yarn

### Installatie

1. Clone de repository:

```bash
git clone [repository-url]
cd seo-sea-automation/license-server
```

2. Installeer de dependencies:

```bash
npm install
```

3. Maak een `.env` bestand aan met de volgende variabelen:

```bash
NODE_ENV=development
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
JWT_SECRET=secret_key
LICENSE_SERVER_PORT=3001
```

4. Start de licentie server:

```bash
npm start   # voor development
```

5. Controleer de status van de licentie server:

```bash
npm run status
```

6. Gebruik de licentie server om licenties te verkrijgen:

```bash
npm run get-license
```

## Recente Updates (2025-01-03)

### Beveiligingsupdates

- Alle kritieke kwetsbaarheden zijn opgelost
- Dependencies zijn geüpgraded naar veilige versies
- Verouderde packages zijn vervangen door moderne alternatieven

### Nieuwe Features

- TypeScript ondersteuning toegevoegd voor betere type-checking
- Moderne HTTP client met node-fetch
- Verbeterde bestandssysteem handling met graceful-fs

### Architectuur Wijzigingen

De applicatie gebruikt nu de volgende moderne packages:

- `node-fetch` voor HTTP requests (vervangt deprecated `request`)
- `graceful-fs` voor robuuste bestandssysteem operaties
- TypeScript type definities voor betere ontwikkelingservaring

### Veiligheidsoverwegingen

1. Alle kritieke kwetsbaarheden zijn opgelost:
   - protobufjs in Google Ads service
   - semver in SEO service
   - ReDoS kwetsbaarheden in hoofdproject
2. Resterende niet-kritieke waarschuwingen:
   - 2 lage severity kwetsbaarheden (niet-exploiteerbaar)
   - Worden gemonitord via npm audit

### Development Tools

- ESLint v8.56.0 voor code kwaliteit
- Prettier voor consistente code formatting
- Jest en Vitest voor testing
- TypeScript v5.3.3 voor type checking

### Installatie Instructies

1. Node.js >=20.0.0 en npm >=10.0.0 zijn vereist
2. Clone de repository
3. Installeer dependencies:
   ```bash
   npm install
   ```
4. Installeer service-specifieke dependencies:
   ```bash
   cd src/services/google-ads && npm install
   cd ../seo && npm install
   cd ../sitemap-generator && npm install
   ```

### Development Workflow

1. Start development server:
   ```bash
   npm run dev
   ```
2. Run tests:
   ```bash
   npm test
   ```
3. Check dependencies:
   ```bash
   npm run security:audit
   ```

### Deployment

De applicatie kan worden gedeployed met:

```bash
npm run build
npm start
```

### Monitoring

- Winston logging is geïmplementeerd
- Prometheus metrics via prom-client
- Error tracking via express middleware

# Updates in Setup (2025-01-04)

## Database Connectie Verbeteringen

- Geïmplementeerd retry mechanisme voor database connecties
- Verbeterde error handling en logging
- Gestandaardiseerde MongoDB configuratie
- Toegevoegde health checks voor MongoDB en Redis

## Docker Configuratie Updates

- Toegevoegde health checks voor Redis service
- Verbeterde dependency management tussen services
- Geoptimaliseerde container startup volgorde

## Code Structuur Verbeteringen

- Gemigreerd naar ES modules voor consistentie
- Gecentraliseerde database connectie logica
- Verbeterde graceful shutdown handling
- Gestandaardiseerde logging implementatie

## Nieuwe Health Check Endpoints

- `/health/mongodb` - MongoDB status en connectie test
- `/health/redis` - Redis status en connectie test

## Environment Variables

Minimaal benodigde environment variables:

```bash
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://root:example@mongodb:27017/seo-sea?authSource=admin

# Redis
REDIS_URI=redis://redis:6379
```

## Docker Services Update

### MongoDB Service

```yaml
mongodb:
  image: mongo:6
  environment:
    - MONGO_INITDB_ROOT_USERNAME=root
    - MONGO_INITDB_ROOT_PASSWORD=example
  healthcheck:
    test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
    interval: 10s
    timeout: 10s
    retries: 5
    start_period: 40s
```

### Redis Service

```yaml
redis:
  image: redis:7
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
```

## Development Workflow

1. Start services met health checks:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

2. Controleer service status:

```bash
curl http://localhost/health
curl http://localhost/health/mongodb
curl http://localhost/health/redis
```
