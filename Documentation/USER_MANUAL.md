# SEO & SEA Automation Web App - User Manual / Gebruikershandleiding

![SEO & SEA Automation Web App](../public/images/logo.png)

## Table of Contents / Inhoudsopgave
1. [Introduction / Introductie](#introduction--introductie)
2. [Installation / Installatie](#installation--installatie)
3. [Getting Started / Aan de slag](#getting-started--aan-de-slag)
4. [Features / Functionaliteiten](#features--functionaliteiten)
5. [Dashboard](#dashboard)
6. [Content Optimization / Content Optimalisatie](#content-optimization--content-optimalisatie)
7. [Competitor Analysis / Concurrent Analyse](#competitor-analysis--concurrent-analyse)
8. [Settings / Instellingen](#settings--instellingen)
9. [Monitoring & Logs](#monitoring--logs)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [Docker Installation / Docker Installatie](#docker-installation--docker-installatie)
13. [SSL/HTTPS Configuration / SSL/HTTPS Configuratie](#sslhttps-configuration--sslhttps-configuratie)
14. [License Management / Licentie Beheer](#license-management--licentie-beheer)
15. [Licentie Server Setup](#licentie-server-setup)

## Introduction / Introductie

The SEO & SEA Automation Web App is a powerful enterprise tool for managing and optimizing your online marketing campaigns. This manual will guide you through all features and explain how to use them effectively.

De SEO & SEA Automation Web App is een krachtige enterprise tool voor het beheren en optimaliseren van uw online marketing campagnes. Deze handleiding zal u door alle features leiden en uitleggen hoe u ze effectief kunt gebruiken.

### Key Benefits / Belangrijkste Voordelen
- Automated SEO optimization / Geautomatiseerde SEO optimalisatie
- Real-time competitor analysis / Real-time concurrent analyse
- Smart content improvements / Slimme content verbeteringen
- Comprehensive monitoring / Uitgebreide monitoring
- WooCommerce integration / WooCommerce integratie
- Enterprise-grade security / Enterprise-grade beveiliging
- Multi-user support / Multi-user ondersteuning
- Role-based access control / Rol-gebaseerde toegangscontrole

## Installation / Installatie

### System Requirements / Systeem Vereisten
- Node.js v14 or higher / Node.js v14 of hoger
- WordPress website with REST API enabled / WordPress website met REST API enabled
- WooCommerce (for product optimization) / WooCommerce (voor product optimalisatie)
- Modern web browser (Chrome, Firefox, Safari, Edge) / Moderne webbrowser
- Stable internet connection / Stabiele internetverbinding
- Google Ads account with API access / Google Ads account met API toegang
- Valid license key / Geldige licentiesleutel

### Installation Steps / Installatie Stappen

1. **Request Access / Toegang Aanvragen**
   Contact our sales team for repository access and license key / 
   Neem contact op met ons sales team voor repository toegang en licentiesleutel

2. **Clone the Private Repository / Clone de Private Repository**
   ```bash
   git clone https://[private-repository-url]
   cd seo-sea-automation-webapp
   ```

3. **Install Dependencies / Installeer Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment / Configureer Environment**
   Create a `.env` file in the root directory / Maak een `.env` bestand in de root directory:
   ```env
   WORDPRESS_URL=https://your-site.com
   WORDPRESS_USERNAME=your-username
   WORDPRESS_PASSWORD=your-password
   OPENAI_API_KEY=your-openai-key
   LICENSE_KEY=your-license-key
   PORT=3000
   ```

5. **Start the Application / Start de Applicatie**
   ```bash
   npm start
   ```

6. **Open the Dashboard / Open het Dashboard**
   Open your browser and go to / Open uw browser en ga naar `http://localhost:3000`

## Getting Started / Aan de slag

### Initial Setup / Eerste Setup

1. **WordPress Configuration / WordPress Configuratie**
   - Ga naar Instellingen
   - Voer uw WordPress site URL in
   - Voer authenticatie gegevens in
   - Test de verbinding

2. **Google Ads Configuration / Google Ads Configuratie**
   - Configureer uw Google Ads API toegang
   - Verbind uw account
   - Verifieer de connectie

3. **Optimization Settings / Optimalisatie Instellingen**
   - Stel content lengte eisen in
   - Configureer keyword density ranges
   - Definieer leesbaarheid doelen
   - Stel interne linking regels in

4. **Scheduling Configuration / Planning Configuratie**
   - Stel dagelijkse optimalisatie tijd in
   - Kies wekelijkse analyse dag
   - Configureer gelijktijdige taak limieten

## Features / Functionaliteiten

### Automated SEO Optimization / Geautomatiseerde SEO Optimalisatie
- Dagelijkse content analyse en optimalisatie
- Keyword density optimalisatie
- Meta description verbeteringen
- Content structuur verbetering
- Interne linking optimalisatie

### Competitor Analysis / Concurrent Analyse
- Real-time concurrent tracking
- Content vergelijking
- Keyword gap analyse
- Performance benchmarking

### Content Management / Content Management
- Post optimalisatie
- Pagina optimalisatie
- Product optimalisatie (WooCommerce)
- Bulk optimalisatie tools

## Dashboard

### Dashboard Overview / Dashboard Overzicht
- Totaal aantal content items
- Aantal geoptimaliseerde items
- Gemiddelde SEO score
- Volgende geplande optimalisatie

### Performance Charts / Performance Grafieken
- SEO score trends
- Content distributie
- Optimalisatie succesratio
- Concurrent rankings

### Recent Activity / Recente Activiteit
- Laatste optimalisaties
- Succes/faal status
- Content wijzigingen
- Error rapportage

## Content Optimization / Content Optimalisatie

### Automated Optimization / Automatische Optimalisatie
Het systeem voert twee belangrijke optimalisatie cycli uit:

1. **Dagelijkse Optimalisatie (2:00)**
   - Content analyse
   - Meta description updates
   - Keyword optimalisatie
   - Leesbaarheid verbeteringen
   - Interne linking verbetering

2. **Wekelijkse Analyse (Zondag 3:00)**
   - Concurrent analyse
   - Trend identificatie
   - Content structuur updates
   - Performance optimalisatie

### Manual Optimization / Handmatige Optimalisatie

Om handmatig content te optimaliseren:

1. Ga naar "Optimalisatie Status"
2. Selecteer content type:
   - Posts
   - Pagina's
   - Producten
3. Kies specifieke items
4. Klik op "Nu Optimaliseren"
5. Monitor voortgang in real-time

## Competitor Analysis / Concurrent Analyse

### Features / Functionaliteiten
- Top 10 concurrent tracking
- Content structuur analyse
- Keyword gebruik vergelijking
- Content lengte benchmarking
- Leesbaarheid scoring

### Analysis Tools / Analyse Tools
1. **Concurrent Rankings**
   - Positie tracking
   - Historische data
   - Trend analyse

2. **Content Comparison**
   - Lengte analyse
   - Keyword dichtheid
   - Structuur vergelijking
   - Kwaliteit metrics

3. **Performance Metrics**
   - Laadsnelheid
   - Mobile optimalisatie
   - Technische SEO factoren

## Settings / Instellingen

### WordPress Configuration / WordPress Configuratie
- Site URL instellingen
- Authenticatie
- API endpoint configuratie
- Beveiligingsinstellingen

### Optimization Parameters / Optimalisatie Parameters
- Content lengte vereisten
- Keyword dichtheid ranges
- Leesbaarheid doelen
- Interne linking regels
- Image optimalisatie instellingen

### Scheduling Settings / Planning Instellingen
- Dagelijkse optimalisatie tijd
- Wekelijkse analyse dag
- Gelijktijdige taak limieten
- Rate limiting configuratie

## Monitoring & Logs

### Activity Monitoring / Activiteit Monitoring
- Real-time optimalisatie tracking
- Succes/faal ratio's
- Performance metrics
- Resource gebruik

### Log Management / Log Beheer
1. **Logs Bekijken**
   - Filter op niveau
   - Zoekfunctionaliteit
   - Datum bereik selectie
   - Export mogelijkheden

2. **Log Levels**
   - INFO: Algemene informatie
   - WARNING: Potentiële problemen
   - ERROR: Mislukte operaties
   - DEBUG: Gedetailleerde informatie

### Error Resolution / Error Resolution

1. **API Errors**
   ```
   Fout: Kan geen verbinding maken met WordPress API
   Oplossing: Controleer credentials en API endpoint
   ```

2. **Optimization Errors**
   ```
   Fout: Content optimalisatie mislukt
   Oplossing: Verifieer content rechten en API toegang
   ```

3. **Database Errors**
   ```
   Fout: Database verbinding mislukt
   Oplossing: Controleer database credentials en connectiviteit
   ```

## Troubleshooting

### Common Issues / Veelvoorkomende Problemen

1. **Connection Problems**
   - Check WordPress credentials
   - Verify API endpoints
   - Confirm REST API status
   - Test network connectivity

2. **Optimization Failures**
   - Review API rate limits
   - Check content permissions
   - Verify user capabilities
   - Monitor server resources

3. **Performance Issues**
   - Adjust concurrent tasks
   - Optimize database queries
   - Check server resources
   - Monitor API response times

### Error Resolution / Error Resolution

1. **API Errors**
   ```
   Error: Unable to connect to WordPress API
   Solution: Check credentials and API endpoint
   ```

2. **Optimization Errors**
   ```
   Error: Content optimization failed
   Solution: Verify content permissions and API access
   ```

3. **Database Errors**
   ```
   Error: Database connection failed
   Solution: Check database credentials and connectivity
   ```

## Best Practices

### Content Optimization / Content Optimalisatie
1. **Content Length**
   - Minimum: 300 woorden
   - Optimaal: 1500+ woorden
   - Product beschrijvingen: 200+ woorden

2. **Keyword Usage**
   - Dichtheid: 0.5% - 2.5%
   - Natuurlijke plaatsing
   - Relevante variaties
   - LSI keywords

3. **Content Structure**
   - Duidelijke koppen (H1, H2, H3)
   - Korte paragrafen
   - Bullet points
   - Relevante afbeeldingen

### Monitoring
1. **Daily Checks**
   - Dashboard review
   - Optimalisatie status
   - Error logs
   - Performance metrics

2. **Weekly Analysis**
   - Concurrent vergelijking
   - Content performance
   - Keyword rankings
   - Technical SEO

3. **Monthly Review**
   - Overall performance
   - Strategie aanpassing
   - Instellingen optimalisatie
   - Resource allocatie

### Security
1. **Credentials**
   - Regelmatige wachtwoord updates
   - Veilige API key opslag
   - Beperkte toegang delen
   - Activiteit monitoring

2. **Backup**
   - Regelmatige configuratie backups
   - Content versie beheer
   - Log file archivering
   - Systeem status snapshots

## Docker Installation / Docker Installatie

### Prerequisites / Voorwaarden
- Docker Engine
- Docker Compose
- Git (voor repository clonen)

### Docker Setup

1. **Environment Configuration / Environment Configuratie**
   Maak een `.env` bestand in de root directory met de volgende configuratie:
   ```env
   # WordPress Configuratie
   WORDPRESS_URL=http://localhost:8080
   WORDPRESS_USERNAME=your_admin_username
   WORDPRESS_PASSWORD=your_admin_password
   WORDPRESS_DB_USER=wordpress
   WORDPRESS_DB_PASSWORD=wordpress_password
   WORDPRESS_DB_NAME=wordpress

   # MySQL Configuratie
   MYSQL_ROOT_PASSWORD=somewordpress
   MYSQL_DATABASE=wordpress
   MYSQL_USER=wordpress
   MYSQL_PASSWORD=wordpress_password

   # App Configuratie
   PORT=3000
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key
   LICENSE_KEY=your_license_key
   ```

2. **Start the Application / Start de Applicatie**
   ```bash
   # Build en start alle containers
   docker-compose up --build

   # Draai in detached mode (achtergrond)
   docker-compose up -d --build
   ```

3. **Access Points / Toegangspunten**
   - SEO Applicatie Dashboard: `http://localhost:3000`
   - WordPress Admin Panel: `http://localhost:8080/wp-admin`
   - Database: `localhost:3306` (toegankelijk via container netwerk)

### WordPress Initial Setup / WordPress Initiële Setup

1. **WordPress Installation Completion / WordPress Installatie Voltooien**
   - Bezoek `http://localhost:8080`
   - Volg de installatie wizard
   - Gebruik credentials uit `.env` bestand

2. **Plugin Setup / Plugin Setup**
   - Installeer WooCommerce (indien product optimalisatie nodig)
   - Zorg dat REST API is ingeschakeld
   - Configureer benodigde permalinks

### Docker Commands Reference / Docker Commando's Referentie

1. **Container Management / Container Management**
   ```bash
   # Start containers
   docker-compose up

   # Stop containers
   docker-compose down

   # Stop en verwijder volumes
   docker-compose down -v

   # Rebuild containers
   docker-compose up --build

   # Bekijk container status
   docker-compose ps
   ```

2. **Logs and Monitoring / Logs en Monitoring**
   ```bash
   # Bekijk alle logs
   docker-compose logs -f

   # Bekijk specifieke service logs
   docker-compose logs -f app
   docker-compose logs -f wordpress
   docker-compose logs -f db
   ```

3. **Container Shell Access / Container Shell Toegang**
   ```bash
   # Toegang tot app container
   docker-compose exec app sh

   # Toegang tot WordPress container
   docker-compose exec wordpress bash

   # Toegang tot database container
   docker-compose exec db bash
   ```

### Docker Troubleshooting / Docker Troubleshooting

1. **Port Conflicts / Poort Conflicten**
   ```bash
   Error: port is already allocated
   Oplossing: Verander poorten in docker-compose.yml of stop conflicterende services
   ```

2. **Permission Issues / Permissie Issues**
   ```bash
   Error: permission denied
   Oplossing: Zorg voor juiste bestandsrechten of gebruik sudo (Linux/Mac)
   ```

3. **Container Communication / Container Communicatie**
   ```bash
   Error: could not resolve host
   Oplossing: Check container namen en netwerk configuratie
   ```

### Docker Best Practices / Docker Best Practices

1. **Volume Management / Volume Management**
   - Gebruik named volumes voor persistentie
   - Regelmatige backup van volumes
   - Opruimen ongebruikte volumes

2. **Security / Beveiliging**
   - Commit nooit het `.env` bestand
   - Gebruik sterke wachtwoorden
   - Regelmatige security updates

3. **Performance / Performance**
   - Monitor container resources
   - Optimaliseer build process
   - Gebruik passende container restart policies

## SSL/HTTPS Configuration / SSL/HTTPS Configuratie

### Development Environment / Development Environment

Voor lokale ontwikkeling gebruiken we mkcert voor veilige SSL certificaten:

1. **Installeer mkcert / Installeer mkcert**
   ```bash
   choco install mkcert
   ```

2. **Genereer lokale certificaten / Genereer lokale certificaten**
   ```bash
   mkdir -p traefik/certificates
   cd traefik/certificates
   mkcert "localhost" "*.localhost" "wordpress.localhost" "app.localhost"
   ```

3. **Configureer hosts bestand / Configureer hosts bestand**
   Open als administrator: `C:\Windows\System32\drivers\etc\hosts`
   Voeg toe:
   ```
   127.0.0.1 app.localhost
   127.0.0.1 wordpress.localhost
   ```

4. **Development URLs / Development URLs**
   - App: https://app.localhost
   - WordPress: https://wordpress.localhost

### Production Environment / Production Environment

Voor productie gebruiken we Let's Encrypt voor automatische SSL certificaten:

1. **DNS Configuratie / DNS Configuratie**
   - Configureer A-records voor je domeinen:
     ```
     app.jouwdomein.nl  -> Server IP
     www.jouwdomein.nl -> Server IP
     ```

2. **Environment Variables / Environment Variables**
   In je `.env` bestand:
   ```env
   DOMAIN=jouwdomein.nl
   SSL_EMAIL=jouw@email.nl
   ```

3. **Production Configuration / Productie Configuratie**
   ```bash
   # Kopieer productie configuratie
   cp docker-compose.prod.yml docker-compose.override.yml
   
   # Start de services
   docker-compose up -d
   ```

4. **SSL Verification / SSL Verificatie**
   - Certificaten worden automatisch aangevraagd en vernieuwd
   - Controleer status via Traefik dashboard
   - Certificaten worden opgeslagen in `traefik/acme.json`

### SSL Troubleshooting / SSL Troubleshooting

1. **Development SSL Issues / Development SSL Problemen**
   - Herstart Docker Desktop
   - Vernieuw mkcert certificaten:
     ```bash
     cd traefik/certificates
     mkcert -uninstall
     mkcert "localhost" "*.localhost" "wordpress.localhost" "app.localhost"
     ```

2. **Production SSL Issues / Productie SSL Problemen**
   - Controleer DNS instellingen
   - Controleer Traefik logs:
     ```bash
     docker-compose logs -f traefik
     ```
   - Verifieer poort 80/443 toegankelijkheid
   - Controleer acme.json rechten (600)

## License Management / Licentie Beheer

### License Activation / Licentie Activatie
1. Log in to the dashboard / Log in op het dashboard
2. Go to Settings > License / Ga naar Instellingen > Licentie
3. Enter your license key / Voer uw licentiesleutel in
4. Click Activate / Klik op Activeren

### License Types / Licentie Types
- **Basic / Basis**: Single domain, basic features / Enkele domain, basis features
- **Professional / Professioneel**: Multiple domains, advanced features / Meerdere domains, geavanceerde features
- **Enterprise / Enterprise**: Custom solutions, priority support / Maatwerk oplossingen, priority support

### Support / Ondersteuning
- Premium email support / Premium email ondersteuning
- Priority ticket handling / Priority ticket afhandeling
- Custom feature development / Custom feature development
- Training sessions / Training sessies

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

2. Installeer dependencies:
```bash
npm install
```

3. Maak een `.env` bestand aan met de volgende variabelen:
```env
NODE_ENV=development
DATABASE_URL=postgres://postgres:your_password@localhost:5432/license_db
JWT_SECRET=your_secret_key
LICENSE_SERVER_PORT=3001
```

4. Start de database met Docker:
```bash
docker run --name license-db -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=license_db -p 5432:5432 -d postgres:15-alpine
```

5. Start de server:
```bash
npm run dev
```

### API Endpoints

#### Licentie Verificatie
- **POST** `/api/v1/licenses/verify`
- Verifieert een licentie key
- Body: `{ "key": "your-license-key" }`

#### Licentie Status
- **GET** `/api/v1/licenses/status/:key`
- Haalt de status van een licentie op

#### Licentie Activatie
- **POST** `/api/v1/licenses/activate`
- Activeert een nieuwe licentie
- Body: 
```json
{
  "key": "new-license-key",
  "companyName": "Company Name",
  "domains": ["example.com"]
}
```

#### Licentie Deactivatie
- **PUT** `/api/v1/licenses/deactivate`
- Deactiveert een bestaande licentie
- Body: `{ "key": "your-license-key" }`

#### Licentie Upgrade
- **POST** `/api/v1/licenses/upgrade`
- Upgradet een licentie naar een hoger plan
- Body:
```json
{
  "key": "your-license-key",
  "newType": "professional"
}
```

### Beveiliging
- Alle endpoints zijn beveiligd met JWT authenticatie
- Rate limiting is ingeschakeld (100 requests per 15 minuten)
- Wachtwoorden worden gehasht met Argon2
- CORS is geconfigureerd voor veilige cross-origin requests
- Helmet middleware is ingeschakeld voor extra beveiliging

### Testen
1. Maak een `.env.test` bestand aan:
```env
NODE_ENV=test
DATABASE_URL=postgres://postgres:test@localhost:5432/license_test_db
JWT_SECRET=test_secret_key_123
LICENSE_SERVER_PORT=3001
```

2. Start de test database:
```bash
docker run --name license-test-db -e POSTGRES_PASSWORD=test -e POSTGRES_DB=license_test_db -p 5432:5432 -d postgres:15-alpine
```

3. Run de tests:
```bash
npm test
```

## Support

Voor technische ondersteuning:

1. Raadpleeg de troubleshooting guide
2. Bekijk error logs
3. Neem contact op:
   - E-mail: support@seoautomation.com
   - Telefoon: +31 (0)20 1234567
   - Live chat: Beschikbaar tijdens kantooruren

---

*Laatst bijgewerkt: 31 december 2024*

 2024 SEO & SEA Automation Web App. Alle rechten voorbehouden.
