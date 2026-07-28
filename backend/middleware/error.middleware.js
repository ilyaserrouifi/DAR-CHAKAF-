/**
 * ============================================================
 * MIDDLEWARE GESTION DES ERREURS — Centralisé
 * ============================================================
 */

/**
 * Middleware de gestion centralisée des erreurs
 */
const errorMiddleware = (err, req, res, next) => {
    // Log l'erreur complète en mode développement
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ ERREUR DÉTAILLÉE:');
        console.error('📌 Message:', err.message);
        console.error('📌 Stack:', err.stack);
        console.error('📌 URL:', req.originalUrl);
        console.error('📌 Méthode:', req.method);
        console.error('📌 Body:', req.body);
    } else {
        console.error('❌ Erreur serveur:', err.message);
    }

    // Erreur de validation (multer)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: `📦 Le fichier est trop volumineux. Taille max: ${process.env.MAX_FILE_SIZE || '5MB'}.`
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: '⚠️ Nombre de fichiers inattendu. Maximum 10 fichiers.'
        });
    }

    // Erreur de base de données
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: '⚠️ Cette entrée existe déjà (contrainte d\'unicité violée).'
        });
    }

    // Erreur de validation PostgreSQL
    if (err.code === '23502') {
        return res.status(400).json({
            success: false,
            message: '⚠️ Un champ obligatoire est manquant dans la base de données.'
        });
    }

    // Erreur de connexion
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            message: '🔌 Impossible de se connecter à la base de données. Veuillez réessayer plus tard.'
        });
    }

    // Erreur JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({
            success: false,
            message: '🔑 Token invalide. Veuillez vous reconnecter.'
        });
    }

    // Statut et message par défaut
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Une erreur interne est survenue. Veuillez réessayer.';

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorMiddleware;
