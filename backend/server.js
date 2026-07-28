/**
 * ============================================================
 * SERVEUR PRINCIPAL — DAR ATHATH API
 * ============================================================
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import des routes
const produitsRoutes = require('./routes/produits.routes');
const categoriesRoutes = require('./routes/categories.routes');
const authRoutes = require('./routes/auth.routes');
const panierRoutes = require('./routes/panier.routes');
const commandesRoutes = require('./routes/commandes.routes');
const utilisateursRoutes = require('./routes/utilisateurs.routes');
const adminRoutes = require('./routes/admin.routes');

// Import du middleware d'erreur
const errorMiddleware = require('./middleware/error.middleware');

// Initialisation de l'application
const app = express();

// ============================================================
// 1. MIDDLEWARES GLOBAUX
// ============================================================

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// 2. RATE LIMITING
// ============================================================

// Limiteur général
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par fenêtre
    message: {
        success: false,
        message: '🚦 Trop de requêtes. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiteur spécifique pour login (plus strict)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 tentatives max
    message: {
        success: false,
        message: '🔒 Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Application du limiteur général sur toutes les routes API
app.use('/api', generalLimiter);

// ============================================================
// 3. ROUTES
// ============================================================

// Routes publiques
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🪑 API Dar Athath opérationnelle',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Routes API
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================
// 4. GESTION DES ERREURS 404
// ============================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `❌ Route non trouvée: ${req.method} ${req.originalUrl}`
    });
});

// ============================================================
// 5. MIDDLEWARE D'ERREUR CENTRALISÉ
// ============================================================

app.use(errorMiddleware);

// ============================================================
// 6. DÉMARRAGE DU SERVEUR
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('========================================');
    console.log('🪑 DAR ATHATH — SERVEUR DÉMARRÉ');
    console.log('========================================');
    console.log(`🚀 URL: http://localhost:${PORT}`);
    console.log(`📦 Base de données: ${process.env.PGDATABASE || 'neondb'}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
});

// ============================================================
// 7. GESTION DES ERREURS NON CATCHÉES
// ============================================================

process.on('uncaughtException', (err) => {
    console.error('💥 Erreur non catchée:', err);
    // En production, on peut logger et continuer
    if (process.env.NODE_ENV === 'production') {
        // Log dans un service externe
        console.error('⚠️ Une erreur critique est survenue. Le serveur continue de tourner.');
    } else {
        process.exit(1);
    }
});

process.on('unhandledRejection', (err) => {
    console.error('💥 Rejet non géré:', err);
    // En production, on peut logger et continuer
    if (process.env.NODE_ENV === 'production') {
        console.error('⚠️ Un rejet de promesse non géré est survenu.');
    }
});

module.exports = app;
