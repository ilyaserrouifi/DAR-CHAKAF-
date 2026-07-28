/**
 * ============================================================
 * ROUTES COMMANDES
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const commandesController = require('../controllers/commandes.controller');
const { verifierToken } = require('../middleware/auth.middleware');
const { validerCommande, validerId } = require('../middleware/validation.middleware');

// ============================================================
// ROUTES PROTÉGÉES (authentification requise)
// ============================================================

/**
 * POST /api/commandes
 * Crée une nouvelle commande depuis le panier
 */
router.post(
    '/',
    verifierToken,
    validerCommande,
    commandesController.createCommande
);

/**
 * GET /api/commandes
 * Récupère l'historique des commandes de l'utilisateur
 */
router.get('/', verifierToken, commandesController.getMesCommandes);

/**
 * GET /api/commandes/:id
 * Récupère une commande par son ID
 */
router.get('/:id', verifierToken, validerId, commandesController.getCommandeById);

module.exports = router;
