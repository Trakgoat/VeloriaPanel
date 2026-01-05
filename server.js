const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const moment = require('moment');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de la base de données
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://votre-domaine.com' : 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuration de session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Configuration Passport Discord
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await pool.query('SELECT * FROM authorized_users WHERE discord_id = ?', [id]);
        done(null, rows[0] || null);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('🔐 Tentative de connexion Discord:', profile.username, 'ID:', profile.id);
        
        // Vérifier si l'utilisateur est autorisé
        const allowedIds = process.env.ALLOWED_DISCORD_IDS?.split(',').map(id => id.trim()) || [];
        console.log('👥 IDs autorisés:', allowedIds);
        
        if (!allowedIds.includes(profile.id)) {
            console.log('❌ Utilisateur non autorisé:', profile.id);
            return done(null, false, { message: 'Non autorisé' });
        }

        console.log('✅ Utilisateur autorisé, enregistrement...');

        // Enregistrer ou mettre à jour l'utilisateur
        await pool.query(
            `INSERT INTO authorized_users (discord_id, username, avatar, last_login) 
             VALUES (?, ?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE username = ?, avatar = ?, last_login = NOW()`,
            [profile.id, profile.username, profile.avatar, profile.username, profile.avatar]
        );

        const [rows] = await pool.query('SELECT * FROM authorized_users WHERE discord_id = ?', [profile.id]);
        console.log('✅ Connexion réussie pour:', profile.username);
        return done(null, rows[0]);
    } catch (error) {
        console.error('❌ Erreur lors de l\'authentification:', error);
        return done(error, null);
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware d'authentification
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Non authentifié' });
}

// Middleware de vérification API Key pour FiveM
function verifyApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.API_KEY) {
        return next();
    }
    res.status(403).json({ error: 'Clé API invalide' });
}

// ========== ROUTES D'AUTHENTIFICATION ==========

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/login-failed' }),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/login-failed', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Connexion échouée - Panel Veloria</title>
            <link rel="stylesheet" href="/css/style.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            <div class="login-container">
                <div class="login-card">
                    <div class="discord-icon">
                        <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #f04747;"></i>
                    </div>
                    <h1>Connexion échouée</h1>
                    <p>Vous n'êtes pas autorisé à accéder à ce panel.</p>
                    <p style="margin-top: 1rem; color: var(--text-secondary);">
                        Contactez l'administrateur pour obtenir l'accès.
                    </p>
                    <button onclick="window.location.href='/'" class="discord-button" style="margin-top: 2rem; background: var(--bg-tertiary);">
                        <i class="fas fa-arrow-left"></i> Retour à l'accueil
                    </button>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Non authentifié' });
    }
});

// ========== ROUTES API LOGS ==========

// Recevoir un log depuis FiveM
app.post('/api/logs', verifyApiKey, async (req, res) => {
    try {
        const { category, type, title, message, player_name, player_id, discord_id, uuid, unique_id } = req.body;

        if (!category || !type || !title || !message) {
            return res.status(400).json({ error: 'Données manquantes' });
        }

        await pool.query(
            `INSERT INTO logs (category, type, title, message, player_name, player_id, discord_id, uuid, unique_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [category, type, title, message, player_name, player_id, discord_id, uuid, unique_id]
        );

        res.json({ success: true, message: 'Log enregistré' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du log:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer les logs avec filtres
app.get('/api/logs', isAuthenticated, async (req, res) => {
    try {
        const {
            category,
            type,
            title,
            message,
            player_name,
            player_id,
            discord_id,
            uuid,
            unique_id,
            date_start,
            date_end,
            page = 1,
            limit = 50
        } = req.query;

        let query = 'SELECT * FROM logs WHERE 1=1';
        const params = [];

        if (category && category !== 'all') {
            query += ' AND category = ?';
            params.push(category);
        }

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        if (title) {
            query += ' AND title LIKE ?';
            params.push(`%${title}%`);
        }

        if (message) {
            query += ' AND message LIKE ?';
            params.push(`%${message}%`);
        }

        if (player_name) {
            query += ' AND player_name LIKE ?';
            params.push(`%${player_name}%`);
        }

        if (player_id) {
            query += ' AND player_id = ?';
            params.push(player_id);
        }

        if (discord_id) {
            query += ' AND discord_id = ?';
            params.push(discord_id);
        }

        if (uuid) {
            query += ' AND uuid = ?';
            params.push(uuid);
        }

        if (unique_id) {
            query += ' AND unique_id LIKE ?';
            params.push(`%${unique_id}%`);
        }

        if (date_start) {
            query += ' AND created_at >= ?';
            params.push(date_start);
        }

        if (date_end) {
            query += ' AND created_at <= ?';
            params.push(date_end);
        }

        // Compter le total
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Pagination
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const [logs] = await pool.query(query, params);

        res.json({
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer les catégories disponibles
app.get('/api/logs/categories', isAuthenticated, async (req, res) => {
    try {
        const [categories] = await pool.query(
            'SELECT DISTINCT category, COUNT(*) as count FROM logs GROUP BY category ORDER BY category'
        );
        res.json(categories);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Statistiques
app.get('/api/logs/stats', isAuthenticated, async (req, res) => {
    try {
        const [totalLogs] = await pool.query('SELECT COUNT(*) as count FROM logs');
        const [todayLogs] = await pool.query('SELECT COUNT(*) as count FROM logs WHERE DATE(created_at) = CURDATE()');
        const [categories] = await pool.query('SELECT category, COUNT(*) as count FROM logs GROUP BY category');
        
        res.json({
            total: totalLogs[0].count,
            today: todayLogs[0].count,
            byCategory: categories
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ========== DÉMARRAGE DU SERVEUR ==========

app.listen(PORT, () => {
    console.log(`\n🚀 Panel Veloria démarré sur http://localhost:${PORT}`);
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Authentification Discord configurée\n`);
});

// Test de connexion à la base de données
pool.query('SELECT 1')
    .then(() => console.log('✅ Connexion à la base de données réussie'))
    .catch(err => console.error('❌ Erreur de connexion à la base de données:', err));
