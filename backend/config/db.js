/**
 * ============================================================
 * CONFIGURATION DE LA BASE DE DONNÉES — PostgreSQL (Neon)
 * ============================================================
 * Utilisation de la base de données Neon PostgreSQL
 * avec connexion pool pour performances optimales
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configuration du pool de connexions PostgreSQL
const pool = new Pool({
    host: process.env.PGHOST || 'ep-summer-sunset-awd87vv4-pooler.c-12.us-east-1.aws.neon.tech',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'neondb_owner',
    password: process.env.PGPASSWORD || 'npg_5hsLtKndiAB7',
    database: process.env.PGDATABASE || 'neondb',
    ssl: {
        require: true,
        rejectUnauthorized: false // Pour Neon SSL
    },
    max: 20, // Nombre max de connexions dans le pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Tester la connexion
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données Neon PostgreSQL:', err.message);
        console.error('📋 Vérifiez vos variables d\'environnement ou votre connexion internet.');
        return;
    }
    console.log('✅ Connexion à la base de données Neon PostgreSQL réussie !');
    console.log(`📦 Base: ${process.env.PGDATABASE || 'neondb'}`);
    console.log(`🖥️  Hôte: ${process.env.PGHOST || 'ep-summer-sunset-awd87vv4-pooler.c-12.us-east-1.aws.neon.tech'}`);
    release();
});

// Gestion des erreurs du pool
pool.on('error', (err) => {
    console.error('❌ Erreur inattendue du pool de connexions:', err.message);
});

// Fonction utilitaire pour exécuter des requêtes avec gestion d'erreur
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 100) {
            console.log(`⏱️  Requête lente (${duration}ms): ${text.substring(0, 100)}...`);
        }
        return res;
    } catch (err) {
        console.error(`❌ Erreur de requête (${Date.now() - start}ms):`, err.message);
        throw err;
    }
}

module.exports = {
    pool,
    query
};
