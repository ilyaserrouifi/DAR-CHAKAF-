/**
 * ============================================================
 * CONTROLLER CATÉGORIES
 * ============================================================
 */

const Categorie = require('../models/Categorie.model');
const slugify = require('../utils/slugify');

/**
 * Récupère toutes les catégories
 */
exports.getCategories = async (req, res) => {
    try {
        const categories = await Categorie.getAll();

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (err) {
        console.error('❌ Erreur getCategories:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des catégories.'
        });
    }
};

/**
 * Récupère les catégories principales
 */
exports.getCategoriesPrincipales = async (req, res) => {
    try {
        const categories = await Categorie.getPrincipales();

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (err) {
        console.error('❌ Erreur getCategoriesPrincipales:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des catégories principales.'
        });
    }
};

/**
 * Récupère une catégorie par son slug avec ses produits
 */
exports.getCategorieBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const categorie = await Categorie.findBySlug(slug);

        if (!categorie) {
            return res.status(404).json({
                success: false,
                message: '📂 Catégorie non trouvée.'
            });
        }

        // Récupérer les sous-catégories
        const sousCategories = await Categorie.getSousCategories(categorie.id);

        // Récupérer les produits de cette catégorie
        const Produit = require('../models/Produit.model');
        const produits = await Produit.getAll({
            categorie: slug,
            limite: 20
        });

        res.status(200).json({
            success: true,
            data: {
                ...categorie,
                sous_categories: sousCategories,
                produits: produits.data,
                pagination: produits.pagination
            }
        });

    } catch (err) {
        console.error('❌ Erreur getCategorieBySlug:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération de la catégorie.'
        });
    }
};

/**
 * Crée une nouvelle catégorie (admin)
 */
exports.createCategorie = async (req, res) => {
    try {
        const { nom, description, parent_id } = req.body;

        // Générer le slug
        const slug = slugify(nom);

        // Vérifier si le slug existe déjà
        const existing = await Categorie.findBySlug(slug);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: '⚠️ Une catégorie avec ce nom existe déjà.'
            });
        }

        // Vérifier si la catégorie parent existe
        if (parent_id) {
            const parent = await Categorie.findById(parseInt(parent_id));
            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message: '📂 Catégorie parent non trouvée.'
                });
            }
        }

        const categorie = await Categorie.create({
            nom,
            slug,
            description: description || null,
            parent_id: parent_id ? parseInt(parent_id) : null
        });

        res.status(201).json({
            success: true,
            message: '✅ Catégorie créée avec succès !',
            data: categorie
        });

    } catch (err) {
        console.error('❌ Erreur createCategorie:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la création de la catégorie.'
        });
    }
};

/**
 * Met à jour une catégorie (admin)
 */
exports.updateCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, description, parent_id } = req.body;

        const categorie = await Categorie.findById(parseInt(id));
        if (!categorie) {
            return res.status(404).json({
                success: false,
                message: '📂 Catégorie non trouvée.'
            });
        }

        const data = {};
        if (nom) {
            data.nom = nom;
            data.slug = slugify(nom);
        }
        if (description !== undefined) data.description = description;
        if (parent_id !== undefined) {
            if (parent_id) {
                const parent = await Categorie.findById(parseInt(parent_id));
                if (!parent) {
                    return res.status(404).json({
                        success: false,
                        message: '📂 Catégorie parent non trouvée.'
                    });
                }
                if (parseInt(parent_id) === parseInt(id)) {
                    return res.status(400).json({
                        success: false,
                        message: '⚠️ Une catégorie ne peut pas être son propre parent.'
                    });
                }
                data.parent_id = parseInt(parent_id);
            } else {
                data.parent_id = null;
            }
        }

        const updated = await Categorie.update(parseInt(id), data);

        res.status(200).json({
            success: true,
            message: '✅ Catégorie mise à jour avec succès !',
            data: updated
        });

    } catch (err) {
        console.error('❌ Erreur updateCategorie:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la mise à jour de la catégorie.'
        });
    }
};

/**
 * Supprime une catégorie (admin)
 */
exports.deleteCategorie = async (req, res) => {
    try {
        const { id } = req.params;

        const categorie = await Categorie.findById(parseInt(id));
        if (!categorie) {
            return res.status(404).json({
                success: false,
                message: '📂 Catégorie non trouvée.'
            });
        }

        // Vérifier si la catégorie a des produits
        const hasProducts = await Categorie.hasProducts(parseInt(id));
        if (hasProducts) {
            return res.status(400).json({
                success: false,
                message: '⚠️ Impossible de supprimer cette catégorie car elle contient des produits. Déplacez ou supprimez les produits d\'abord.'
            });
        }

        // Vérifier si la catégorie a des sous-catégories
        const hasChildren = await Categorie.hasChildren(parseInt(id));
        if (hasChildren) {
            return res.status(400).json({
                success: false,
                message: '⚠️ Impossible de supprimer cette catégorie car elle contient des sous-catégories.'
            });
        }

        await Categorie.delete(parseInt(id));

        res.status(200).json({
            success: true,
            message: '🗑️ Catégorie supprimée avec succès.'
        });

    } catch (err) {
        console.error('❌ Erreur deleteCategorie:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la suppression de la catégorie.'
        });
    }
};
