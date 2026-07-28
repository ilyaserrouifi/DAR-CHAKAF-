/**
 * ============================================================
 * MODÈLE PRODUIT
 * ============================================================
 */

const { query } = require('../config/db');

class Produit {
    /**
     * Crée un nouveau produit
     */
    static async create(data) {
        const {
            nom, slug, description, description_courte, prix, prix_promo = null,
            categorie_id = null, matiere = null, couleur = null, dimensions = null,
            stock = 0, images = null, image_principale = null,
            est_en_vedette = false, est_actif = true
        } = data;

        const sql = `
            INSERT INTO produits (
                nom, slug, description, description_courte, prix, prix_promo,
                categorie_id, matiere, couleur, dimensions, stock,
                images, image_principale, est_en_vedette, est_actif
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `;
        const params = [
            nom, slug, description, description_courte, prix, prix_promo,
            categorie_id, matiere, couleur, dimensions, stock,
            images ? JSON.stringify(images) : null, image_principale,
            est_en_vedette, est_actif
        ];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Récupère tous les produits avec filtres et pagination
     */
    static async getAll(filters = {}) {
        const {
            categorie, prix_min, prix_max, couleur, matiere,
            tri = 'nouveaute', page = 1, limite = 12, recherche = null
        } = filters;

        let conditions = ['p.est_actif = true'];
        const params = [];
        let i = 1;

        if (categorie) {
            conditions.push(`c.slug = $${i++}`);
            params.push(categorie);
        }

        if (prix_min !== undefined && prix_min !== null) {
            conditions.push(`p.prix >= $${i++}`);
            params.push(parseFloat(prix_min));
        }

        if (prix_max !== undefined && prix_max !== null) {
            conditions.push(`p.prix <= $${i++}`);
            params.push(parseFloat(prix_max));
        }

        if (couleur) {
            conditions.push(`p.couleur = $${i++}`);
            params.push(couleur);
        }

        if (matiere) {
            conditions.push(`p.matiere = $${i++}`);
            params.push(matiere);
        }

        if (recherche) {
            conditions.push(`(p.nom ILIKE $${i++} OR p.description ILIKE $${i} OR p.description_courte ILIKE $${i})`);
            const searchTerm = `%${recherche}%`;
            params.push(searchTerm, searchTerm, searchTerm);
            i += 2;
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Gestion du tri
        const triMap = {
            'prix_asc': 'p.prix ASC',
            'prix_desc': 'p.prix DESC',
            'nouveaute': 'p.created_at DESC',
            'popularite': 'p.nombre_avis DESC, p.note_moyenne DESC',
            'note': 'p.note_moyenne DESC'
        };
        const orderBy = triMap[tri] || triMap.nouveaute;

        const offset = (parseInt(page) - 1) * parseInt(limite);
        const limitInt = parseInt(limite);

        // Requête principale
        const sql = `
            SELECT p.*, c.nom as categorie_nom, c.slug as categorie_slug,
                   (SELECT AVG(note) FROM avis WHERE produit_id = p.id) as note_calculee,
                   (SELECT COUNT(*) FROM avis WHERE produit_id = p.id) as nb_avis
            FROM produits p
            LEFT JOIN categories c ON p.categorie_id = c.id
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT $${i++} OFFSET $${i++}
        `;
        params.push(limitInt, offset);

        const result = await query(sql, params);

        // Compter le total
        const countParams = params.slice(0, params.length - 2);
        const countSql = `
            SELECT COUNT(*) as total
            FROM produits p
            LEFT JOIN categories c ON p.categorie_id = c.id
            ${whereClause}
        `;
        const countResult = await query(countSql, countParams);
        const total = parseInt(countResult.rows[0]?.total || 0);

        return {
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limite: limitInt,
                total: total,
                total_pages: Math.ceil(total / limitInt)
            }
        };
    }

    /**
     * Récupère les produits en vedette
     */
    static async getVedette(limit = 6) {
        const sql = `
            SELECT p.*, c.nom as categorie_nom, c.slug as categorie_slug,
                   (SELECT AVG(note) FROM avis WHERE produit_id = p.id) as note_calculee,
                   (SELECT COUNT(*) FROM avis WHERE produit_id = p.id) as nb_avis
            FROM produits p
            LEFT JOIN categories c ON p.categorie_id = c.id
            WHERE p.est_actif = true AND p.est_en_vedette = true
            ORDER BY p.created_at DESC
            LIMIT $1
        `;
        const result = await query(sql, [limit]);
        return result.rows;
    }

    /**
     * Récupère un produit par son slug
     */
    static async findBySlug(slug) {
        const sql = `
            SELECT p.*, c.nom as categorie_nom, c.slug as categorie_slug,
                   (SELECT AVG(note) FROM avis WHERE produit_id = p.id) as note_calculee,
                   (SELECT COUNT(*) FROM avis WHERE produit_id = p.id) as nb_avis
            FROM produits p
            LEFT JOIN categories c ON p.categorie_id = c.id
            WHERE p.slug = $1 AND p.est_actif = true
        `;
        const result = await query(sql, [slug]);
        return result.rows[0] || null;
    }

    /**
     * Récupère un produit par son ID
     */
    static async findById(id) {
        const sql = `
            SELECT p.*, c.nom as categorie_nom, c.slug as categorie_slug
            FROM produits p
            LEFT JOIN categories c ON p.categorie_id = c.id
            WHERE p.id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Met à jour un produit
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let i = 1;

        const updatableFields = [
            'nom', 'slug', 'description', 'description_courte', 'prix', 'prix_promo',
            'categorie_id', 'matiere', 'couleur', 'dimensions', 'stock',
            'images', 'image_principale', 'est_en_vedette', 'est_actif'
        ];

        for (const field of updatableFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = $${i++}`);
                if (field === 'images' && data[field] !== null) {
                    params.push(JSON.stringify(data[field]));
                } else {
                    params.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return null;

        params.push(id);
        const sql = `
            UPDATE produits
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${params.length}
            RETURNING *
        `;
        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Supprime un produit (soft delete via est_actif = false)
     */
    static async delete(id) {
        const sql = `
            UPDATE produits
            SET est_actif = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime définitivement un produit (hard delete - admin uniquement)
     */
    static async deletePermanent(id) {
        const sql = `DELETE FROM produits WHERE id = $1 RETURNING id`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Met à jour le stock d'un produit
     */
    static async updateStock(id, quantite) {
        const sql = `
            UPDATE produits
            SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND stock >= $1
            RETURNING id, stock
        `;
        const result = await query(sql, [quantite, id]);
        return result.rows[0] || null;
    }

    /**
     * Met à jour la note moyenne d'un produit
     */
    static async updateNote(id) {
        const sql = `
            UPDATE produits
            SET note_moyenne = (SELECT COALESCE(AVG(note), 0) FROM avis WHERE produit_id = $1),
                nombre_avis = (SELECT COUNT(*) FROM avis WHERE produit_id = $1)
            WHERE id = $1
            RETURNING note_moyenne, nombre_avis
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Récupère les produits similaires (même catégorie)
     */
    static async getSimilaires(slug, categorieId, produitId, limit = 4) {
        const sql = `
            SELECT p.*, c.nom as categorie_nom
            FROM produits p
            LEFT JOIN categories c ON p.categorie_id = c.id
            WHERE p.est_actif = true
              AND p.id != $1
              AND p.categorie_id = $2
            ORDER BY p.created_at DESC
            LIMIT $3
        `;
        const result = await query(sql, [produitId, categorieId, limit]);
        return result.rows;
    }
}

module.exports = Produit;
