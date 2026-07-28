/**
 * ============================================================
 * CONTROLLER PRODUITS
 * ============================================================
 */

const Produit = require('../models/Produit.model');
const Categorie = require('../models/Categorie.model');
const slugify = require('../utils/slugify');

/**
 * Récupère tous les produits avec filtres et pagination
 */
exports.getProduits = async (req, res) => {
    try {
        const {
            categorie, prix_min, prix_max, couleur, matiere,
            tri = 'nouveaute', page = 1, limite = 12, recherche
        } = req.query;

        const result = await Produit.getAll({
            categorie,
            prix_min,
            prix_max,
            couleur,
            matiere,
            tri,
            page: parseInt(page),
            limite: parseInt(limite),
            recherche
        });

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });

    } catch (err) {
        console.error('❌ Erreur getProduits:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des produits.'
        });
    }
};

/**
 * Récupère les produits en vedette
 */
exports.getProduitsVedette = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const produits = await Produit.getVedette(limit);

        res.status(200).json({
            success: true,
            data: produits
        });

    } catch (err) {
        console.error('❌ Erreur getProduitsVedette:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des produits vedettes.'
        });
    }
};

/**
 * Récupère un produit par son slug
 */
exports.getProduitBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const produit = await Produit.findBySlug(slug);

        if (!produit) {
            return res.status(404).json({
                success: false,
                message: '🪑 Produit non trouvé. Vérifiez l\'URL ou essayez un autre produit.'
            });
        }

        // Récupérer les produits similaires
        const similaires = await Produit.getSimilaires(
            slug,
            produit.categorie_id,
            produit.id,
            4
        );

        res.status(200).json({
            success: true,
            data: {
                ...produit,
                similaires
            }
        });

    } catch (err) {
        console.error('❌ Erreur getProduitBySlug:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération du produit.'
        });
    }
};

/**
 * Crée un nouveau produit (admin)
 */
exports.createProduit = async (req, res) => {
    try {
        const {
            nom, description, description_courte, prix, prix_promo,
            categorie_id, matiere, couleur, dimensions, stock,
            est_en_vedette = false
        } = req.body;

        // Générer le slug
        const slug = slugify(nom);

        // Vérifier si le slug existe déjà
        const existing = await Produit.findBySlug(slug);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: '⚠️ Un produit avec ce nom existe déjà. Veuillez choisir un nom différent.'
            });
        }

        // Gérer les images uploadées
        let images = [];
        let image_principale = null;

        if (req.files && req.files.length > 0) {
            images = req.files.map(f => `/uploads/produits/${f.filename}`);
            image_principale = images[0];
        }

        // Créer le produit
        const produit = await Produit.create({
            nom,
            slug,
            description: description || null,
            description_courte: description_courte || null,
            prix: parseFloat(prix),
            prix_promo: prix_promo ? parseFloat(prix_promo) : null,
            categorie_id: categorie_id ? parseInt(categorie_id) : null,
            matiere: matiere || null,
            couleur: couleur || null,
            dimensions: dimensions || null,
            stock: parseInt(stock) || 0,
            images: images.length > 0 ? images : null,
            image_principale,
            est_en_vedette: est_en_vedette === 'true' || est_en_vedette === true
        });

        res.status(201).json({
            success: true,
            message: '✅ Produit créé avec succès !',
            data: produit
        });

    } catch (err) {
        console.error('❌ Erreur createProduit:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la création du produit.'
        });
    }
};

/**
 * Met à jour un produit (admin)
 */
exports.updateProduit = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nom, description, description_courte, prix, prix_promo,
            categorie_id, matiere, couleur, dimensions, stock,
            est_en_vedette, est_actif
        } = req.body;

        // Vérifier si le produit existe
        const existing = await Produit.findById(parseInt(id));
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: '🪑 Produit non trouvé.'
            });
        }

        // Préparer les données de mise à jour
        const data = {};
        if (nom) {
            data.nom = nom;
            data.slug = slugify(nom);
        }
        if (description !== undefined) data.description = description;
        if (description_courte !== undefined) data.description_courte = description_courte;
        if (prix) data.prix = parseFloat(prix);
        if (prix_promo !== undefined) data.prix_promo = prix_promo ? parseFloat(prix_promo) : null;
        if (categorie_id !== undefined) data.categorie_id = categorie_id ? parseInt(categorie_id) : null;
        if (matiere !== undefined) data.matiere = matiere;
        if (couleur !== undefined) data.couleur = couleur;
        if (dimensions !== undefined) data.dimensions = dimensions;
        if (stock !== undefined) data.stock = parseInt(stock);
        if (est_en_vedette !== undefined) data.est_en_vedette = est_en_vedette === 'true' || est_en_vedette === true;
        if (est_actif !== undefined) data.est_actif = est_actif === 'true' || est_actif === true;

        // Gérer les nouvelles images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => `/uploads/produits/${f.filename}`);
            const existingImages = existing.images || [];
            data.images = [...existingImages, ...newImages];
            if (!data.image_principale) {
                data.image_principale = newImages[0];
            }
        }

        const produit = await Produit.update(parseInt(id), data);

        res.status(200).json({
            success: true,
            message: '✅ Produit mis à jour avec succès !',
            data: produit
        });

    } catch (err) {
        console.error('❌ Erreur updateProduit:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la mise à jour du produit.'
        });
    }
};

/**
 * Supprime un produit (soft delete - admin)
 */
exports.deleteProduit = async (req, res) => {
    try {
        const { id } = req.params;

        const produit = await Produit.delete(parseInt(id));
        if (!produit) {
            return res.status(404).json({
                success: false,
                message: '🪑 Produit non trouvé.'
            });
        }

        res.status(200).json({
            success: true,
            message: '🗑️ Produit supprimé avec succès.'
        });

    } catch (err) {
        console.error('❌ Erreur deleteProduit:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la suppression du produit.'
        });
    }
};

/**
 * Supprime définitivement un produit (hard delete - admin)
 */
exports.deleteProduitPermanent = async (req, res) => {
    try {
        const { id } = req.params;

        const produit = await Produit.deletePermanent(parseInt(id));
        if (!produit) {
            return res.status(404).json({
                success: false,
                message: '🪑 Produit non trouvé.'
            });
        }

        res.status(200).json({
            success: true,
            message: '🗑️ Produit supprimé définitivement.'
        });

    } catch (err) {
        console.error('❌ Erreur deleteProduitPermanent:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la suppression définitive du produit.'
        });
    }
};
