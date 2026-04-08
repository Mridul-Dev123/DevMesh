import multer from 'multer';
import ApiError from '../core/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  void req;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, 'Only JPEG, PNG, WEBP files are allowed', {
        code: 'INVALID_FILE_TYPE',
        errors: [{ field: 'file', message: `Unsupported mime type: ${file.mimetype}` }],
      }),
      false
    );
  }
};

export const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for post images
});
