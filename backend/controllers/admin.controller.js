/**
 * ============================================================
 * CONTROLLER ADMIN
 * ============================================================
 */

const Commande = require('../models/Commande.model');
const Produit = require('../models/Produit.model');
const Utilisateur = require('../models/Utilisateur.model');
const CommandeItem = require('../models/CommandeItem.model');

/**
 * Récupère toutes les commandes (admin)
 */
exports.getAllCommandes = async (req, res) => {
    try {
        const {
            statut, utilisateur_id, date_debut, date_fin,
            page = 1, limit = 20
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const filters = {};
        if (statut) filters.statut = statut;
        if (utilisateur_id) filters.utilisateur_id = parseInt(utilisateur_id);
        if (date_debut) filters.date_debut = date_debut;
        if (date_fin) filters.date_fin = date_fin;

        const result = await Commande.getAll(
            filters,
            parseInt(limit),
            offset
        );

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.pagination.total,
                total_pages: Math.ceil(result.pagination.total / parseInt(limit))
            }
        });

    } catch (err) {
        console.error('❌ Erreur getAllCommandes:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des commandes.'
        });
    }
};

/**
 * Change le statut d'une commande (admin)
 */
exports.updateCommandeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        const commande = await Commande.updateStatus(parseInt(id), statut);
        if (!commande) {
            return res.status(404).json({
                success: false,
                message: '📦 Commande non trouvée.'
            });
        }

        res.status(200).json({
            success: true,
            message: `✅ Statut de la commande mis à jour: ${statut}`,
            data: commande
        });

    } catch (err) {
        console.error('❌ Erreur updateCommandeStatus:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la mise à jour du statut.'
        });
    }
};

/**
 * Récupère les statistiques du dashboard (admin)
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // Statistiques des commandes
        const commandesStats = await Commande.getStats();
        const todayStats = await Commande.getToday();

        // Statistiques des produits
        const produitsTotal = await Produit.getAll({ limite: 1 });
        const produitsVedette = await Produit.getVedette(5);

        // Produits en rupture de stock
        const produitsRupture = await Produit.getAll({
            limite: 10,
            tri: 'nouveaute'
        });
        const produitsEnRupture = produitsRupture.data.filter(p => p.stock === 0);

        // Statistiques des utilisateurs
        const utilisateursTotal = await Utilisateur.count();

        res.status(200).json({
            success: true,
            data: {
                commandes: {
                    total: parseInt(commandesStats.total_commandes || 0),
                    en_attente: parseInt(commandesStats.en_attente || 0),
                    confirmee: parseInt(commandesStats.confirmee || 0),
                    en_preparation: parseInt(commandesStats.en_preparation || 0),
                    expediee: parseInt(commandesStats.expediee || 0),
                    livree: parseInt(commandesStats.livree || 0),
                    annulee: parseInt(commandesStats.annulee || 0)
                },
                chiffre_affaires: {
                    total: parseFloat(commandesStats.chiffre_affaires_total || 0),
                    aujourd_hui: parseFloat(todayStats.total_ventes || 0)
                },
                panier_moyen: parseFloat(commandesStats.panier_moyen || 0),
                produits: {
                    total: produitsTotal.pagination.total || 0,
                    en_vedette: produitsVedette.length,
                    en_rupture: produitsEnRupture.length
                },
                utilisateurs: {
                    total: utilisateursTotal
                },
                commandes_aujourd_hui: parseInt(todayStats.total || 0)
            }
        });

    } catch (err) {
        console.error('❌ Erreur getDashboardStats:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des statistiques.'
        });
    }
};

/**
 * Récupère les statistiques par mois (admin)
 */
exports.getMonthlyStats = async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 12;
        const stats = await Commande.getMonthlyStats(months);

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (err) {
        console.error('❌ Erreur getMonthlyStats:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des statistiques mensuelles.'
        });
    }
};

/**
 * Récupère tous les utilisateurs (admin)
 */
exports.getAllUtilisateurs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const utilisateurs = await Utilisateur.getAll(limit, offset);
        const total = await Utilisateur.count();

        res.status(200).json({
            success: true,
            data: utilisateurs,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('❌ Erreur getAllUtilisateurs:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des utilisateurs.'
        });
    }
};

/**
 * Récupère une commande en détail avec tous ses items (admin)
 */
exports.getCommandeDetailAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const commande = await Commande.findById(parseInt(id));
        if (!commande) {
            return res.status(404).json({
                success: false,
                message: '📦 Commande non trouvée.'
            });
        }

        const items = await CommandeItem.getByCommande(commande.id);

        res.status(200).json({
            success: true,
            data: {
                ...commande,
                items
            }
        });

    } catch (err) {
        console.error('❌ Erreur getCommandeDetailAdmin:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des détails de la commande.'
        });
    }
};
