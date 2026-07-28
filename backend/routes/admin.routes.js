/**
 * ============================================================
 * ROUTES ADMIN
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifierAdminComplet } = require('../middleware/admin.middleware');
const { validerId, validerStatutCommande } = require('../middleware/validation.middleware');

// ============================================================
// TOUTES LES ROUTES ADMIN (authentification + admin requis)
// ============================================================

/**
 * GET /api/admin/dashboard/stats
 * Statistiques du dashboard
 */
router.get('/dashboard/stats', verifierAdminComplet, adminController.getDashboardStats);

/**
 * GET /api/admin/dashboard/monthly
 * Statistiques mensuelles
 */
router.get('/dashboard/monthly', verifierAdminComplet, adminController.getMonthlyStats);

/**
 * GET /api/admin/commandes
 * Récupère toutes les commandes
 */
router.get('/commandes', verifierAdminComplet, adminController.getAllCommandes);

/**
 * GET /api/admin/commandes/:id
 * Récupère une commande en détail (admin)
 */
router.get('/commandes/:id', verifierAdminComplet, validerId, adminController.getCommandeDetailAdmin);

/**
 * PUT /api/admin/commandes/:id/statut
 * Change le statut d'une commande
 */
router.put(
    '/commandes/:id/statut',
    verifierAdminComplet,
    validerId,
    validerStatutCommande,
    adminController.updateCommandeStatus
);

/**
 * GET /api/admin/utilisateurs
 * Récupère tous les utilisateurs
 */
router.get('/utilisateurs', verifierAdminComplet, adminController.getAllUtilisateurs);

module.exports = router;
