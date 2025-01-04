#!/bin/bash

# Configuratie
BACKUP_DIR="/backups/mongodb"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Maak backup directory aan als deze niet bestaat
mkdir -p $BACKUP_DIR

# Voer de backup uit
docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump \
    --username $MONGO_ROOT_USER \
    --password $MONGO_ROOT_PASSWORD \
    --authenticationDatabase admin \
    --db $MONGO_DB \
    --archive > "$BACKUP_DIR/backup_$TIMESTAMP.archive"

# Comprimeer de backup
gzip "$BACKUP_DIR/backup_$TIMESTAMP.archive"

# Verwijder oude backups (ouder dan RETENTION_DAYS)
find $BACKUP_DIR -name "backup_*.archive.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Database backup completed: backup_$TIMESTAMP.archive.gz"
