# Functie om domeinen toe te voegen
function Add-HostsDomains {
    param (
        [string[]]$Domains,
        [string]$HostsFile
    )
    
    $hostsContent = Get-Content $HostsFile
    foreach ($domain in $Domains) {
        $entry = "127.0.0.1 $domain"
        if (-not ($hostsContent -contains $entry)) {
            Add-Content -Path $HostsFile -Value $entry
            Write-Host "✓ Toegevoegd: $domain" -ForegroundColor Yellow
        } else {
            Write-Host "• Bestaat al: $domain" -ForegroundColor Gray
        }
    }
}

# Administrator rechten check
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Je hebt administrator rechten nodig om het hosts bestand aan te passen!"
    Write-Warning "Het script wordt opnieuw gestart met administrator rechten..."
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

# Configuratie
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$backupFile = "$hostsFile.backup"
$certsPath = "./traefik/certificates"
$domains = @(
    "app.seo-sea.local",
    "api.seo-sea.local",
    "dashboard.seo-sea.local",
    "traefik.seo-sea.local",
    "wordpress.seo-sea.local",
    "prometheus.seo-sea.local",
    "grafana.seo-sea.local"
)

# Start script
Write-Host "`n=== SEO & SEA Automation Setup Script ===`n" -ForegroundColor Cyan

# 1. Docker netwerk check
Write-Host "1. Docker Netwerk Controle" -ForegroundColor Green
$networkExists = docker network ls | Select-String "seo_sea_network"
if (-not $networkExists) {
    Write-Warning "Docker netwerk 'seo_sea_network' bestaat niet. Dit wordt nu aangemaakt..."
    docker network create seo_sea_network
    Write-Host "✓ Docker netwerk 'seo_sea_network' aangemaakt" -ForegroundColor Green
} else {
    Write-Host "✓ Docker netwerk 'seo_sea_network' bestaat al" -ForegroundColor Green
}

# 2. SSL certificaten check
Write-Host "`n2. SSL Certificaten Controle" -ForegroundColor Green
if (-not (Test-Path $certsPath)) {
    Write-Warning "SSL certificaten map bestaat niet. Deze wordt nu aangemaakt..."
    New-Item -ItemType Directory -Path $certsPath -Force | Out-Null
    Write-Host "✓ SSL certificaten map aangemaakt: $certsPath" -ForegroundColor Green
} else {
    Write-Host "✓ SSL certificaten map bestaat al: $certsPath" -ForegroundColor Green
}

# 3. Hosts bestand backup
Write-Host "`n3. Hosts Bestand Backup" -ForegroundColor Green
if (-not (Test-Path $backupFile)) {
    Copy-Item $hostsFile $backupFile
    Write-Host "✓ Backup gemaakt van het hosts bestand: $backupFile" -ForegroundColor Green
} else {
    Write-Host "✓ Backup bestaat al: $backupFile" -ForegroundColor Green
}

# 4. Domeinen toevoegen
Write-Host "`n4. Domeinen Configuratie" -ForegroundColor Green
Add-HostsDomains -Domains $domains -HostsFile $hostsFile

# 5. DNS cache verversen
Write-Host "`n5. DNS Cache Vernieuwing" -ForegroundColor Green
ipconfig /flushdns
Write-Host "✓ DNS cache is geleegd" -ForegroundColor Green

# 6. Docker status
Write-Host "`n6. Docker Container Status" -ForegroundColor Green
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Beschikbare URLs tonen
Write-Host "`n=== Beschikbare URLs ===" -ForegroundColor Cyan
Write-Host "Frontend:   https://app.seo-sea.local" -ForegroundColor Yellow
Write-Host "Dashboard:  https://dashboard.seo-sea.local" -ForegroundColor Yellow
Write-Host "API:       https://api.seo-sea.local" -ForegroundColor Yellow
Write-Host "Traefik:   https://traefik.seo-sea.local" -ForegroundColor Yellow
Write-Host "WordPress: https://wordpress.seo-sea.local" -ForegroundColor Yellow
Write-Host "Metrics:   https://prometheus.seo-sea.local" -ForegroundColor Yellow
Write-Host "Grafana:   https://grafana.seo-sea.local" -ForegroundColor Yellow

Write-Host "`n=== Setup Voltooid ===" -ForegroundColor Cyan
Write-Host "Druk op een toets om het venster te sluiten..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
