const multer = require('multer');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

let storage;

if (isCloudinaryConfigured) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'rethread',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    },
  });
} else {
  // Local disk fallback for development without Cloudinary credentials.
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
});

// Normalizes multer's local-disk vs Cloudinary output shape into { url, publicId }
function normalizeUploadedFiles(files, req) {
  if (!files) return [];
  return files.map((f) => {
    if (isCloudinaryConfigured) {
      return { url: f.path, publicId: f.filename };
    }
    const host = `${req.protocol}://${req.get('host')}`;
    return { url: `${host}/uploads/${f.filename}`, publicId: f.filename };
  });
}

module.exports = { upload, normalizeUploadedFiles, isCloudinaryConfigured };
