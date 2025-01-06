# SEO & SEA Automation Setup

## Documentatie Structuur
- `setup.md`: Technische setup en architectuur documentatie
- `todo.md`: Openstaande taken en prioriteiten
- `suggestions.md`: Voorgestelde verbeteringen en features
- `changelog.md`: Historie van wijzigingen
- `removed.md`: Verwijderde functionaliteit

## Systeemarchitectuur

### Frontend (React + Vite)
- Draait op poort 3000
- Toegankelijk via https://app.seo-sea.local
- Gebruikt Vite voor snelle development
- Communiceert met API via HTTPS

### Dashboard (React + Vite)
- Beheeromgeving op poort 3000
- Toegankelijk via https://dashboard.seo-sea.local
- Real-time monitoring en beheer
- Beveiligde communicatie met API

### API (Node.js)
- RESTful API op poort 3000
- Toegankelijk via https://api.seo-sea.local
- Geïmplementeerde features:
  - Authentication & Authorization
  - Rate limiting
  - Health checks
  - Logging en monitoring
  - Graceful shutdown

### Databases
#### MongoDB
- Primaire database (versie 6)
- Persistente opslag via volume
- Beveiligde toegang met credentials
- Connection pooling en indexing

#### Redis
- Cache en session storage
- Alpine-based image voor kleine footprint
- Persistente data via volume
- Optimale performance configuratie

### Reverse Proxy (Traefik v2.10)
- SSL/TLS terminatie
- Automatic HTTPS
- Load balancing
- Health checking
- Access control

## Docker Configuratie
### Volumes en Persistentie
- Alle data wordt opgeslagen in persistente volumes
- Database volumes voor MongoDB en MySQL
- WordPress volumes voor core en content
- Redis volumes voor caching

### Docker Ignore
- Aangepaste .dockerignore configuratie
- Documentation map wordt nu meegenomen in builds
- Selectieve file filtering voor optimale builds

## Docker Build Configuratie
### Build Context
- Geoptimaliseerde .dockerignore configuratie
- Selectieve file inclusie voor betere performance
- Development vs Production context management
- Build caching strategie

### Development Builds
- Inclusie van documentatie en test bestanden
- Hot-reloading ondersteuning
- Debugging tools en configuratie
- Performance optimalisaties

### Production Builds
- Minimale image grootte
- Multi-stage build optimalisatie
- Security hardening
- Performance tuning

## WordPress Configuratie

De WordPress-omgeving is geconfigureerd met persistente volumes voor zowel de WordPress-bestanden als de database. Dit zorgt ervoor dat alle gegevens behouden blijven, zelfs als de containers worden verwijderd of opnieuw worden opgestart.

### Volumes
- `wordpress_data`: Bevat alle WordPress core bestanden
- `wordpress_db_data`: Bevat de MySQL database
- `./wp-content`: Gemount als volume voor themes, plugins en uploads

### Toegang
- WordPress interface: https://wordpress.seo-sea.local
- Database: Toegankelijk via `wordpress_db` container

### Omgevingsvariabelen
De volgende variabelen kunnen worden ingesteld in het `.env` bestand:
- `WP_DB_USER`: Database gebruikersnaam (standaard: wordpress)
- `WP_DB_PASSWORD`: Database wachtwoord (standaard: wordpress_password)
- `WP_DB_NAME`: Database naam (standaard: wordpress)
- `WP_DB_ROOT_PASSWORD`: Root wachtwoord voor MySQL (standaard: somewordpress)

### Netwerk
De WordPress containers zijn verbonden met het `seo_sea_network` netwerk en kunnen communiceren met andere services in de stack.

### Beveiliging
- SSL/TLS encryptie via Traefik
- Geen directe toegang tot de database van buitenaf
- Persistente volumes voor data beveiliging
- Automatische container herstart bij falen

## Development Setup

### Vereisten
- Docker Desktop
- Node.js 18+
- Git

### Lokale Ontwikkeling
1. Clone de repository
2. Kopieer `.env.example` naar `.env` en vul de waarden in
3. Start de development stack:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

### Productie Deployment
1. Zorg dat alle environment variabelen zijn geconfigureerd
2. Start de productie stack:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Monitoring & Logging

### Prometheus & Grafana
- Metrics verzameling
- Custom dashboards
- Alert configuratie
- Performance monitoring

### Logging
- Gestructureerde JSON logging
- Centralized log aggregation
- Error tracking
- Audit logging

## Backup & Recovery

### Database Backups
- Dagelijkse automatische backups
- Point-in-time recovery mogelijk
- Encrypted storage
- Retention policy

### Volume Backups
- Regelmatige volume snapshots
- Disaster recovery procedures
- Data integriteit checks

## Security

### SSL/TLS
- Automatic certificate management
- Strong cipher suites
- Perfect forward secrecy
- HSTS enabled

### Access Control
- Role-based access control (RBAC)
- API authentication
- Rate limiting
- IP whitelisting

### Data Protection
- Encrypted storage
- Secure communication
- Regular security audits
- Compliance monitoring
