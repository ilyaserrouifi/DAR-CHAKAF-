/**
 * ============================================================
 * MIDDLEWARE VALIDATION — Validation des données entrantes
 * ============================================================
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware pour valider les résultats de validation
 */
const validerResultats = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "❌ Erreur de validation des données.",
            errors: errors.array().map(err => ({
                champ: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Règles de validation pour l'inscription
 */
const validerInscription = [
    body('nom').trim().notEmpty().withMessage('Le nom est obligatoire.').isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères.'),
    body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire.').isLength({ max: 100 }).withMessage('Le prénom ne peut pas dépasser 100 caractères.'),
    body('email').trim().notEmpty().withMessage('L\'email est obligatoire.').isEmail().withMessage('Format d\'email invalide.').normalizeEmail(),
    body('mot_de_passe').notEmpty().withMessage('Le mot de passe est obligatoire.').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
    body('telephone').optional().trim().isMobilePhone('any').withMessage('Format de téléphone invalide.'),
    validerResultats
];

/**
 * Règles de validation pour la connexion
 */
const validerLogin = [
    body('email').trim().notEmpty().withMessage('L\'email est obligatoire.').isEmail().withMessage('Format d\'email invalide.').normalizeEmail(),
    body('mot_de_passe').notEmpty().withMessage('Le mot de passe est obligatoire.'),
    validerResultats
];

/**
 * Règles de validation pour les produits
 */
const validerProduit = [
    body('nom').trim().notEmpty().withMessage('Le nom du produit est obligatoire.').isLength({ max: 150 }),
    body('prix').notEmpty().withMessage('Le prix est obligatoire.').isDecimal({ min: 0 }).withMessage('Le prix doit être un nombre valide.'),
    body('prix_promo').optional().isDecimal({ min: 0 }).withMessage('Le prix promo doit être un nombre valide.'),
    body('categorie_id').optional().isInt({ min: 1 }).withMessage('ID de catégorie invalide.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Le stock doit être un nombre entier positif.'),
    body('matiere').optional().trim().isLength({ max: 100 }),
    body('couleur').optional().trim().isLength({ max: 50 }),
    body('dimensions').optional().trim().isLength({ max: 100 }),
    validerResultats
];

/**
 * Règles de validation pour les catégories
 */
const validerCategorie = [
    body('nom').trim().notEmpty().withMessage('Le nom de la catégorie est obligatoire.').isLength({ max: 100 }),
    body('slug').optional().trim().isLength({ max: 100 }),
    body('parent_id').optional().isInt({ min: 1 }).withMessage('ID de catégorie parent invalide.'),
    validerResultats
];

/**
 * Règles de validation pour les commandes
 */
const validerCommande = [
    body('adresse_livraison').trim().notEmpty().withMessage('L\'adresse de livraison est obligatoire.'),
    body('ville_livraison').trim().notEmpty().withMessage('La ville de livraison est obligatoire.'),
    body('telephone_contact').trim().notEmpty().withMessage('Le téléphone de contact est obligatoire.').isMobilePhone('any').withMessage('Format de téléphone invalide.'),
    body('methode_paiement').optional().isIn(['especes_a_la_livraison', 'carte', 'virement']).withMessage('Méthode de paiement invalide.'),
    validerResultats
];

/**
 * Règles de validation pour le panier
 */
const validerPanier = [
    body('produit_id').isInt({ min: 1 }).withMessage('ID de produit invalide.'),
    body('quantite').optional().isInt({ min: 1 }).withMessage('La quantité doit être un nombre entier positif.'),
    validerResultats
];

/**
 * Règles de validation pour le changement de statut de commande
 */
const validerStatutCommande = [
    body('statut').isIn(['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee']).withMessage('Statut invalide.'),
    validerResultats
];

/**
 * Règles de validation pour les paramètres d'URL (slug, id)
 */
const validerSlug = [
    param('slug').trim().notEmpty().withMessage('Slug invalide.'),
    validerResultats
];

const validerId = [
    param('id').isInt({ min: 1 }).withMessage('ID invalide.'),
    validerResultats
];

module.exports = {
    validerResultats,
    validerInscription,
    validerLogin,
    validerProduit,
    validerCategorie,
    validerCommande,
    validerPanier,
    validerStatutCommande,
    validerSlug,
    validerId
};
