/**
 * ============================================================
 * MODÈLE COMMANDE
 * ============================================================
 */

const { query } = require('../config/db');

class Commande {
    /**
     * Crée une nouvelle commande
     */
    static async create(data) {
        const {
            utilisateur_id, numero_commande, montant_total,
            adresse_livraison, ville_livraison, telephone_contact,
            methode_paiement = 'especes_a_la_livraison', notes = null
        } = data;

        const sql = `
            INSERT INTO commandes (
                utilisateur_id, numero_commande, montant_total,
                adresse_livraison, ville_livraison, telephone_contact,
                methode_paiement, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const params = [
            utilisateur_id, numero_commande, montant_total,
            adresse_livraison, ville_livraison, telephone_contact,
            methode_paiement, notes
        ];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Récupère une commande par son ID
     */
    static async findById(id) {
        const sql = `
            SELECT c.*, u.nom, u.prenom, u.email, u.telephone
            FROM commandes c
            LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
            WHERE c.id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Récupère une commande par son numéro
     */
    static async findByNumero(numero) {
        const sql = `
            SELECT c.*, u.nom, u.prenom, u.email, u.telephone
            FROM commandes c
            LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
            WHERE c.numero_commande = $1
        `;
        const result = await query(sql, [numero]);
        return result.rows[0] || null;
    }

    /**
     * Récupère toutes les commandes d'un utilisateur
     */
    static async getByUtilisateur(utilisateurId, limit = 50, offset = 0) {
        const sql = `
            SELECT c.*, 
                   (SELECT COUNT(*) FROM commande_items WHERE commande_id = c.id) as nb_articles
            FROM commandes c
            WHERE c.utilisateur_id = $1
            ORDER BY c.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await query(sql, [utilisateurId, limit, offset]);
        return result.rows;
    }

    /**
     * Récupère toutes les commandes (admin)
     */
    static async getAll(filters = {}, limit = 50, offset = 0) {
        let conditions = [];
        const params = [];
        let i = 1;

        if (filters.statut) {
            conditions.push(`c.statut = $${i++}`);
            params.push(filters.statut);
        }

        if (filters.utilisateur_id) {
            conditions.push(`c.utilisateur_id = $${i++}`);
            params.push(filters.utilisateur_id);
        }

        if (filters.date_debut) {
            conditions.push(`c.created_at >= $${i++}`);
            params.push(filters.date_debut);
        }

        if (filters.date_fin) {
            conditions.push(`c.created_at <= $${i++}`);
            params.push(filters.date_fin);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
            SELECT c.*, u.nom, u.prenom, u.email,
                   (SELECT COUNT(*) FROM commande_items WHERE commande_id = c.id) as nb_articles
            FROM commandes c
            LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
            ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT $${i++} OFFSET $${i++}
        `;
        params.push(limit, offset);

        const result = await query(sql, params);

        // Compter le total
        const countParams = params.slice(0, params.length - 2);
        const countSql = `
            SELECT COUNT(*) as total
            FROM commandes c
            LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
            ${whereClause}
        `;
        const countResult = await query(countSql, countParams);
        const total = parseInt(countResult.rows[0]?.total || 0);

        return {
            data: result.rows,
            pagination: {
                limit: limit,
                offset: offset,
                total: total
            }
        };
    }

    /**
     * Met à jour le statut d'une commande
     */
    static async updateStatus(id, statut) {
        const sql = `
            UPDATE commandes
            SET statut = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await query(sql, [statut, id]);
        return result.rows[0] || null;
    }

    /**
     * Récupère les statistiques des commandes (admin)
     */
    static async getStats() {
        const sql = `
            SELECT 
                COUNT(*) as total_commandes,
                SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
                SUM(CASE WHEN statut = 'confirmee' THEN 1 ELSE 0 END) as confirmee,
                SUM(CASE WHEN statut = 'en_preparation' THEN 1 ELSE 0 END) as en_preparation,
                SUM(CASE WHEN statut = 'expediee' THEN 1 ELSE 0 END) as expediee,
                SUM(CASE WHEN statut = 'livree' THEN 1 ELSE 0 END) as livree,
                SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as annulee,
                COALESCE(SUM(montant_total), 0) as chiffre_affaires_total,
                COALESCE(AVG(montant_total), 0) as panier_moyen
            FROM commandes
        `;
        const result = await query(sql);
        return result.rows[0];
    }

    /**
     * Récupère les commandes du jour
     */
    static async getToday() {
        const sql = `
            SELECT COUNT(*) as total, COALESCE(SUM(montant_total), 0) as total_ventes
            FROM commandes
            WHERE DATE(created_at) = CURRENT_DATE
        `;
        const result = await query(sql);
        return result.rows[0];
    }

    /**
     * Récupère les commandes par mois (pour les graphiques)
     */
    static async getMonthlyStats(months = 12) {
        const sql = `
            SELECT 
                DATE_TRUNC('month', created_at) as mois,
                COUNT(*) as nb_commandes,
                COALESCE(SUM(montant_total), 0) as total_ventes
            FROM commandes
            WHERE created_at >= CURRENT_DATE - INTERVAL '${months} months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY mois DESC
        `;
        const result = await query(sql);
        return result.rows;
    }
}

module.exports = Commande;
