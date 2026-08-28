import { Router, Request, Response } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const router = Router();

// Configure multer to store files in memory (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/upload — upload a single image to Cloudinary
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Determine folder from query param or default to 'pawtectors'
    const folder = (req.query.folder as string) || 'pawtectors';

    // Upload buffer to Cloudinary using a stream
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as { secure_url: string; public_id: string });
        },
      );
      stream.end(req.file!.buffer);
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('❌ Image upload failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Image upload failed',
    });
  }
});

export default router;
