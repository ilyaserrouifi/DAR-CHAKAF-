/**
 * ============================================================
 * ROUTES PRODUITS
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const produitsController = require('../controllers/produits.controller');
const { verifierAdminComplet } = require('../middleware/admin.middleware');
const { uploadImages } = require('../config/multer.config');
const { validerProduit, validerSlug, validerId } = require('../middleware/validation.middleware');

// ============================================================
// ROUTES PUBLIQUES
// ============================================================

/**
 * GET /api/produits
 * Récupère tous les produits avec filtres et pagination
 */
router.get('/', produitsController.getProduits);

/**
 * GET /api/produits/vedette
 * Récupère les produits en vedette
 */
router.get('/vedette', produitsController.getProduitsVedette);

/**
 * GET /api/produits/:slug
 * Récupère un produit par son slug
 */
router.get('/:slug', validerSlug, produitsController.getProduitBySlug);

// ============================================================
// ROUTES ADMIN
// ============================================================

/**
 * POST /api/produits
 * Crée un nouveau produit (admin)
 */
router.post(
    '/',
    verifierAdminComplet,
    uploadImages,
    validerProduit,
    produitsController.createProduit
);

/**
 * PUT /api/produits/:id
 * Met à jour un produit (admin)
 */
router.put(
    '/:id',
    verifierAdminComplet,
    uploadImages,
    validerId,
    produitsController.updateProduit
);

/**
 * DELETE /api/produits/:id
 * Supprime un produit (soft delete - admin)
 */
router.delete(
    '/:id',
    verifierAdminComplet,
    validerId,
    produitsController.deleteProduit
);

/**
 * DELETE /api/produits/:id/permanent
 * Supprime définitivement un produit (hard delete - admin)
 */
router.delete(
    '/:id/permanent',
    verifierAdminComplet,
    validerId,
    produitsController.deleteProduitPermanent
);

module.exports = router;
