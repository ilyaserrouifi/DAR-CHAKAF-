/**
 * ============================================================
 * MODÈLE AVIS
 * ============================================================
 */

const { query } = require('../config/db');

class Avis {
    /**
     * Crée un nouvel avis
     */
    static async create({ produit_id, utilisateur_id, note, commentaire = null }) {
        const sql = `
            INSERT INTO avis (produit_id, utilisateur_id, note, commentaire)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const params = [produit_id, utilisateur_id, note, commentaire];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Récupère tous les avis d'un produit
     */
    static async getByProduit(produitId, limit = 20, offset = 0) {
        const sql = `
            SELECT a.*, u.nom, u.prenom
            FROM avis a
            JOIN utilisateurs u ON a.utilisateur_id = u.id
            WHERE a.produit_id = $1
            ORDER BY a.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await query(sql, [produitId, limit, offset]);
        return result.rows;
    }

    /**
     * Récupère les avis d'un utilisateur
     */
    static async getByUtilisateur(utilisateurId) {
        const sql = `
            SELECT a.*, p.nom as produit_nom, p.slug
            FROM avis a
            JOIN produits p ON a.produit_id = p.id
            WHERE a.utilisateur_id = $1
            ORDER BY a.created_at DESC
        `;
        const result = await query(sql, [utilisateurId]);
        return result.rows;
    }

    /**
     * Récupère un avis par ID
     */
    static async findById(id) {
        const sql = `
            SELECT a.*, u.nom, u.prenom
            FROM avis a
            JOIN utilisateurs u ON a.utilisateur_id = u.id
            WHERE a.id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Met à jour un avis
     */
    static async update(id, { note, commentaire }) {
        const sql = `
            UPDATE avis
            SET note = $1, commentaire = $2
            WHERE id = $3
            RETURNING *
        `;
        const result = await query(sql, [note, commentaire, id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime un avis
     */
    static async delete(id) {
        const sql = `DELETE FROM avis WHERE id = $1 RETURNING id`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Vérifie si un utilisateur a déjà laissé un avis pour un produit
     */
    static async hasUserReviewed(produitId, utilisateurId) {
        const sql = `SELECT * FROM avis WHERE produit_id = $1 AND utilisateur_id = $2`;
        const result = await query(sql, [produitId, utilisateurId]);
        return result.rows.length > 0;
    }

    /**
     * Calcule la note moyenne d'un produit
     */
    static async getAverageNote(produitId) {
        const sql = `
            SELECT COALESCE(AVG(note), 0) as moyenne, COUNT(*) as total
            FROM avis
            WHERE produit_id = $1
        `;
        const result = await query(sql, [produitId]);
        return {
            moyenne: parseFloat(result.rows[0]?.moyenne || 0),
            total: parseInt(result.rows[0]?.total || 0)
        };
    }
}

module.exports = Avis;
