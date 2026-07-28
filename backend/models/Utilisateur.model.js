/**
 * ============================================================
 * MODÈLE UTILISATEUR
 * ============================================================
 */

const { query } = require('../config/db');

class Utilisateur {
    /**
     * Crée un nouvel utilisateur
     */
    static async create({ nom, prenom, email, mot_de_passe, telephone = null, role = 'client' }) {
        const sql = `
            INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nom, prenom, email, telephone, role, created_at
        `;
        const params = [nom, prenom, email, mot_de_passe, telephone, role];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Trouve un utilisateur par email
     */
    static async findByEmail(email) {
        const sql = `SELECT * FROM utilisateurs WHERE email = $1`;
        const result = await query(sql, [email]);
        return result.rows[0] || null;
    }

    /**
     * Trouve un utilisateur par ID
     */
    static async findById(id) {
        const sql = `
            SELECT id, nom, prenom, email, telephone, adresse, ville, role, created_at, updated_at
            FROM utilisateurs
            WHERE id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Met à jour un utilisateur
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let i = 1;

        if (data.nom !== undefined) {
            fields.push(`nom = $${i++}`);
            params.push(data.nom);
        }
        if (data.prenom !== undefined) {
            fields.push(`prenom = $${i++}`);
            params.push(data.prenom);
        }
        if (data.telephone !== undefined) {
            fields.push(`telephone = $${i++}`);
            params.push(data.telephone);
        }
        if (data.adresse !== undefined) {
            fields.push(`adresse = $${i++}`);
            params.push(data.adresse);
        }
        if (data.ville !== undefined) {
            fields.push(`ville = $${i++}`);
            params.push(data.ville);
        }
        if (data.mot_de_passe !== undefined) {
            fields.push(`mot_de_passe = $${i++}`);
            params.push(data.mot_de_passe);
        }
        if (data.role !== undefined) {
            fields.push(`role = $${i++}`);
            params.push(data.role);
        }

        if (fields.length === 0) return null;

        params.push(id);
        const sql = `
            UPDATE utilisateurs
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${params.length}
            RETURNING id, nom, prenom, email, telephone, adresse, ville, role, created_at, updated_at
        `;
        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Supprime un utilisateur
     */
    static async delete(id) {
        const sql = `DELETE FROM utilisateurs WHERE id = $1 RETURNING id`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Récupère tous les utilisateurs (admin uniquement)
     */
    static async getAll(limit = 50, offset = 0) {
        const sql = `
            SELECT id, nom, prenom, email, telephone, adresse, ville, role, created_at
            FROM utilisateurs
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await query(sql, [limit, offset]);
        return result.rows;
    }

    /**
     * Compte le nombre total d'utilisateurs
     */
    static async count() {
        const sql = `SELECT COUNT(*) as total FROM utilisateurs`;
        const result = await query(sql);
        return parseInt(result.rows[0]?.total || 0);
    }
}

module.exports = Utilisateur;
