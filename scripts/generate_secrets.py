import secrets
import string
import base64
import os
import sys

def generate_strong_password(length=32):
    """Genereer een sterk wachtwoord met minimaal één van elk type karakter."""
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special = "!@#$%^&*"
    
    # Zorg ervoor dat er minimaal één van elk type karakter is
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
        secrets.choice(special)
    ]
    
    # Vul aan tot de gewenste lengte
    remaining_length = length - len(password)
    all_chars = lowercase + uppercase + digits + special
    password.extend(secrets.choice(all_chars) for _ in range(remaining_length))
    
    # Shuffle de karakters
    shuffled = list(password)
    secrets.SystemRandom().shuffle(shuffled)
    return ''.join(shuffled)

def generate_jwt_secret(length=64):
    """Genereer een JWT secret."""
    return base64.b64encode(secrets.token_bytes(length)).decode('utf-8')

def generate_env_file():
    """Genereer het .env.prod bestand met veilige wachtwoorden."""
    try:
        # Bepaal het pad naar de root directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(current_dir)
        
        # Maak een dictionary met alle secrets
        secrets_dict = {
            'MONGO_ROOT_USER': 'admin',
            'MONGO_ROOT_PASSWORD': generate_strong_password(32),
            'MONGO_USER': 'app',
            'MONGO_PASSWORD': generate_strong_password(32),
            'MONGO_DB': 'seo_sea_db',
            'REDIS_PASSWORD': generate_strong_password(32),
            'JWT_SECRET': generate_jwt_secret(),
            'CSRF_SECRET': generate_jwt_secret(),
            'MYSQL_ROOT_PASSWORD': generate_strong_password(32),
            'MYSQL_PASSWORD': generate_strong_password(32),
            'WORDPRESS_DB_PASSWORD': generate_strong_password(32),
            'WORDPRESS_PASSWORD': generate_strong_password(32),
            'SSL_EMAIL': 'admin@yourdomain.com',  # Vervang met echte email
            'DOMAIN': 'yourdomain.com',  # Vervang met echte domain
            'WP_DOMAIN': 'wp.yourdomain.com',  # Vervang met echte WP domain
            'TRAEFIK_AUTH': base64.b64encode(f"admin:{generate_strong_password(16)}".encode()).decode()
        }
        
        # Basis productie configuratie
        env_contents = """# Productie Configuratie

# Node.js Environment
NODE_ENV=production
PORT=3000

# Domain Configuration
DOMAIN={DOMAIN}
SSL_EMAIL={SSL_EMAIL}

# MongoDB Configuration
MONGO_ROOT_USER={MONGO_ROOT_USER}
MONGO_ROOT_PASSWORD={MONGO_ROOT_PASSWORD}
MONGO_USER={MONGO_USER}
MONGO_PASSWORD={MONGO_PASSWORD}
MONGO_DB={MONGO_DB}
MONGO_URI=mongodb://{MONGO_USER}:{MONGO_PASSWORD}@mongodb:27017/{MONGO_DB}

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD={REDIS_PASSWORD}

# JWT & CSRF Authentication
JWT_SECRET={JWT_SECRET}
CSRF_SECRET={CSRF_SECRET}

# WordPress Configuration
WP_DOMAIN={WP_DOMAIN}
WORDPRESS_DB_HOST=mysql
WORDPRESS_DB_USER=wordpress
WORDPRESS_DB_PASSWORD={WORDPRESS_DB_PASSWORD}
WORDPRESS_DB_NAME=wordpress
WORDPRESS_PASSWORD={WORDPRESS_PASSWORD}

# MySQL Configuration
MYSQL_ROOT_PASSWORD={MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=wordpress
MYSQL_USER=wordpress
MYSQL_PASSWORD={MYSQL_PASSWORD}

# Traefik Configuration
TRAEFIK_AUTH={TRAEFIK_AUTH}
"""
        
        # Vervang placeholders met echte secrets
        env_contents = env_contents.format(**secrets_dict)
        
        # Schrijf naar .env.prod
        env_prod_path = os.path.join(root_dir, '.env.prod')
        with open(env_prod_path, 'w', encoding='utf-8') as f:
            f.write(env_contents)
            
        print(" .env.prod bestand succesvol gegenereerd met veilige secrets!")
        print("\nGegenereerde wachtwoorden (bewaar deze goed!):")
        for key, value in secrets_dict.items():
            if any(x in key.lower() for x in ['password', 'secret', 'auth']):
                print(f"{key}: {value}")
        
    except Exception as e:
        print(f"[ERROR] Er is een fout opgetreden: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    generate_env_file()
