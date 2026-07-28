/**
 * ============================================================
 * UTILITAIRE — SLUGIFY
 * ============================================================
 */

/**
 * Convertit un texte en slug (URL-friendly)
 * @param {string} text - Le texte à convertir
 * @param {Object} options - Options de configuration
 * @returns {string} Le slug généré
 */
function slugify(text, options = {}) {
    const {
        separator = '-',
        lowercase = true,
        maxLength = 150,
        removeStopWords = false
    } = options;

    if (!text) return '';

    let slug = text;

    // Convertir en minuscules si demandé
    if (lowercase) {
        slug = slug.toLowerCase();
    }

    // Normaliser les caractères (supprimer les accents)
    slug = slug.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    // Remplacer les caractères spéciaux
    slug = slug
        .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, ' ')
        .replace(/\s+/g, separator)
        .replace(/[-]+/g, separator);

    // Supprimer les mots vides si demandé
    if (removeStopWords) {
        const stopWords = ['le', 'la', 'les', 'des', 'de', 'du', 'un', 'une', 'et', 'ou', 'mais', 'donc', 'car'];
        const pattern = new RegExp(`\\b(${stopWords.join('|')})\\b\\s*`, 'gi');
        slug = slug.replace(pattern, '');
        slug = slug.replace(/\s+/g, separator);
    }

    // Supprimer les séparateurs en début et fin
    slug = slug.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

    // Limiter la longueur
    if (maxLength > 0 && slug.length > maxLength) {
        slug = slug.substring(0, maxLength);
        slug = slug.replace(new RegExp(`${separator}[^${separator}]*$`), '');
    }

    return slug;
}

module.exports = slugify;
