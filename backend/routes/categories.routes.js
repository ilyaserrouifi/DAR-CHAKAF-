/**
 * ============================================================
 * ROUTES CATÉGORIES
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const { verifierAdminComplet } = require('../middleware/admin.middleware');
const { validerCategorie, validerSlug, validerId } = require('../middleware/validation.middleware');

// ============================================================
// ROUTES PUBLIQUES
// ============================================================

/**
 * GET /api/categories
 * Récupère toutes les catégories
 */
router.get('/', categoriesController.getCategories);

/**
 * GET /api/categories/principales
 * Récupère les catégories principales
 */
router.get('/principales', categoriesController.getCategoriesPrincipales);

/**
 * GET /api/categories/:slug
 * Récupère une catégorie par son slug avec ses produits
 */
router.get('/:slug', validerSlug, categoriesController.getCategorieBySlug);

// ============================================================
// ROUTES ADMIN
// ============================================================

/**
 * POST /api/categories
 * Crée une nouvelle catégorie (admin)
 */
router.post(
    '/',
    verifierAdminComplet,
    validerCategorie,
    categoriesController.createCategorie
);

/**
 * PUT /api/categories/:id
 * Met à jour une catégorie (admin)
 */
router.put(
    '/:id',
    verifierAdminComplet,
    validerId,
    categoriesController.updateCategorie
);

/**
 * DELETE /api/categories/:id
 * Supprime une catégorie (admin)
 */
router.delete(
    '/:id',
    verifierAdminComplet,
    validerId,
    categoriesController.deleteCategorie
);

module.exports = router;
