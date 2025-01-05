# Changelog

## [1.0.0] - 2024-03-XX

### Toegevoegd

- Verbeterde error handling met custom AppError klasse
- Gestructureerde test setup met Jest
- WooCommerce integratie service
- Licentie validatie service

### Gewijzigd

- Gerefactorde project structuur
- Verbeterde environment variabelen configuratie
- Geoptimaliseerde database queries

### Verwijderd

- Verouderde test implementaties
- Ongebruikte dependencies

## [Unreleased]

### Added

- License server basis infrastructuur

  - Docker container setup met Node.js en PostgreSQL
  - Database schema voor licenties en gebruik
  - Basis Express.js server setup
  - Health check endpoints
  - Logging systeem
  - Rate limiting
  - Security headers met Helmet

- License API Endpoints implementatie
  - POST /api/v1/licenses/verify voor licentie verificatie
  - GET /api/v1/licenses/status/:key voor status checks
  - POST /api/v1/licenses/activate voor nieuwe licenties
  - PUT /api/v1/licenses/deactivate voor deactivatie
  - POST /api/v1/licenses/upgrade voor upgrades
  - JWT authenticatie voor beveiligde endpoints
  - Database transacties voor data integriteit
  - Rate limiting per licentie
  - Automatische trial licentie setup
  - Upgrade pad van trial naar paid versies

### Security

- JWT token implementatie voor API authenticatie
- Rate limiting per endpoint en per licentie
- Database transacties voor ACID compliance
- Input validatie op alle endpoints
- Encrypted storage voor gevoelige data
- Health check monitoring

### Documentatie

- Documentatie voor licentie systeem
  - Technische specificaties
  - API endpoints
  - Database schema
  - Deployment instructies
