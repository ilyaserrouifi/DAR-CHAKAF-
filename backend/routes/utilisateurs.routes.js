/**
 * ============================================================
 * ROUTES UTILISATEURS
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const utilisateursController = require('../controllers/utilisateurs.controller');
const { verifierToken } = require('../middleware/auth.middleware');
const { validerId } = require('../middleware/validation.middleware');

// ============================================================
// ROUTES PROTÉGÉES
// ============================================================

/**
 * GET /api/utilisateurs/:id
 * Récupère un utilisateur par son ID (admin uniquement)
 */
router.get('/:id', verifierToken, validerId, utilisateursController.getUtilisateurById);

module.exports = router;
