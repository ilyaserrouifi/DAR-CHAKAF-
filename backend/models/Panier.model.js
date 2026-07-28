/**
 * ============================================================
 * MODÈLE PANIER
 * ============================================================
 */

const { query } = require('../config/db');

class Panier {
    /**
     * Récupère le panier d'un utilisateur
     */
    static async getByUtilisateur(utilisateurId) {
        const sql = `
            SELECT p.*, pr.nom as produit_nom, pr.prix as produit_prix, 
                   pr.image_principale, pr.slug as produit_slug,
                   (pr.prix * p.quantite) as sous_total
            FROM panier p
            JOIN produits pr ON p.produit_id = pr.id
            WHERE p.utilisateur_id = $1 AND pr.est_actif = true
            ORDER BY p.created_at ASC
        `;
        const result = await query(sql, [utilisateurId]);
        return result.rows;
    }

    /**
     * Récupère le panier d'une session (invité)
     */
    static async getBySession(sessionId) {
        const sql = `
            SELECT p.*, pr.nom as produit_nom, pr.prix as produit_prix, 
                   pr.image_principale, pr.slug as produit_slug,
                   (pr.prix * p.quantite) as sous_total
            FROM panier p
            JOIN produits pr ON p.produit_id = pr.id
            WHERE p.session_id = $1 AND pr.est_actif = true
            ORDER BY p.created_at ASC
        `;
        const result = await query(sql, [sessionId]);
        return result.rows;
    }

    /**
     * Ajoute un produit au panier
     */
    static async add({ utilisateur_id = null, session_id = null, produit_id, quantite = 1 }) {
        // Vérifier si le produit existe déjà dans le panier
        let sql;
        let params;
        
        if (utilisateur_id) {
            sql = `SELECT * FROM panier WHERE utilisateur_id = $1 AND produit_id = $2`;
            params = [utilisateur_id, produit_id];
        } else if (session_id) {
            sql = `SELECT * FROM panier WHERE session_id = $1 AND produit_id = $2`;
            params = [session_id, produit_id];
        } else {
            throw new Error('❌ Utilisateur_id ou session_id requis');
        }

        const existing = await query(sql, params);

        if (existing.rows.length > 0) {
            // Mettre à jour la quantité
            const updateSql = `
                UPDATE panier 
                SET quantite = quantite + $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `;
            const result = await query(updateSql, [quantite, existing.rows[0].id]);
            return result.rows[0];
        } else {
            // Ajouter un nouveau produit
            const insertSql = `
                INSERT INTO panier (utilisateur_id, session_id, produit_id, quantite)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const result = await query(insertSql, [utilisateur_id, session_id, produit_id, quantite]);
            return result.rows[0];
        }
    }

    /**
     * Met à jour la quantité d'un produit dans le panier
     */
    static async updateQuantity(id, quantite) {
        if (quantite <= 0) {
            return await this.remove(id);
        }

        const sql = `
            UPDATE panier
            SET quantite = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await query(sql, [quantite, id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime un produit du panier
     */
    static async remove(id) {
        const sql = `DELETE FROM panier WHERE id = $1 RETURNING id`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Vide le panier d'un utilisateur
     */
    static async clearByUtilisateur(utilisateurId) {
        const sql = `DELETE FROM panier WHERE utilisateur_id = $1 RETURNING id`;
        const result = await query(sql, [utilisateurId]);
        return result.rows;
    }

    /**
     * Vide le panier d'une session
     */
    static async clearBySession(sessionId) {
        const sql = `DELETE FROM panier WHERE session_id = $1 RETURNING id`;
        const result = await query(sql, [sessionId]);
        return result.rows;
    }

    /**
     * Transfère le panier d'une session vers un utilisateur (après connexion)
     */
    static async transferSessionToUser(sessionId, utilisateurId) {
        // Vérifier si l'utilisateur a déjà des articles
        const checkSql = `SELECT * FROM panier WHERE utilisateur_id = $1`;
        const checkResult = await query(checkSql, [utilisateurId]);

        if (checkResult.rows.length > 0) {
            // Mettre à jour les quantités des articles existants
            const sessionItems = await this.getBySession(sessionId);
            for (const item of sessionItems) {
                const existing = checkResult.rows.find(r => r.produit_id === item.produit_id);
                if (existing) {
                    await this.updateQuantity(existing.id, existing.quantite + item.quantite);
                } else {
                    await this.add({
                        utilisateur_id: utilisateurId,
                        produit_id: item.produit_id,
                        quantite: item.quantite
                    });
                }
            }
            // Supprimer les articles de la session
            await this.clearBySession(sessionId);
        } else {
            // Transférer directement
            const sql = `
                UPDATE panier
                SET utilisateur_id = $1, session_id = NULL, updated_at = CURRENT_TIMESTAMP
                WHERE session_id = $2
                RETURNING *
            `;
            const result = await query(sql, [utilisateurId, sessionId]);
            return result.rows;
        }
    }

    /**
     * Calcule le total du panier d'un utilisateur
     */
    static async getTotalByUtilisateur(utilisateurId) {
        const sql = `
            SELECT SUM(pr.prix * p.quantite) as total
            FROM panier p
            JOIN produits pr ON p.produit_id = pr.id
            WHERE p.utilisateur_id = $1 AND pr.est_actif = true
        `;
        const result = await query(sql, [utilisateurId]);
        return parseFloat(result.rows[0]?.total || 0);
    }

    /**
     * Calcule le total du panier d'une session
     */
    static async getTotalBySession(sessionId) {
        const sql = `
            SELECT SUM(pr.prix * p.quantite) as total
            FROM panier p
            JOIN produits pr ON p.produit_id = pr.id
            WHERE p.session_id = $1 AND pr.est_actif = true
        `;
        const result = await query(sql, [sessionId]);
        return parseFloat(result.rows[0]?.total || 0);
    }

    /**
     * Récupère tous les items du panier pour une commande
     */
    static async getItemsForOrder(utilisateurId) {
        const sql = `
            SELECT p.*, pr.nom, pr.prix, pr.image_principale,
                   pr.stock, pr.slug
            FROM panier p
            JOIN produits pr ON p.produit_id = pr.id
            WHERE p.utilisateur_id = $1 AND pr.est_actif = true AND pr.stock > 0
        `;
        const result = await query(sql, [utilisateurId]);
        return result.rows;
    }
}

module.exports = Panier;
