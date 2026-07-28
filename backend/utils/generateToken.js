/**
 * ============================================================
 * UTILITAIRE — GÉNÉRATION DE TOKEN JWT
 * ============================================================
 */

const jwt = require('jsonwebtoken');

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'utilisateur
 * @param {number} user.id - ID de l'utilisateur
 * @param {string} user.email - Email de l'utilisateur
 * @param {string} user.role - Rôle de l'utilisateur
 * @returns {string} Le token JWT
 */
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role || 'client'
    };

    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
}

/**
 * Vérifie un token JWT
 * @param {string} token - Le token à vérifier
 * @returns {Object|null} Le payload décodé ou null si invalide
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = {
    generateToken,
    verifyToken
};
