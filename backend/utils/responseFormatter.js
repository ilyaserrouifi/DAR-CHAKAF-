/**
 * ============================================================
 * UTILITAIRE — FORMATAGE DES RÉPONSES API
 * ============================================================
 */

/**
 * Formate une réponse de succès
 * @param {*} data - Les données à retourner
 * @param {string} message - Message de succès
 * @param {Object} pagination - Informations de pagination (optionnel)
 * @returns {Object} Réponse formatée
 */
function formatSuccess(data, message = 'Opération réussie', pagination = null) {
    const response = {
        success: true,
        message,
        data
    };

    if (pagination) {
        response.pagination = pagination;
    }

    return response;
}

/**
 * Formate une réponse d'erreur
 * @param {string} message - Message d'erreur
 * @param {number} statusCode - Code HTTP (optionnel)
 * @param {Array} errors - Détails des erreurs (optionnel)
 * @returns {Object} Réponse formatée
 */
function formatError(message, statusCode = 400, errors = null) {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return response;
}

/**
 * Formate une réponse avec pagination
 * @param {Array} data - Les données
 * @param {Object} pagination - Informations de pagination
 * @param {string} message - Message de succès
 * @returns {Object} Réponse formatée
 */
function formatPaginated(data, pagination, message = 'Données récupérées avec succès') {
    return {
        success: true,
        message,
        data,
        pagination
    };
}

module.exports = {
    formatSuccess,
    formatError,
    formatPaginated
};
