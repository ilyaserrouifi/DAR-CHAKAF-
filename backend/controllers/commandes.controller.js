/**
 * ============================================================
 * CONTROLLER COMMANDES
 * ============================================================
 */

const Commande = require('../models/Commande.model');
const CommandeItem = require('../models/CommandeItem.model');
const Panier = require('../models/Panier.model');
const Produit = require('../models/Produit.model');

/**
 * Génère un numéro de commande unique
 */
function generateNumeroCommande() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `DA-${year}${month}${day}-${random}`;
}

/**
 * Crée une nouvelle commande depuis le panier
 */
exports.createCommande = async (req, res) => {
    try {
        const {
            adresse_livraison, ville_livraison, telephone_contact,
            methode_paiement = 'especes_a_la_livraison', notes
        } = req.body;

        const utilisateurId = req.utilisateur?.id;

        if (!utilisateurId) {
            return res.status(401).json({
                success: false,
                message: '🔒 Veuillez vous connecter pour passer une commande.'
            });
        }

        // Récupérer les articles du panier
        const panierItems = await Panier.getItemsForOrder(utilisateurId);

        if (panierItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: '🛒 Votre panier est vide. Ajoutez des produits avant de commander.'
            });
        }

        // Calculer le total
        let montantTotal = 0;
        const items = [];

        for (const item of panierItems) {
            // Vérifier le stock
            if (item.stock < item.quantite) {
                return res.status(400).json({
                    success: false,
                    message: `⚠️ Stock insuffisant pour "${item.nom}". Il ne reste que ${item.stock} exemplaire(s).`
                });
            }

            const sousTotal = parseFloat(item.prix) * parseInt(item.quantite);
            montantTotal += sousTotal;

            items.push({
                produit_id: item.produit_id,
                quantite: item.quantite,
                prix_unitaire: parseFloat(item.prix),
                sous_total: sousTotal
            });
        }

        // Générer le numéro de commande
        const numero_commande = generateNumeroCommande();

        // Créer la commande
        const commande = await Commande.create({
            utilisateur_id: utilisateurId,
            numero_commande,
            montant_total: montantTotal,
            adresse_livraison,
            ville_livraison,
            telephone_contact,
            methode_paiement,
            notes: notes || null
        });

        // Créer les items de la commande
        const itemsWithCommande = items.map(item => ({
            ...item,
            commande_id: commande.id
        }));

        await CommandeItem.createMultiple(itemsWithCommande);

        // Mettre à jour le stock des produits
        for (const item of panierItems) {
            await Produit.updateStock(item.produit_id, item.quantite);
        }

        // Vider le panier
        await Panier.clearByUtilisateur(utilisateurId);

        res.status(201).json({
            success: true,
            message: '🎉 Commande créée avec succès !',
            data: {
                commande,
                items: items,
                total: montantTotal
            }
        });

    } catch (err) {
        console.error('❌ Erreur createCommande:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la création de la commande.'
        });
    }
};

/**
 * Récupère l'historique des commandes de l'utilisateur
 */
exports.getMesCommandes = async (req, res) => {
    try {
        const utilisateurId = req.utilisateur.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const commandes = await Commande.getByUtilisateur(utilisateurId, limit, offset);

        // Récupérer les items pour chaque commande
        const commandesWithItems = await Promise.all(
            commandes.map(async (commande) => {
                const items = await CommandeItem.getByCommande(commande.id);
                return { ...commande, items };
            })
        );

        res.status(200).json({
            success: true,
            data: commandesWithItems,
            pagination: {
                page,
                limit,
                total: commandes.length
            }
        });

    } catch (err) {
        console.error('❌ Erreur getMesCommandes:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération des commandes.'
        });
    }
};

/**
 * Récupère une commande par son ID (pour l'utilisateur connecté)
 */
exports.getCommandeById = async (req, res) => {
    try {
        const { id } = req.params;
        const utilisateurId = req.utilisateur.id;

        const commande = await Commande.findById(parseInt(id));

        if (!commande) {
            return res.status(404).json({
                success: false,
                message: '📦 Commande non trouvée.'
            });
        }

        // Vérifier que la commande appartient à l'utilisateur ou que l'utilisateur est admin
        if (commande.utilisateur_id !== utilisateurId && req.utilisateur.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '⛔ Vous n\'êtes pas autorisé à voir cette commande.'
            });
        }

        // Récupérer les items
        const items = await CommandeItem.getByCommande(commande.id);

        res.status(200).json({
            success: true,
            data: {
                ...commande,
                items
            }
        });

    } catch (err) {
        console.error('❌ Erreur getCommandeById:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération de la commande.'
        });
    }
};
