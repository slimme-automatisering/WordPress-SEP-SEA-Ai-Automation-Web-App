# Controleer of het script wordt uitgevoerd met administrator rechten
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Warning "Je hebt administrator rechten nodig om het hosts bestand aan te passen!"
    Write-Warning "Het script wordt opnieuw gestart met administrator rechten..."
    
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

# Pad naar het hosts bestand
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"

# Lijst met lokale domeinen die we willen toevoegen
$localDomains = @(
    "app.localhost",
    "api.localhost",
    "traefik.localhost",
    "wordpress.localhost"
)

# Backup maken van het originele hosts bestand
$backupFile = "$hostsFile.backup"
if (-not (Test-Path $backupFile)) {
    Copy-Item $hostsFile $backupFile
    Write-Host "Backup gemaakt van het hosts bestand: $backupFile"
}

# Huidige inhoud van het hosts bestand inlezen
$hostsContent = Get-Content $hostsFile

# Voor elk domein controleren of het al bestaat en zo niet toevoegen
foreach ($domain in $localDomains) {
    $domainEntry = "127.0.0.1 $domain"
    if ($hostsContent -notcontains $domainEntry) {
        Add-Content -Path $hostsFile -Value $domainEntry
        Write-Host "Toegevoegd: $domainEntry"
    } else {
        Write-Host "Al aanwezig: $domainEntry"
    }
}

Write-Host "`nHosts bestand is bijgewerkt met de lokale domeinen."
Write-Host "Je kunt nu de volgende URLs gebruiken:"
Write-Host "- http://app.localhost (Frontend applicatie)"
Write-Host "- http://api.localhost (API endpoints)"
Write-Host "- http://traefik.localhost (Traefik dashboard)"
Write-Host "- http://wordpress.localhost (WordPress installatie)"

# DNS cache legen om de wijzigingen direct door te voeren
ipconfig /flushdns
Write-Host "`nDNS cache is geleegd."

Write-Host "`nDruk op een toets om het venster te sluiten..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
