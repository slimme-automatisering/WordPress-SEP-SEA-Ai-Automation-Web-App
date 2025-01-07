# Changelog

## [Unreleased]

### Toegevoegd
- Systeem configuratie geïntegreerd in .env en .env.prod
- Uitgebreide .env.example met development en productie voorbeelden
- Nieuwe gestructureerde test directory met Jest integratie tests
- Nieuwe test scripts voor unit, integratie en load tests
- Load tests voor Redis performance
- Uitgebreide health check tests
- Volume directory validatie voor Docker volumes
- Service consolidatie plan voor duplicatie vermindering
- Verbeterde logging met log rotation en structured logging
- Uitgebreide error logging met stack traces en context
- Retry mechanisme voor gefaalde cron jobs
- Gedetailleerde cron job monitoring
- Centrale cron job scheduler met error handling
- API versioning met /v1 prefix
- Swagger documentatie voor alle endpoints
- Gestructureerde route modules per functionaliteit
- Health check endpoint met versie informatie
- API documentatie redirect endpoint
- 404 handler voor onbekende routes
- BaseController met herbruikbare functionaliteit
- Gestandaardiseerde response formatting
- Uitgebreide input validatie met Joi
- Verbeterde error handling in controllers
- Gedetailleerde API logging
- Paginering voor alle lijst endpoints
- Flexibele filter opties voor queries
- Metadata in API responses
- BaseService met herbruikbare functionaliteit
- Caching mechanisme met Redis
- Rate limiting voor API requests
- Batch processing voor grote datasets
- Gestandaardiseerde API validatie
- Export functionaliteit voor data (CSV, XLSX, PDF)
- Uitgebreide service logging
- Service health checks
- Service metrics tracking
- BaseMiddleware met herbruikbare functionaliteit
- JWT authenticatie middleware
- API key authenticatie
- CSRF bescherming
- Request validatie middleware
- Rate limiting middleware
- CORS configuratie
- Security headers
- Request logging middleware
- Error logging middleware
- Cache middleware met Redis
- Cache invalidatie
- Cache warmup
- Cache monitoring
- API structuur gestandaardiseerd volgens MVC patroon
  - Controllers voor SEO en SEA functionaliteit
  - Routes voor API endpoints met versioning (v1)
  - Services voor business logica
- Verbeterde error handling en logging
  - Centrale error handling middleware
  - Gestructureerde error responses
  - Morgan logging in 'combined' formaat
- Health check endpoint met versie informatie
- Express middleware configuratie
  - CORS met credentials support
  - Body parsing met express.json en urlencoded
  - Cookie parsing voor sessie management
- Unit tests voor controllers en routes
  - Jest test suite geïmplementeerd
  - Mocking van services
  - Test coverage rapportage
- Swagger API documentatie
  - OpenAPI 3.0.0 specificatie
  - Interactieve API explorer
  - Voorbeeldresponses en schema's
- Rate limiting
  - Gedifferentieerde limieten per endpoint
  - Rate limit headers
  - Monitoring en foutafhandeling
- E2E tests met Cypress
  - Test suite voor SEO endpoints
  - Test suite voor SEA endpoints
  - Tests voor rate limiting
  - Tests voor security headers
  - Tests voor CSRF bescherming
  - Tests voor API documentatie
- Cypress configuratie
  - JUnit reporter voor CI/CD integratie
  - Screenshot en logging configuratie
  - Retry mechanisme voor stabiele tests
  - Custom commands en tasks
- Docker-gebaseerde E2E test omgeving
  - Cypress Docker container configuratie
  - Docker Compose setup voor test omgeving
  - PowerShell script voor test uitvoering
  - Geautomatiseerde test rapportage
  - Volume mapping voor test resultaten
- Verbeterde dependency handling met npm ci en caching
- Nieuwe .npmrc configuratie voor consistente builds
- Uitgebreide logging met Winston daily rotate
- Redis integratie met IORedis client
- Docker multi-stage builds voor betere performance
- Security optimalisaties in Docker containers
- Volume mounting voor logs persistentie
- Health checks voor alle services
- Process management met dumb-init
- Memory optimalisaties voor Node.js
- Betere error handling en logging
- Uitgebreide security middleware stack
- WordPress container met persistente volumes configuratie
- WordPress database (MySQL 8.0) met persistent storage
- WordPress Traefik integratie met SSL/TLS
- WordPress backup en monitoring configuratie

### Gewijzigd

- Geconsolideerde .env bestanden voor betere configuratie beheer
- Verbeterde documentatie voor development en productie setups
- Verplaatste en verbeterde mail tests naar **tests**/integration
- Test setup geconsolideerd naar één locatie
- Geherstructureerde test directories voor betere organisatie
- Verbeterde test setup met database connecties
- Service structuur geoptimaliseerd voor betere onderhoudbaarheid
- Analytics services samengevoegd voor efficiëntie
- WordPress services geconsolideerd
- Logger implementatie geconsolideerd en verbeterd
- Error handler bijgewerkt voor betere logging
- Log bestanden verplaatst naar logs directory
- Cron jobs geconsolideerd in centrale scheduler
- SEO optimalisatie taken gestroomlijnd
- Route structuur gereorganiseerd met versioning
- API endpoints gegroepeerd per functionaliteit
- Route handlers verplaatst naar specifieke controllers
- Controllers gerefactored naar class-based structuur
- Input validatie verplaatst naar controllers
- Error handling gecentraliseerd
- Response formatting gestandaardiseerd
- Logging verbeterd in alle controllers
- Query parameters geoptimaliseerd
- Paginering toegevoegd aan lijst endpoints
- Filter logica verbeterd
- Services gerefactored naar class-based structuur
- Caching toegevoegd aan services
- Rate limiting geïmplementeerd
- Batch processing toegevoegd
- API validatie gecentraliseerd
- Export functionaliteit uitgebreid
- Service logging verbeterd
- Service monitoring toegevoegd
- Service error handling verbeterd
- Middleware gerefactored naar class-based structuur
- Authenticatie logica gecentraliseerd
- Validatie schema's georganiseerd
- Cache strategieën geoptimaliseerd
- Security configuratie verbeterd
- Request logging uitgebreid
- Error handling in middleware verbeterd
- Upgrade naar Node.js 20 en NPM 10
- Verbeterde Docker layer caching
- Geoptimaliseerde dependency installatie
- Betere security headers configuratie
- Verbeterde logging formattering
- Uitgebreide Docker health checks
- Non-root user in containers
- Betere volume permissions
- Geoptimaliseerde build process
- Verbeterde error handling

### Verwijderd

- Dubbele configuratie bestanden (compose-dev.yaml, newrelic.cjs)
- Overbodige .env bestanden (.env.system, .env.prod.example)
- Oude test directories en dubbele test setups
- Dubbele health check tests
- Oude mailtest.js
- Lege en ongebruikte service directories
- Dubbele analytics service implementaties
- Dubbele logger implementatie in errorHandler.js
- Dubbele cron job implementaties
- Oude SEO optimalisatie scheduler
- Oude route handlers uit index.js
- Ongebruikte route imports
- Dubbele error handling code
- Inconsistente response formatting
- Ongebruikte controller methods
- Oude validatie logica
- Dubbele service implementaties
- Ongebruikte service methods
- Oude caching mechanismen
- Verouderde rate limiting code
- Inconsistente batch processing
- Oude export functionaliteit
- Dubbele service logging
- Ongebruikte service metrics
- Dubbele middleware implementaties
- Oude authenticatie code
- Verouderde validatie schema's
- Ongebruikte cache configuraties
- Dubbele security headers
- Inconsistente logging middleware

### Geverifieerd

- Docker volume directories aanwezig en correct geconfigureerd
- Service dependencies en imports up-to-date
- Mapnaam 'seo-sea-automation' correct doorgevoerd
- Database volumes correct gemount
- Monitoring volumes aanwezig
- Logger configuratie geoptimaliseerd
- Error handling robuust en consistent
- Cron jobs correct geconfigureerd
- Job scheduling efficiënt en betrouwbaar
- API routes correct gemapt
- Swagger documentatie volledig
- Endpoint authenticatie correct
- Input validatie dekkend
- Error responses consistent
- Logging volledig geïmplementeerd
- Paginering correct werkend
- Filter functionaliteit getest
- Service caching effectief
- Rate limiting functioneel
- Batch processing efficiënt
- API validatie dekkend
- Export functionaliteit werkend
- Service logging compleet
- Service monitoring actief
- Service metrics beschikbaar
- Middleware authenticatie werkend
- CSRF bescherming actief
- Rate limiting effectief
- CORS correct geconfigureerd
- Security headers aanwezig
- Request logging volledig
- Cache strategieën functioneel
- Cache warmup actief
- Cache monitoring werkend

## [2025-01-06]
### Toegevoegd
- Docker build optimalisatie suggesties gedocumenteerd
- Nieuwe taken voor Docker performance verbetering
- Build process documentatie uitgebreid
- Image optimalisatie strategieën toegevoegd
- Docker configuratie aangepast voor betere documentatie integratie
- Documentation map toegevoegd aan Docker builds
- Documentatie structuur verbeterd en gestandaardiseerd
- Nieuwe documentatie secties voor Docker en volumes
- Node.js versie bijgewerkt naar 23-alpine in WordPress service
- Update-hosts.ps1 script geoptimaliseerd:
  - Domeinen aangepast naar .seo-sea.local
  - HTTPS ondersteuning toegevoegd
  - Docker netwerk controle toegevoegd
  - SSL certificaten controle toegevoegd
  - Container status controle toegevoegd

### Gewijzigd
- .dockerignore volledig geherstructureerd voor optimale builds:
  - Betere organisatie met duidelijke secties
  - Expliciete includes voor development bestanden
  - Specifieke regels voor node_modules en build artifacts
  - Verbeterde environment en IDE bestandshandling
  - Behoud van development essentials (tests/docs)
- Build context management verbeterd
- Documentation inclusie geoptimaliseerd

## [1.1.2] - 2025-01-02

### Toegevoegd

- Joi validatiebibliotheek voor veilige input validatie
- Verbeterde request validatie in controllers

### Beveiliging

- Input validatie toegevoegd voor alle API endpoints
- Schema-gebaseerde validatie geïmplementeerd

## [1.1.1] - 2025-01-02

### Toegevoegd

- Jsonwebtoken pakket voor veilige authenticatie
- Verbeterde JWT implementatie in auth middleware

### Beveiliging

- Geüpgrade authenticatie systeem met JWT tokens
- Verbeterde token validatie en verificatie

## [1.0.2] - 2025-01-03

### Changed

- Verouderde packages vervangen:
  - `natives` vervangen door `graceful-fs@4.2.11`
  - `request` vervangen door `node-fetch@3.3.2`
  - `npm-check` verwijderd (vervangen door npm audit)
  - `npmconf` verwijderd (geïntegreerd in npm)
- Dependencies geüpgraded:
  - nodemon geüpgraded naar 3.0.2 in SEO service
  - eslint geüpgraded naar 8.56.0
  - TypeScript ondersteuning toegevoegd met @types/node en @types/jest

### Security

- Alle kritieke kwetsbaarheden opgelost:
  - protobufjs kwetsbaarheid opgelost in Google Ads service
  - semver kwetsbaarheid opgelost in SEO service
  - ReDoS kwetsbaarheden opgelost in hoofdproject
- Resterende niet-kritieke waarschuwingen:
  - 2 lage severity kwetsbaarheden in hoofdproject (niet-exploiteerbaar)

## [1.0.1] - 2025-01-03

### Fixed

- Gecorrigeerde import paden in controllers:
  - `KeywordService` import in seoController.js nu correct verwijzend naar keywordResearch.js
  - `ContentService` import in seoController.js nu correct verwijzend naar contentOptimization.js
  - `GoogleAdsService` import in seaController.js nu correct verwijzend naar google-ads/googleAdsService.js
- Beveiligingsupdates:
  - google-gax geüpgraded naar 4.4.1 (protobufjs kwetsbaarheid)
  - puppeteer geüpgraded naar 23.11.1 (node-fetch en ws kwetsbaarheden)
  - nodemailer geüpgraded naar 6.9.16 (ReDoS kwetsbaarheid)
  - csurf geüpgraded naar 1.2.2 (cookie kwetsbaarheid)
  - npm-check geüpgraded naar 3.2.10 (got kwetsbaarheid)

### Added

- Nieuwe dependencies toegevoegd:
  - cheerio@1.0.0-rc.12 voor HTML parsing
  - nodemailer@6.9.16 voor email functionaliteit
  - google-auth-library@8.9.0 voor Google Ads authenticatie
  - google-gax@4.4.1 voor Google API's
  - protobufjs@7.2.5 voor protocol buffers

### Changed

- Versies van cheerio gestandaardiseerd naar 1.0.0-rc.12 in alle services voor betere compatibiliteit
- google-ads-api geüpgraded naar 12.0.1 voor verbeterde stabiliteit en Google Ads API v13 ondersteuning

## [1.0.1] - 2024-12-31

### Gewijzigd

- Projectstructuur verplaatst naar map zonder spaties voor betere compatibiliteit
- Bcrypt vervangen door Argon2 voor verbeterde wachtwoordbeveiliging en Windows-compatibiliteit
- Test setup verbeterd met betere database handling
- Database connectie problemen opgelost

### Technische Wijzigingen

- Docker setup opnieuw geconfigureerd voor nieuwe mapstructuur
- Test database configuratie verbeterd
- Dubbele database pool sluiting probleem opgelost
- Server startup logica aangepast voor test omgeving

### Beveiliging

- Upgrade naar Argon2 voor state-of-the-art wachtwoordhashing
- Verbeterde error handling in database connecties

### Documentatie

- Documentatie bijgewerkt voor nieuwe mapstructuur
- Test instructies bijgewerkt
