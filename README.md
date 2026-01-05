# Panel Veloria - Système de Logs FiveM

Un système de logs professionnel et stylé pour votre serveur FiveM avec interface web et authentification Discord.

## 🎯 Fonctionnalités

- ✅ Interface web moderne et responsive
- ✅ Authentification Discord OAuth2
- ✅ Filtrage avancé des logs (par titre, message, ID, nom, date)
- ✅ Recherche par ID joueur, Discord ID, UUID
- ✅ Catégories de logs personnalisables
- ✅ Pagination et statistiques en temps réel
- ✅ Design inspiré des interfaces modernes (Discord-like)
- ✅ API sécurisée avec clé API
- ✅ Base de données MySQL optimisée

## 📦 Installation

### 1. Prérequis

- Node.js 16+ installé
- MySQL/MariaDB
- Serveur FiveM
- Application Discord (pour OAuth2)

### 2. Configuration de l'application Discord

1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Dans "OAuth2" → "Redirects", ajoutez: `http://localhost:3000/auth/discord/callback`
4. Notez votre `Client ID` et `Client Secret`
5. Dans "OAuth2" → "General", copiez le Client ID et Client Secret

### 3. Installation du Panel Web

```bash
cd panel-veloria

# Installer les dépendances
npm install

# Copier et configurer le fichier .env
copy .env.example .env
```

Éditez le fichier `.env` avec vos informations:
```env
PORT=3000
DISCORD_CLIENT_ID=votre_client_id
DISCORD_CLIENT_SECRET=votre_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
SESSION_SECRET=un_secret_tres_long_et_aleatoire
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=veloria_logs
API_KEY=une_cle_api_secrete_unique
ALLOWED_DISCORD_IDS=123456789,987654321
```

### 4. Configuration de la base de données

Exécutez le fichier SQL:
```bash
mysql -u root -p < database.sql
```

Ou importez manuellement le fichier `database.sql` dans phpMyAdmin/MySQL Workbench.

### 5. Installation de la ressource FiveM

1. Copiez le dossier `veloria-logs` dans votre dossier `resources`
2. Éditez `veloria-logs/config.lua`:
```lua
Config.PanelURL = "http://localhost:3000/api/logs"
Config.APIKey = "la_meme_cle_que_dans_le_env"
```

3. Ajoutez dans votre `server.cfg`:
```
ensure veloria-logs
```

## 🚀 Démarrage

### Panel Web
```bash
cd panel-veloria
npm start
```

Pour le développement avec rechargement automatique:
```bash
npm run dev
```

Le panel sera accessible sur: `http://localhost:3000`

### Serveur FiveM
Démarrez simplement votre serveur FiveM avec la ressource activée.

## 📝 Utilisation

### Dans vos ressources FiveM

Pour envoyer des logs depuis vos ressources:

```lua
-- Format de base
exports['veloria-logs']:SendLog(category, type, title, message, source)

-- Exemples pratiques

-- Log de connexion
exports['veloria-logs']:SendLog('connexion', 'CONNEXION', 'Joueur connecté', playerName .. ' vient de se connecter', source)

-- Log admin
exports['veloria-logs']:SendLog('admin', 'ADMIN', 'Kick joueur', admin.name .. ' a kick ' .. player.name, source)

-- Log économie
exports['veloria-logs']:SendLog('economie', 'prise-service', 'Prise de service', player.name .. ' a pris son service chez Mécano', source)

-- Log inventaire
exports['veloria-logs']:SendLog('inventaire', 'item-give', 'Item donné', player.name .. ' a reçu x10 Pain', source)

-- Log véhicule
exports['veloria-logs']:SendLog('vehicules', 'spawn', 'Spawn véhicule', player.name .. ' a spawn un ' .. vehicleName, source)

-- Log illégal
exports['veloria-logs']:SendLog('illegal', 'drogue', 'Récolte drogue', player.name .. ' récolte de la weed', source)

-- Log mort
exports['veloria-logs']:SendLog('morts', 'death', 'Mort', player.name .. ' est mort', source)
```

### Catégories disponibles

- `connexion` - Connexions au serveur
- `deconnexion` - Déconnexions
- `admin` - Actions admin
- `staff` - Actions staff
- `system` - Logs système
- `chat` - Messages chat
- `economie` - Transactions, services
- `inventaire` - Items, inventaire
- `vehicules` - Spawns, modifications véhicules
- `illegal` - Actions illégales (drogue, braquages)
- `morts` - Morts de joueurs
- `moderation` - Warns, bans, kicks
- `reports` - Reports joueurs
- `boutique` - Achats boutique
- `entreprises` - Actions entreprises

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `public/css/style.css` et modifiez les variables CSS:

```css
:root {
    --bg-primary: #1a1d29;
    --accent-primary: #5865F2;
    /* ... */
}
```

### Ajouter des catégories

1. Dans `veloria-logs/config.lua`, ajoutez votre catégorie:
```lua
Config.Categories = {
    ma_nouvelle_categorie = true,
}
```

2. Dans `public/js/app.js`, ajoutez l'icône correspondante:
```javascript
const icons = {
    'ma_nouvelle_categorie': 'fas fa-icon-name',
}
```

3. Dans `public/css/style.css`, ajoutez le style du badge:
```css
.badge.ma_nouvelle_categorie {
    background: rgba(88, 101, 242, 0.15);
    color: var(--accent-primary);
}
```

## 🔒 Sécurité

- Changez TOUJOURS la clé API dans `.env` et `config.lua`
- Changez le `SESSION_SECRET` dans `.env`
- Ajoutez uniquement les Discord IDs autorisés dans `ALLOWED_DISCORD_IDS`
- En production, utilisez HTTPS

## 🐛 Dépannage

### Les logs n'apparaissent pas
- Vérifiez que la clé API est identique dans `.env` et `config.lua`
- Vérifiez que MySQL est démarré
- Vérifiez les logs du serveur FiveM pour les erreurs HTTP

### Erreur de connexion Discord
- Vérifiez que le Client ID et Secret sont corrects
- Vérifiez que l'URL de callback est bien configurée dans Discord Developer Portal
- Vérifiez que votre Discord ID est dans `ALLOWED_DISCORD_IDS`

### Erreur de base de données
- Vérifiez les credentials MySQL dans `.env`
- Vérifiez que la base de données `veloria_logs` existe
- Vérifiez que les tables ont été créées

## 📄 License

Ce projet est open source. Libre d'utilisation et de modification.

## 🤝 Support

Pour toute question ou problème, créez une issue sur GitHub.

---

**Créé avec ❤️ pour la communauté FiveM**
