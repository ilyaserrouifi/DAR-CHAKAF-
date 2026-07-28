/**
 * ============================================================
 * CONTROLLER UTILISATEURS
 * ============================================================
 */

const Utilisateur = require('../models/Utilisateur.model');

/**
 * Récupère un utilisateur par son ID (admin uniquement)
 */
exports.getUtilisateurById = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que l'utilisateur est admin ou le propriétaire
        if (req.utilisateur.role !== 'admin' && parseInt(id) !== req.utilisateur.id) {
            return res.status(403).json({
                success: false,
                message: '⛔ Vous n\'êtes pas autorisé à voir ce profil.'
            });
        }

        const utilisateur = await Utilisateur.findById(parseInt(id));
        if (!utilisateur) {
            return res.status(404).json({
                success: false,
                message: '👤 Utilisateur non trouvé.'
            });
        }

        res.status(200).json({
            success: true,
            data: utilisateur
        });

    } catch (err) {
        console.error('❌ Erreur getUtilisateurById:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération de l\'utilisateur.'
        });
    }
};
