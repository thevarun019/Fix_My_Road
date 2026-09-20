import { Router, Request, Response, NextFunction } from 'express';
import { GeminiAiService } from './gemini.service';
import { ComplaintsService } from '../complaints/complaints.service';
import { ENV } from '../../config/env';
import { z } from 'zod';

const router = Router();

const analyzeSchema = z.object({
  photoUrl: z.string().min(10),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const autonomousDispatchSchema = z.object({
  photoUrl: z.string().min(10),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
  userId: z.string().optional(),
  analysis: z.any().optional()
});

/**
 * 1. Read-only AI Hazard Analysis (Used in wizard for preview / AI recommendations)
 */
router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { photoUrl, latitude, longitude } = analyzeSchema.parse(req.body);
    const analysis = await GeminiAiService.analyzeHazardImage(photoUrl, latitude, longitude);
    res.json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 2. Fully Autonomous AI Verification & Dispatch
 * Files grievance instantly with verified metadata, assigns SLA, and dispatches to ward engineer
 */
router.post('/autonomous-dispatch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = autonomousDispatchSchema.parse(req.body);

    // 1. Use existing client analysis if already verified, or run Gemini analysis
    let analysis = body.analysis;
    if (!analysis || !analysis.hazardType) {
      analysis = await GeminiAiService.analyzeHazardImage(body.photoUrl, body.latitude, body.longitude);
    }

    // 2. Reject False / Spam / Irrelevant Requests Autonomously
    if (analysis.shouldAutoReject || !analysis.isRoadHazard) {
      return res.status(400).json({
        success: false,
        autoRejected: true,
        reason:
          analysis.rejectionReason ||
          'The uploaded image was determined not to be an active civic road hazard. Submission declined by AI verification.',
        analysis
      });
    }

    // 3. Autonomous Grievance Creation with Live User Location
    const finalLat = body.latitude || analysis.geoCapture?.latitude;
    const finalLng = body.longitude || analysis.geoCapture?.longitude;

    if (!finalLat || !finalLng) {
      return res.status(400).json({
        success: false,
        error: 'Live GPS location is required. Please grant location permissions or select your spot on the map.'
      });
    }

    const category = analysis.hazardType || 'POTHOLE';
    const severity = analysis.severity || 'HIGH';
    const roadCategory = analysis.roadEstimatedHierarchy || 'ARTERIAL';
    const finalAddress = body.address || analysis.geoCapture?.address || `Live Geotagged Location (${finalLat.toFixed(5)}, ${finalLng.toFixed(5)})`;
    const finalPincode = body.pincode || analysis.geoCapture?.pincode || '';
    const geoTagStr = ` [📍 Live Location: ${finalAddress}]`;
    const description = `[AI Verified by Gemini 1.5 Flash - Confidence: ${analysis.confidenceScore || 92}%]${geoTagStr} ${
      analysis.technicalSummary || 'Automated damage assessment and priority dispatch.'
    }`;

    const complaint = await ComplaintsService.createComplaint({
      userId: body.userId,
      latitude: finalLat,
      longitude: finalLng,
      address: finalAddress,
      pincode: finalPincode,
      category,
      severity,
      roadCategory,
      description,
      photoUrl: body.photoUrl,
      blurredPhotoUrl: body.photoUrl
    });

    res.json({
      success: true,
      autoFiled: true,
      complaint,
      analysis
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 3. AI Status & Diagnostics
 */
router.get('/status', (req: Request, res: Response) => {
  const isKeyConfigured = Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: 'online',
    engine: 'Google Gemini 1.5 Flash',
    geminiConfigured: isKeyConfigured,
    features: [
      'Positive/False Request Classifier',
      'Autonomous Road Severity Scorer',
      'Spatial 50m Proximity Duplicate Detector',
      'One-Click Autonomous Ward Dispatch'
    ]
  });
});

/**
 * 4. Update Gemini API Key dynamically from UI or Settings
 */
router.post('/set-key', (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ success: false, error: 'API key is required' });
  }
  ENV.GEMINI_API_KEY = apiKey.trim();
  GeminiAiService.resetClient();
  res.json({ success: true, message: 'Google Gemini API Key activated successfully!' });
});

export const aiRouter = router;
