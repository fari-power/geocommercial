import requests
import json
import time
import os

# --- 1. CONFIGURATION (A VÉRIFIER) ---

# URL publique ngrok de l'autre PC (pas besoin d'être sur le même réseau !)
REMOTE_URL = "https://cesar-nonapportionable-seelily.ngrok-free.dev/api/points"

# Votre backend local (Node.js) qui va recevoir les données
LOCAL_API = "http://127.0.0.1:3001/api/points"

# La clé de sécurité (doit être la même sur les deux PC)
API_KEY = "geocommercial_2026_access_secure_key"

# Fichier pour éviter les doublons (mémorise les points déjà téléchargés)
SYNC_DB = "synced_ids.txt"

# --- 2. LOGIQUE DE RÉCEPTION ---

if os.path.exists(SYNC_DB):
    with open(SYNC_DB, "r") as f:
        already_synced = set(f.read().splitlines())
else:
    already_synced = set()

def sync_data():
    print(f"[*] Analyse du PC distant ({REMOTE_URL})...")
    try:
        # On demande la liste des points à l'autre PC
        # Le header "ngrok-skip-browser-warning" est requis pour éviter la page d'avertissement ngrok
        headers = {
            "X-API-KEY": API_KEY,
            "ngrok-skip-browser-warning": "true"
        }
        res = requests.get(REMOTE_URL, headers=headers, timeout=10)
        
        if res.status_code == 200:
            points_distants = res.json()
            
            # On filtre pour ne garder que ceux qu'on n'a pas encore dans notre base
            a_importer = [p for p in points_distants if str(p.get('id', '')) not in already_synced]
            
            if not a_importer:
                print("    [~] Pas de nouveaux points détectés.")
                return

            print(f"\n[!] {len(a_importer)} NOUVELLES DONNÉES TROUVÉES ! Importation en cours...")
            
            for p in a_importer:
                p_id = str(p.get('id'))
                
                # Formatage pour votre backend local Node.js
                # On gère les deux écritures possibles : "categorie" ou "category"
                data_local = {
                    "nom": p.get("nom", "Sans nom"),
                    "categorie": p.get("categorie") or p.get("category") or "Autre",
                    "type": p.get("type", "Formel"),
                    "zone": p.get("zone", "Inconnue"),
                    "adresse": p.get("adresse", "Importé du réseau"),
                    "latitude": float(p.get("latitude", 0.0) or 0.0),
                    "longitude": float(p.get("longitude", 0.0) or 0.0),
                    "source": "PC_DISTANT"
                }

                # On ENVOIE les données dans NOTRE base locale (avec la clé de sécurité)
                post_headers = { "X-API-KEY": API_KEY }
                post_res = requests.post(LOCAL_API, json=data_local, headers=post_headers, timeout=5)
                
                if post_res.status_code == 201:
                    print(f"    [OK] Point synchronisé : '{data_local['nom']}'")
                    # On marque comme fait
                    already_synced.add(p_id)
                    with open(SYNC_DB, "a") as f:
                        f.write(f"{p_id}\n")
                elif post_res.status_code == 200:
                    # C'est un doublon détecté par le serveur
                    print(f"    [DOUBLON] Déjà présent : '{data_local['nom']}'")
                    # On marque aussi pour ne plus demander
                    already_synced.add(p_id)
                    with open(SYNC_DB, "a") as f:
                        f.write(f"{p_id}\n")
                else:
                    print(f"    [ERREUR] Impossible d'ajouter '{data_local['nom']}' : {post_res.text}")

        else:
            print(f"[ERREUR] L'autre PC refuse la connexion (Code {res.status_code})")

    except requests.exceptions.ConnectionError:
        print(f"[!] ERREUR : Impossible de joindre l'URL {REMOTE_URL}")
        print("    Vérifiez que votre collègue a bien laissé ngrok ouvert.")
    except Exception as e:
        print(f"[!] Erreur imprévue : {e}")

if __name__ == "__main__":
    print("====================================================")
    print("   RELAYEUR GEOCOMMERCIAL v3.0 - MODE RÉCEPTEUR (ngrok)")
    print(f"   Destination finale : Votre PC (127.0.0.1)")
    print("====================================================\n")
    
    while True:
        sync_data()
        time.sleep(10) # Vérifie toutes les 10 secondes
