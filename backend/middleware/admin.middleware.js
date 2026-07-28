/**
 * ============================================================
 * MIDDLEWARE ADMIN — Vérification des droits admin
 * ============================================================
 */

const { verifierToken, verifierAdmin } = require('./auth.middleware');

/**
 * Middleware combiné: authentification + admin
 */
const verifierAdminComplet = [verifierToken, verifierAdmin];

module.exports = {
    verifierAdminComplet,
    verifierToken,
    verifierAdmin
};
