/**
 * ============================================================
 * MIDDLEWARE AUTHENTIFICATION — JWT
 * ============================================================
 */

const jwt = require('jsonwebtoken');

/**
 * Vérifie que l'utilisateur est authentifié via JWT
 */
const verifierToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "🔒 Accès refusé. Aucun token d'authentification fourni."
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.utilisateur = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({
                    success: false,
                    message: "⏰ Votre session a expiré. Veuillez vous reconnecter."
                });
            }
            return res.status(403).json({
                success: false,
                message: "🔑 Token invalide. Veuillez vous reconnecter."
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "❌ Erreur lors de la vérification du token: " + err.message
        });
    }
};

/**
 * Vérifie que l'utilisateur est administrateur
 */
const verifierAdmin = (req, res, next) => {
    if (!req.utilisateur) {
        return res.status(401).json({
            success: false,
            message: "🔒 Veuillez vous authentifier d'abord."
        });
    }

    if (req.utilisateur.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "⛔ Accès refusé. Cette action est réservée aux administrateurs."
        });
    }

    next();
};

/**
 * Middleware optionnel: vérifie que l'utilisateur est admin OU le propriétaire
 */
const verifierProprietaireOuAdmin = (req, res, next) => {
    if (!req.utilisateur) {
        return res.status(401).json({
            success: false,
            message: "🔒 Veuillez vous authentifier d'abord."
        });
    }

    if (req.utilisateur.role === 'admin') {
        return next();
    }

    // Vérifier si l'utilisateur est le propriétaire de la ressource
    const utilisateurId = parseInt(req.params.id) || parseInt(req.body.utilisateur_id);
    if (req.utilisateur.id === utilisateurId) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "⛔ Accès refusé. Vous n'êtes pas autorisé à accéder à cette ressource."
    });
};

module.exports = {
    verifierToken,
    verifierAdmin,
    verifierProprietaireOuAdmin
};
