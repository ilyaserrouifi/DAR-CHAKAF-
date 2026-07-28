/**
 * ============================================================
 * MODÈLE COMMANDE ITEM
 * ============================================================
 */

const { query } = require('../config/db');

class CommandeItem {
    /**
     * Crée un item de commande
     */
    static async create({ commande_id, produit_id, quantite, prix_unitaire, sous_total }) {
        const sql = `
            INSERT INTO commande_items (commande_id, produit_id, quantite, prix_unitaire, sous_total)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const params = [commande_id, produit_id, quantite, prix_unitaire, sous_total];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Crée plusieurs items de commande en une fois
     */
    static async createMultiple(items) {
        if (!items || items.length === 0) return [];

        const values = items.map((item, index) => {
            const base = index * 5;
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
        }).join(', ');

        const params = [];
        items.forEach(item => {
            params.push(item.commande_id, item.produit_id, item.quantite, item.prix_unitaire, item.sous_total);
        });

        const sql = `
            INSERT INTO commande_items (commande_id, produit_id, quantite, prix_unitaire, sous_total)
            VALUES ${values}
            RETURNING *
        `;
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Récupère tous les items d'une commande
     */
    static async getByCommande(commandeId) {
        const sql = `
            SELECT ci.*, p.nom, p.slug, p.image_principale, p.couleur, p.matiere
            FROM commande_items ci
            LEFT JOIN produits p ON ci.produit_id = p.id
            WHERE ci.commande_id = $1
            ORDER BY ci.id ASC
        `;
        const result = await query(sql, [commandeId]);
        return result.rows;
    }

    /**
     * Supprime les items d'une commande
     */
    static async deleteByCommande(commandeId) {
        const sql = `DELETE FROM commande_items WHERE commande_id = $1 RETURNING id`;
        const result = await query(sql, [commandeId]);
        return result.rows;
    }

    /**
     * Calcule le total d'une commande à partir des items
     */
    static async getTotalByCommande(commandeId) {
        const sql = `SELECT COALESCE(SUM(sous_total), 0) as total FROM commande_items WHERE commande_id = $1`;
        const result = await query(sql, [commandeId]);
        return parseFloat(result.rows[0]?.total || 0);
    }
}

module.exports = CommandeItem;
