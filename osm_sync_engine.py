import requests
import time
import json
from datetime import datetime

# --- CONFIGURATION ---
# L'autre PC (Simulateur OSM)
OSM_SIMULATOR_URL = "http://172.22.6.133:5000/api/points"

# Votre PC Central (Backend local)
LOCAL_BACKEND_URL = "http://localhost:3001/api/points"
API_KEY = "geocommercial_2026_access_secure_key" 

# Fichier pour garder une trace de l'état connu
SYNC_LOG_FILE = "sync_inventory.json"

def get_local_inventory():
    """Charge la liste des IDs et dates déjà synchronisés."""
    try:
        with open(SYNC_LOG_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_local_inventory(inventory):
    with open(SYNC_LOG_FILE, "w") as f:
        json.dump(inventory, f, indent=4)

def sync_process():
    print(f"\n--- 🔄 Synchronisation démarrée à {datetime.now().strftime('%H:%M:%S')} ---")
    
    local_inventory = get_local_inventory()
    headers = {
        "X-API-KEY": API_KEY, 
        "Content-Type": "application/json"
    }

    try:
        # 1. Récupérer les points du "Simulateur OSM" sur l'autre PC
        print(f"📡 Interrogation du simulateur à {OSM_SIMULATOR_URL}...")
        response = requests.get(OSM_SIMULATOR_URL, timeout=30)
        response.raise_for_status()
        remote_points = response.json()
        
        remote_ids = set()
        
        for pt in remote_points:
            pt_id = str(pt.get('id'))
            remote_ids.add(pt_id)
            
            # --- LOGIQUE DE DÉTECTION ---
            
            # CAS 1 : NOUVEAU POINT
            if pt_id not in local_inventory:
                # --- VÉRIFICATION D'EXISTENCE POUR ÉVITER LES DOUBLONS ---
                # On utilise 'params' dans requests pour encoder correctement les caractères (Arabe, espaces, etc.)
                search_params = {
                    "search": pt.get('nom'),
                    "zone": pt.get('zone')
                }
                existing_res = requests.get(LOCAL_BACKEND_URL, params=search_params, headers=headers)
                
                already_exists = False
                if existing_res.status_code == 200:
                    search_data = existing_res.json()
                    if search_data.get('total', 0) > 0:
                        # On a trouvé un point identique, on l'ajoute à l'inventaire pour ne plus le vérifier
                        print(f"⏩ DÉJÀ PRÉSENT : {pt.get('nom')} ({pt_id}) est déjà dans votre base. Ignoré.")
                        local_inventory[pt_id] = pt.get('date_modification')
                        already_exists = True

                if not already_exists:
                    print(f"✨ NOUVEAU : {pt.get('nom')} ({pt_id}) détecté.")
                    # Préparation des données pour notre backend
                    payload = {
                        "external_id": pt_id, # On stocke l'ID d'origine
                        "nom": pt.get('nom'),
                        "category": pt.get('category') or pt.get('categorie'), # Gère les deux orthographes
                        "zone": pt.get('zone'),
                        "latitude": pt.get('latitude'),
                        "longitude": pt.get('longitude'),
                        "statut": "actif",
                        "source": "OSM_AUTOMATION"
                    }
                    
                    res = requests.post(LOCAL_BACKEND_URL, json=payload, headers=headers)
                    if res.status_code in [200, 201]:
                        local_inventory[pt_id] = pt.get('date_modification')
                        print(f"   ✅ Ajouté avec succès dans votre base centrale.")
                    else:
                        print(f"   ❌ Erreur lors de l'ajout : {res.status_code} - {res.text}")
            
            # CAS 2 : MODIFICATION
            elif pt.get('date_modification') > local_inventory.get(pt_id, ""):
                print(f"✏️  MODIF : {pt.get('nom')} ({pt_id}) a changé.")
                payload = {
                    "nom": pt.get('nom'),
                    "latitude": pt.get('latitude'),
                    "longitude": pt.get('longitude'),
                    "date_modification": pt.get('date_modification')
                }
                # On met à jour via l'API (on suppose que l'ID est le même ou on cherche par external_id)
                res = requests.patch(f"{LOCAL_BACKEND_URL}/{pt_id}", json=payload, headers=headers)
                if res.status_code == 200:
                    local_inventory[pt_id] = pt.get('date_modification')
                    print(f"   ✅ Mise à jour enregistrée.")

        # CAS 3 : DISPARITION (Désactivation)
        for local_id in list(local_inventory.keys()):
            if local_id not in remote_ids:
                print(f"❌ DISPARITION : L'élément {local_id} n'existe plus sur le simulateur.")
                payload = {"statut": "inactif", "source": "OSM_REMOVED"}
                # On informe notre base centrale qu'il est inactif
                res = requests.patch(f"{LOCAL_BACKEND_URL}/{local_id}", json=payload, headers=headers)
                if res.status_code == 200:
                    print(f"   ⚠️ Marqué comme INACTIF en local.")
                    # On le retire de la veille pour ne pas le retraiter sans arrêt
                    del local_inventory[local_id]

        save_local_inventory(local_inventory)
        print("--- ✅ Synchronisation terminée ---")

    except requests.exceptions.ConnectionError:
        print(f"❌ Impossible de joindre l'autre PC à {OSM_SIMULATOR_URL}.")
        print("   Vérifiez que le serveur Flask tourne et que le pare-feu laisse passer le port 5000.")
    except Exception as e:
        print(f"❌ Une erreur est survenue : {e}")

if __name__ == "__main__":
    print("====================================================")
    print("🚀 GEOCOMMERCIAL OSM SYNC ENGINE - MODE AUTOMATIQUE")
    print("====================================================")
    
    try:
        while True:
            sync_process()
            print("\n⏳ Prochaine vérification dans 30 secondes...")
            time.sleep(30)
    except KeyboardInterrupt:
        print("\n🛑 Arrêt du moteur de synchronisation.")
