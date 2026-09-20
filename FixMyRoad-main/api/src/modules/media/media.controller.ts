import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AiClient } from '../ai/ai.client';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', upload.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No photo uploaded' });
    }

    const originalBuffer = req.file.buffer;
    const originalMime = req.file.mimetype || 'image/jpeg';

    // 1. Run AI analysis and privacy blurring
    const [aiAnalysis, blurredBuffer] = await Promise.all([
      AiClient.analyzeRoadDamage(originalBuffer, req.file.originalname),
      AiClient.blurPrivacy(originalBuffer, req.file.originalname)
    ]);

    // Format as data URL for instant standalone display & cloudless dev portability
    const originalBase64 = `data:${originalMime};base64,${originalBuffer.toString('base64')}`;
    const blurredBase64 = `data:${originalMime};base64,${blurredBuffer.toString('base64')}`;

    res.json({
      success: true,
      data: {
        photoUrl: originalBase64,
        blurredPhotoUrl: blurredBase64,
        aiAnalysis: aiAnalysis.damage,
        privacy: aiAnalysis.privacy
      }
    });
  } catch (err) {
    next(err);
  }
});

export const mediaRouter = router;
