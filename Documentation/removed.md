# Verwijderde en Aangepaste Items

Dit document houdt bij welke bestanden en mappen zijn verwijderd of aangepast tijdens de refactoring.
Laatste update: 01-01-2025

## Voltooide Acties ✅

### Test Directories
- ✅ `/src/tests` directory verwijderd
- ✅ Test bestanden geconsolideerd naar `/__tests__`
- ✅ Test setup gestandaardiseerd

### Log Bestanden
- ✅ Log bestanden verplaatst naar `/logs` directory
  - `combined.log`
  - `error.log`

### Configuratie Bestanden
- ✅ `compose-dev.yaml` verwijderd (functionaliteit in `docker-compose.dev.yml`)
- ✅ `newrelic.cjs` verwijderd (vervangen door `newrelic.js`)

## Nog Uit Te Voeren Acties ⏳

### Service Consolidatie
1. Analytics Services ⏳
   - `analyticsService.js`
   - `googleAnalyticsService.js`
   Status: Nog te consolideren

2. WordPress Services ⏳
   - `wordpressService.js`
   - `/src/services/wordpress/` directory
   Status: Directory review nodig

3. SEO Services ⏳
   - `seoService.js`
   - `seoAudit.js`
   - `/src/services/seo/` directory
   Status: Consolidatie nodig

### Directory Cleanup
1. Backup Services ⏳
   - `/src/services/backup/`
   - `/src/services/disaster-recovery/`
   Status: Nog te consolideren

2. Monitoring & Scaling ⏳
   - `/src/services/monitoring/`
   - `/src/services/scaling/`
   Status: Review en mogelijk consolidatie nodig

## Volume Status ✅

### Database Volumes
- ✅ `seosea_db`
- ✅ `seosea_redis`
- ✅ `seosea_mongodb`
- ✅ `postgres-data`

### CMS Volumes
- ✅ `seosea_wordpress`

### Service Data Volumes
- ✅ `seo_crawler_data` → `/data/seo-crawler`
- ✅ `keyword_research_data` → `/data/keyword-research`
- ✅ `backlink_data` → `/data/backlink-monitor`
- ✅ `sitemap_data` → `/data/sitemap-generator`

### Monitoring Volumes
- ✅ `prometheus_data`
- ✅ `grafana_data`
- ✅ `elasticsearch_data`

### Licentie Volume
- ✅ `license-data`

## Volgende Stappen

1. Service Consolidatie
   - Begin met analytics services
   - Daarna WordPress services
   - Ten slotte SEO services

2. Directory Cleanup
   - Consolideer backup en disaster recovery
   - Review monitoring en scaling directories

3. Code Updates
   - Update import statements
   - Update service referenties
   - Update configuratie bestanden
