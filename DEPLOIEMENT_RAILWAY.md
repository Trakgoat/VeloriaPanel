# Panel Veloria - Déploiement Railway

## ✅ ÉTAPE 1 : Créer l'application Discord (5 min)

1. Va sur : https://discord.com/developers/applications
2. Clique **"New Application"**
3. Nom : `Panel Veloria`
4. Va dans **"OAuth2"** → **"General"** :
   - Copie le `CLIENT ID` quelque part
   - Copie le `CLIENT SECRET` quelque part
5. Va dans **"OAuth2"** → **"Redirects"** :
   - Ajoute : `https://ton-app.up.railway.app/auth/discord/callback`
   - (tu changeras l'URL après)

## ✅ ÉTAPE 2 : Déployer sur Railway (5 min)

### A. Créer un compte Railway
1. Va sur : https://railway.app
2. Clique **"Login"** → **"Login With GitHub"**
3. Autorise Railway

### B. Créer un nouveau projet
1. Clique **"New Project"**
2. Choisis **"Deploy from GitHub repo"**
3. Clique **"Configure GitHub App"**
4. Autorise Railway à accéder à tes repos

### C. Upload ton projet
**OPTION FACILE (sans GitHub) :**
1. Sur Railway, clique **"New Project"** → **"Empty Project"**
2. Clique **"+ New"** → **"GitHub Repo"**
3. Tu peux aussi utiliser la CLI Railway :
   ```powershell
   npm install -g @railway/cli
   cd panel-veloria
   railway login
   railway init
   railway up
   ```

**OU je te prépare un ZIP à upload directement ?**

### D. Ajouter MySQL
1. Dans ton projet Railway, clique **"+ New"**
2. Choisis **"Database"** → **"Add MySQL"**
3. Clique sur MySQL et copie les infos de connexion

### E. Configurer les variables d'environnement
1. Clique sur ton service web
2. Va dans **"Variables"**
3. Ajoute ces variables :

```
PORT=3000
NODE_ENV=production

DISCORD_CLIENT_ID=ton_client_id_discord
DISCORD_CLIENT_SECRET=ton_client_secret_discord
DISCORD_CALLBACK_URL=https://ton-app.up.railway.app/auth/discord/callback

SESSION_SECRET=genere_un_texte_aleatoire_long_ici_azerty123456789

DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=xxx
DB_NAME=railway
DB_PORT=xxxx

API_KEY=cle_secrete_pour_fivem_123456

ALLOWED_DISCORD_IDS=ton_discord_id
```

4. Railway te donne automatiquement `DB_HOST`, `DB_USER`, `DB_PASSWORD` depuis MySQL

### F. Importer la base de données
1. Clique sur MySQL dans Railway
2. Clique **"Connect"** 
3. Utilise MySQL Workbench ou phpMyAdmin
4. Importe le fichier `database.sql`

### G. Récupérer l'URL de ton panel
1. Dans Railway, clique sur ton service web
2. Va dans **"Settings"** → **"Domains"**
3. Clique **"Generate Domain"**
4. Tu auras une URL comme : `https://panel-veloria-production.up.railway.app`
5. **Copie cette URL**

### H. Mettre à jour Discord
1. Retourne sur Discord Developers
2. Dans OAuth2 → Redirects
3. Change l'URL par : `https://ton-url-railway.up.railway.app/auth/discord/callback`
4. Sauvegarde

## ✅ ÉTAPE 3 : Obtenir ton Discord ID

1. Ouvre Discord
2. Paramètres → Avancés → Active **"Mode développeur"**
3. Clic droit sur ton nom → **"Copier l'identifiant"**
4. Colle cet ID dans `ALLOWED_DISCORD_IDS` sur Railway

Pour ajouter plusieurs personnes : `123456789,987654321,555555555`

## ✅ ÉTAPE 4 : Configurer FiveM

1. Upload le dossier `veloria-logs` sur ton FTP dans `resources/`
2. Édite `veloria-logs/config.lua` :
   ```lua
   Config.PanelURL = "https://ton-url-railway.up.railway.app/api/logs"
   Config.APIKey = "cle_secrete_pour_fivem_123456"
   ```
   (Utilise la même API_KEY que dans Railway)

3. Dans ton `server.cfg` :
   ```
   ensure veloria-logs
   ```

4. Restart ton serveur FiveM

## ✅ ÉTAPE 5 : Tester

1. Va sur ton URL Railway (ex: https://panel-veloria-xxx.up.railway.app)
2. Clique "Se connecter avec Discord"
3. Autorise l'application
4. Tu devrais voir le panel ! 🎉

5. Connecte-toi sur ton serveur FiveM
6. Les logs devraient apparaître automatiquement

---

## 🆘 Problèmes ?

**"Non autorisé" en me connectant**
→ Vérifie que ton Discord ID est bien dans `ALLOWED_DISCORD_IDS`

**"Pas de logs"**
→ Vérifie que l'API_KEY est identique dans Railway et config.lua
→ Vérifie l'URL dans config.lua

**"Erreur base de données"**
→ Vérifie que database.sql a été importé
→ Vérifie les variables MySQL dans Railway

---

## 📌 Pour ajouter du staff

1. Demande leur Discord ID (mode développeur → clic droit → copier ID)
2. Dans Railway → Variables → `ALLOWED_DISCORD_IDS`
3. Ajoute leur ID séparé par une virgule : `ton_id,staff1_id,staff2_id`

---

C'est prêt ! Dis-moi à quelle étape tu en es et si tu bloques quelque part 🚀
