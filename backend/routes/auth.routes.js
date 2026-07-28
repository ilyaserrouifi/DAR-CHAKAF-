/**
 * ============================================================
 * ROUTES AUTHENTIFICATION
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifierToken } = require('../middleware/auth.middleware');
const { validerInscription, validerLogin } = require('../middleware/validation.middleware');

// ============================================================
// ROUTES PUBLIQUES
// ============================================================

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', validerInscription, authController.register);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', validerLogin, authController.login);

// ============================================================
// ROUTES PROTÉGÉES
// ============================================================

/**
 * GET /api/auth/me
 * Récupère le profil de l'utilisateur connecté
 */
router.get('/me', verifierToken, authController.getProfil);

/**
 * PUT /api/auth/me
 * Met à jour le profil de l'utilisateur connecté
 */
router.put('/me', verifierToken, authController.updateProfil);

/**
 * POST /api/auth/logout
 * Déconnexion (côté client)
 */
router.post('/logout', verifierToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: '👋 Déconnexion réussie. À bientôt !'
    });
});

module.exports = router;
