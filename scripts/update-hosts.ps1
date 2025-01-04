# Als administrator rechten nodig zijn
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {  
    Write-Warning "Je hebt administrator rechten nodig om het hosts bestand aan te passen!"
    Write-Warning "Het script wordt opnieuw gestart met administrator rechten..."
    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# Controleer of de entries al bestaan
$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$entries = @(
    "127.0.0.1 app.localhost",
    "127.0.0.1 api.localhost",
    "127.0.0.1 dashboard.localhost",
    "127.0.0.1 traefik.localhost"
)

$currentContent = Get-Content $hostsFile
$entriesToAdd = @()

foreach ($entry in $entries) {
    if ($currentContent -notcontains $entry) {
        $entriesToAdd += $entry
    }
}

if ($entriesToAdd.Count -gt 0) {
    # Voeg de nieuwe entries toe aan het hosts bestand
    $entriesToAdd | Add-Content -Path $hostsFile
    Write-Host "De volgende entries zijn toegevoegd aan het hosts bestand:"
    $entriesToAdd | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "Alle entries bestaan al in het hosts bestand."
}

Write-Host "`nDe volgende URLs zijn nu beschikbaar:"
Write-Host "- http://app.localhost (Frontend applicatie)"
Write-Host "- http://dashboard.localhost (Dashboard)"
Write-Host "- http://api.localhost (API)"
Write-Host "- http://traefik.localhost (Traefik Dashboard)"

Write-Host "`nDruk op een toets om het venster te sluiten..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
