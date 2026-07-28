/**
 * ============================================================
 * UTILITAIRE — HASHAGE DE MOT DE PASSE
 * ============================================================
 */

const bcrypt = require('bcrypt');

/**
 * Hash un mot de passe avec bcrypt
 * @param {string} password - Le mot de passe en clair
 * @param {number} saltRounds - Nombre de tours de sel (10 par défaut)
 * @returns {Promise<string>} Le mot de passe hashé
 */
async function hashPassword(password, saltRounds = 10) {
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare un mot de passe avec son hash
 * @param {string} password - Le mot de passe en clair
 * @param {string} hashedPassword - Le mot de passe hashé
 * @returns {Promise<boolean>} True si le mot de passe correspond
 */
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword
};
