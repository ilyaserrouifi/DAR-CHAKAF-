/**
 * ============================================================
 * CONTROLLER AUTHENTIFICATION
 * ============================================================
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur.model');

/**
 * Inscription d'un nouvel utilisateur
 */
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe, telephone } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existant = await Utilisateur.findByEmail(email);
        if (existant) {
            return res.status(400).json({
                success: false,
                message: '📧 Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.'
            });
        }

        // Hasher le mot de passe
        const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);

        // Créer l'utilisateur
        const utilisateur = await Utilisateur.create({
            nom,
            prenom,
            email,
            mot_de_passe: motDePasseHash,
            telephone: telephone || null
        });

        // Générer le token JWT
        const token = jwt.sign(
            { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            message: '🎉 Inscription réussie ! Bienvenue chez Dar Athath.',
            data: {
                token,
                utilisateur: {
                    id: utilisateur.id,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    email: utilisateur.email,
                    telephone: utilisateur.telephone,
                    role: utilisateur.role
                }
            }
        });

    } catch (err) {
        console.error('❌ Erreur inscription:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de l\'inscription. Veuillez réessayer.'
        });
    }
};

/**
 * Connexion d'un utilisateur
 */
exports.login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        // Vérifier si l'utilisateur existe
        const utilisateur = await Utilisateur.findByEmail(email);
        if (!utilisateur) {
            return res.status(401).json({
                success: false,
                message: '📧 Email ou mot de passe incorrect. Veuillez réessayer.'
            });
        }

        // Vérifier le mot de passe
        const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
        if (!motDePasseValide) {
            return res.status(401).json({
                success: false,
                message: '🔑 Email ou mot de passe incorrect. Veuillez réessayer.'
            });
        }

        // Générer le token JWT
        const token = jwt.sign(
            { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Ne pas renvoyer le mot de passe
        delete utilisateur.mot_de_passe;

        res.status(200).json({
            success: true,
            message: '✅ Connexion réussie ! Bonjour ' + utilisateur.prenom + ' 👋',
            data: {
                token,
                utilisateur
            }
        });

    } catch (err) {
        console.error('❌ Erreur login:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la connexion. Veuillez réessayer.'
        });
    }
};

/**
 * Récupère le profil de l'utilisateur connecté
 */
exports.getProfil = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.utilisateur.id);
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
        console.error('❌ Erreur récupération profil:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la récupération du profil.'
        });
    }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 */
exports.updateProfil = async (req, res) => {
    try {
        const { nom, prenom, telephone, adresse, ville, mot_de_passe } = req.body;

        const data = {};
        if (nom) data.nom = nom;
        if (prenom) data.prenom = prenom;
        if (telephone) data.telephone = telephone;
        if (adresse) data.adresse = adresse;
        if (ville) data.ville = ville;

        // Si mot de passe fourni, le hasher
        if (mot_de_passe) {
            data.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
        }

        const utilisateur = await Utilisateur.update(req.utilisateur.id, data);
        if (!utilisateur) {
            return res.status(404).json({
                success: false,
                message: '👤 Utilisateur non trouvé.'
            });
        }

        res.status(200).json({
            success: true,
            message: '✅ Profil mis à jour avec succès !',
            data: utilisateur
        });

    } catch (err) {
        console.error('❌ Erreur mise à jour profil:', err);
        res.status(500).json({
            success: false,
            message: '❌ Erreur lors de la mise à jour du profil.'
        });
    }
};
