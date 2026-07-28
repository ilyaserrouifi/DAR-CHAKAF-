/**
 * ============================================================
 * MODÈLE CATÉGORIE
 * ============================================================
 */

const { query } = require('../config/db');

class Categorie {
    /**
     * Crée une nouvelle catégorie
     */
    static async create({ nom, slug, description = null, image = null, parent_id = null }) {
        const sql = `
            INSERT INTO categories (nom, slug, description, image, parent_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const params = [nom, slug, description, image, parent_id];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Récupère toutes les catégories
     */
    static async getAll() {
        const sql = `
            SELECT c.*, 
                   (SELECT COUNT(*) FROM produits WHERE categorie_id = c.id AND est_actif = true) as nb_produits
            FROM categories c
            ORDER BY c.nom ASC
        `;
        const result = await query(sql);
        return result.rows;
    }

    /**
     * Récupère les catégories principales (parent_id = NULL)
     */
    static async getPrincipales() {
        const sql = `
            SELECT c.*, 
                   (SELECT COUNT(*) FROM produits WHERE categorie_id = c.id AND est_actif = true) as nb_produits,
                   (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) as nb_sous_categories
            FROM categories c
            WHERE c.parent_id IS NULL
            ORDER BY c.nom ASC
        `;
        const result = await query(sql);
        return result.rows;
    }

    /**
     * Récupère les sous-catégories d'une catégorie
     */
    static async getSousCategories(parentId) {
        const sql = `
            SELECT c.*, 
                   (SELECT COUNT(*) FROM produits WHERE categorie_id = c.id AND est_actif = true) as nb_produits
            FROM categories c
            WHERE c.parent_id = $1
            ORDER BY c.nom ASC
        `;
        const result = await query(sql, [parentId]);
        return result.rows;
    }

    /**
     * Récupère une catégorie par son slug
     */
    static async findBySlug(slug) {
        const sql = `
            SELECT c.*, 
                   (SELECT COUNT(*) FROM produits WHERE categorie_id = c.id AND est_actif = true) as nb_produits
            FROM categories c
            WHERE c.slug = $1
        `;
        const result = await query(sql, [slug]);
        return result.rows[0] || null;
    }

    /**
     * Récupère une catégorie par son ID
     */
    static async findById(id) {
        const sql = `SELECT * FROM categories WHERE id = $1`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Met à jour une catégorie
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let i = 1;

        if (data.nom !== undefined) {
            fields.push(`nom = $${i++}`);
            params.push(data.nom);
        }
        if (data.slug !== undefined) {
            fields.push(`slug = $${i++}`);
            params.push(data.slug);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${i++}`);
            params.push(data.description);
        }
        if (data.image !== undefined) {
            fields.push(`image = $${i++}`);
            params.push(data.image);
        }
        if (data.parent_id !== undefined) {
            fields.push(`parent_id = $${i++}`);
            params.push(data.parent_id);
        }

        if (fields.length === 0) return null;

        params.push(id);
        const sql = `
            UPDATE categories
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${params.length}
            RETURNING *
        `;
        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Supprime une catégorie
     */
    static async delete(id) {
        const sql = `DELETE FROM categories WHERE id = $1 RETURNING id`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Vérifie si une catégorie a des produits
     */
    static async hasProducts(id) {
        const sql = `SELECT COUNT(*) as total FROM produits WHERE categorie_id = $1 AND est_actif = true`;
        const result = await query(sql, [id]);
        return parseInt(result.rows[0]?.total || 0) > 0;
    }

    /**
     * Vérifie si une catégorie a des sous-catégories
     */
    static async hasChildren(id) {
        const sql = `SELECT COUNT(*) as total FROM categories WHERE parent_id = $1`;
        const result = await query(sql, [id]);
        return parseInt(result.rows[0]?.total || 0) > 0;
    }
}

module.exports = Categorie;
