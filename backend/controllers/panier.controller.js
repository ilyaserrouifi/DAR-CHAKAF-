/**
 * ============================================================
 * CONTROLLER PANIER
 * ============================================================
 */

const Panier = require('../models/Panier.model');
const Produit = require('../models/Produit.model');

/**
 * Récupère le panier de l'utilisateur connecté
 */
exports.getPanier = async (req, res) => {
    try {
        const utilisateurId = req.utilisateur?.id;
        const sessionId = req.headers['x-session-id'] || req.query.session_id;

        let items = [];

        if (utilisateurId) {
            items = await Panier.getByUtilisateur(utilisateurId);
        } else if (sessionId) {
            items = await Panier.getBySession(sessionId);
        }

        // Calculer le total
        let total = 0;
        items.forEach(item => {
            total += parseFloat(item.sous_total || 0);
        });

        res.status(200).json({
            success: true,
            data: {
                items,
                total: total,
                nb_articles: items.reduce((sum, item) => sum + parseInt(item.quantite), 0)
            }
        });

    } catch (err) {
        console.error('❌ Erreur getPanier:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération du panier.'
        });
    }
};

/**
 * Ajoute un produit au panier
 */
exports.addToPanier = async (req, res) => {
    try {
        const { produit_id, quantite = 1 } = req.body;
        const utilisateurId = req.utilisateur?.id;
        const sessionId = req.headers['x-session-id'] || req.body.session_id;

        // Vérifier si le produit existe et est en stock
        const produit = await Produit.findById(parseInt(produit_id));
        if (!produit || !produit.est_actif) {
            return res.status(404).json({
                success: false,
                message: '🪑 Produit non trouvé ou indisponible.'
            });
        }

        if (produit.stock < quantite) {
            return res.status(400).json({
                success: false,
                message: `⚠️ Stock insuffisant. Il ne reste que ${produit.stock} exemplaire(s).`
            });
        }

        let item;
        if (utilisateurId) {
            item = await Panier.add({
                utilisateur_id: utilisateurId,
                produit_id: parseInt(produit_id),
                quantite: parseInt(quantite)
            });
        } else if (sessionId) {
            item = await Panier.add({
                session_id: sessionId,
                produit_id: parseInt(produit_id),
                quantite: parseInt(quantite)
            });
        } else {
            return res.status(400).json({
                success: false,
                message: '❌ Session ID requis pour les utilisateurs non connectés.'
            });
        }

        res.status(200).json({
            success: true,
            message: '✅ Produit ajouté au panier avec succès !',
            data: item
        });

    } catch (err) {
        console.error('❌ Erreur addToPanier:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de l\'ajout au panier.'
        });
    }
};

/**
 * Met à jour la quantité d'un produit dans le panier
 */
exports.updatePanierItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantite } = req.body;

        if (!quantite || parseInt(quantite) < 0) {
            return res.status(400).json({
                success: false,
                message: '⚠️ Quantité invalide.'
            });
        }

        const item = await Panier.updateQuantity(parseInt(id), parseInt(quantite));
        if (!item) {
            return res.status(404).json({
                success: false,
                message: '🛒 Article du panier non trouvé.'
            });
        }

        res.status(200).json({
            success: true,
            message: '✅ Quantité mise à jour avec succès !',
            data: item
        });

    } catch (err) {
        console.error('❌ Erreur updatePanierItem:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la mise à jour du panier.'
        });
    }
};

/**
 * Supprime un produit du panier
 */
exports.removeFromPanier = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Panier.remove(parseInt(id));
        if (!item) {
            return res.status(404).json({
                success: false,
                message: '🛒 Article du panier non trouvé.'
            });
        }

        res.status(200).json({
            success: true,
            message: '🗑️ Article retiré du panier avec succès.'
        });

    } catch (err) {
        console.error('❌ Erreur removeFromPanier:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la suppression de l\'article.'
        });
    }
};

/**
 * Vide le panier
 */
exports.clearPanier = async (req, res) => {
    try {
        const utilisateurId = req.utilisateur?.id;
        const sessionId = req.headers['x-session-id'] || req.query.session_id;

        if (utilisateurId) {
            await Panier.clearByUtilisateur(utilisateurId);
        } else if (sessionId) {
            await Panier.clearBySession(sessionId);
        } else {
            return res.status(400).json({
                success: false,
                message: '❌ Session ID requis pour les utilisateurs non connectés.'
            });
        }

        res.status(200).json({
            success: true,
            message: '🗑️ Panier vidé avec succès.'
        });

    } catch (err) {
        console.error('❌ Erreur clearPanier:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors du vidage du panier.'
        });
    }
};
