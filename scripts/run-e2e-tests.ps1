# Stop en verwijder bestaande containers
Write-Host "🧹 Opruimen oude containers..."
docker-compose -f docker-compose.cypress.yml down -v

# Build de images opnieuw
Write-Host "🏗️ Bouwen van Docker images..."
docker-compose -f docker-compose.cypress.yml build

# Start de services en voer de tests uit
Write-Host "🚀 Starten van services en uitvoeren tests..."
docker-compose -f docker-compose.cypress.yml up --exit-code-from cypress

# Haal de exit code op
$exitCode = $LASTEXITCODE

# Stop de services
Write-Host "🛑 Stoppen van services..."
docker-compose -f docker-compose.cypress.yml down

# Toon resultaten
if ($exitCode -eq 0) {
    Write-Host "✅ Tests succesvol afgerond!"
} else {
    Write-Host "❌ Tests gefaald. Controleer de logs en screenshots in de cypress map."
}

# Exit met de juiste code
exit $exitCode
