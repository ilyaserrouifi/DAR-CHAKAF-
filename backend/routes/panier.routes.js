/**
 * ============================================================
 * ROUTES PANIER
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const panierController = require('../controllers/panier.controller');
const { verifierToken } = require('../middleware/auth.middleware');
const { validerPanier, validerId } = require('../middleware/validation.middleware');

// ============================================================
// ROUTES PROTÉGÉES (authentification requise)
// ============================================================

/**
 * GET /api/panier
 * Récupère le panier de l'utilisateur connecté
 */
router.get('/', verifierToken, panierController.getPanier);

/**
 * POST /api/panier
 * Ajoute un produit au panier
 */
router.post(
    '/',
    verifierToken,
    validerPanier,
    panierController.addToPanier
);

/**
 * PUT /api/panier/:id
 * Met à jour la quantité d'un produit dans le panier
 */
router.put(
    '/:id',
    verifierToken,
    validerId,
    panierController.updatePanierItem
);

/**
 * DELETE /api/panier/:id
 * Supprime un produit du panier
 */
router.delete(
    '/:id',
    verifierToken,
    validerId,
    panierController.removeFromPanier
);

/**
 * DELETE /api/panier
 * Vide le panier
 */
router.delete('/', verifierToken, panierController.clearPanier);

module.exports = router;
