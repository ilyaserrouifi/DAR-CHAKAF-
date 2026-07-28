/**
 * ============================================================
 * CONFIGURATION MULTER — Upload d'images
 * ============================================================
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier d'upload s'il n'existe pas
const uploadDir = process.env.UPLOAD_PATH || './uploads/produits';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Générer un nom unique avec timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        // Nettoyer le nom: remplacer les espaces et caractères spéciaux
        const cleanName = baseName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase();
        cb(null, cleanName + '-' + uniqueSuffix + ext);
    }
});

// Filtrer les fichiers: uniquement les images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('❌ Type de fichier non autorisé. Utilisez JPEG, PNG, GIF, WEBP, SVG ou AVIF.'), false);
    }
};

// Configuration multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB par défaut
        files: 10 // Max 10 images par upload
    }
});

// Middleware pour upload multiple (champ 'images')
const uploadImages = upload.array('images', 10);

// Middleware pour upload single (champ 'image')
const uploadSingleImage = upload.single('image');

// Middleware pour upload de plusieurs champs
const uploadFields = upload.fields([
    { name: 'image_principale', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

module.exports = {
    upload,
    uploadImages,
    uploadSingleImage,
    uploadFields
};
