import os
import sys
import subprocess
import ctypes
from pathlib import Path

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def run_command(command):
    """Voer een shell commando uit en return de output"""
    try:
        result = subprocess.run(command, shell=True, text=True, capture_output=True)
        if result.returncode != 0:
            print(f"Waarschuwing: Commando '{command}' faalde met fout: {result.stderr}")
        return result.stdout.strip()
    except Exception as e:
        print(f"Fout bij uitvoeren van commando '{command}': {str(e)}")
        return None

def check_docker_network():
    """Controleer en maak indien nodig het Docker netwerk aan"""
    print("\n1. Docker Netwerk Controle")
    network_exists = run_command('docker network ls | findstr "seo_sea_network"')
    
    if not network_exists:
        print("Docker netwerk 'seo_sea_network' bestaat niet. Dit wordt nu aangemaakt...")
        run_command('docker network create seo_sea_network')
        print("[OK] Docker netwerk 'seo_sea_network' aangemaakt")
    else:
        print("[OK] Docker netwerk 'seo_sea_network' bestaat al")

def setup_ssl_certs():
    """Maak de SSL certificaten map aan"""
    print("\n2. SSL Certificaten Controle")
    certs_path = Path("./traefik/certificates")
    
    if not certs_path.exists():
        print("SSL certificaten map bestaat niet. Deze wordt nu aangemaakt...")
        certs_path.mkdir(parents=True, exist_ok=True)
        print(f"[OK] SSL certificaten map aangemaakt: {certs_path}")
    else:
        print(f"[OK] SSL certificaten map bestaat al: {certs_path}")

def update_hosts_file(domains):
    """Update het hosts bestand met de opgegeven domeinen"""
    print("\n3. Hosts Bestand Configuratie")
    hosts_file = Path(os.environ['WINDIR']) / 'System32' / 'drivers' / 'etc' / 'hosts'
    backup_file = hosts_file.with_suffix('.hosts.backup')
    
    # Maak backup
    if not backup_file.exists():
        import shutil
        shutil.copy2(hosts_file, backup_file)
        print(f"[OK] Backup gemaakt van het hosts bestand: {backup_file}")
    else:
        print(f"[OK] Backup bestaat al: {backup_file}")
    
    # Lees huidige inhoud
    current_content = hosts_file.read_text().splitlines()
    
    # Update hosts bestand
    print("\nDomein Status:")
    with open(hosts_file, 'a') as f:
        for domain in domains:
            entry = f"127.0.0.1 {domain}"
            if entry not in current_content:
                f.write(f"\n{entry}")
                print(f"[+] Toegevoegd: {domain}")
            else:
                print(f"[-] Bestaat al: {domain}")

def flush_dns():
    """Leeg de DNS cache"""
    print("\n4. DNS Cache Vernieuwing")
    run_command('ipconfig /flushdns')
    print("[OK] DNS cache is geleegd")

def show_docker_status():
    """Toon Docker container status"""
    print("\n5. Docker Container Status")
    status = run_command('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
    if status:
        print(status)

def main():
    # Check voor administrator rechten
    if not is_admin():
        print("Dit script heeft administrator rechten nodig!")
        print("Start het script opnieuw als administrator.")
        sys.exit(1)

    # Configuratie
    domains = [
        "app.seo-sea.local",
        "api.seo-sea.local",
        "dashboard.seo-sea.local",
        "traefik.seo-sea.local",
        "wordpress.seo-sea.local",
        "prometheus.seo-sea.local",
        "grafana.seo-sea.local"
    ]

    print("=== SEO & SEA Automation Setup Script ===")

    # Voer alle stappen uit
    check_docker_network()
    setup_ssl_certs()
    update_hosts_file(domains)
    flush_dns()
    show_docker_status()

    # Toon beschikbare URLs
    print("\n=== Beschikbare URLs ===")
    for domain in domains:
        print(f"https://{domain}")

    print("\n=== Setup Voltooid ===")
    input("Druk op Enter om het venster te sluiten...")

if __name__ == "__main__":
    main()
