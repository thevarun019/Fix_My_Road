import { Router, Request, Response, NextFunction } from 'express';
import { ComplaintsService } from './complaints.service';
import { optionalAuth, requireAuth, requireRole, AuthenticatedRequest } from '../../middleware/auth';
import { prisma } from '../../config/prisma';
import { z } from 'zod';

const router = Router();

const createComplaintSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(3),
  pincode: z.string().optional(),
  category: z.string().default('POTHOLE'),
  severity: z.string().default('MEDIUM'),
  roadCategory: z.string().default('ARTERIAL'),
  description: z.string().optional(),
  photoUrl: z.string(),
  blurredPhotoUrl: z.string().optional()
});

router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = createComplaintSchema.parse(req.body);
    const result = await ComplaintsService.createComplaint({
      ...data,
      userId: req.user?.id
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/track/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const complaint = await ComplaintsService.getComplaintByCode(code);
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, authorityId, category, search, page, limit, tier } = req.query;
    const result = await ComplaintsService.listComplaints({
      status: status as string,
      authorityId: authorityId as string,
      category: category as string,
      search: search as string,
      tier: tier as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/escalate', requireRole(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await ComplaintsService.forceEscalateComplaint(
      id,
      reason || `Manual / SLA Timeout Trigger: Grievance escalated to Central Command Center`
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/show-cause', requireRole(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await ComplaintsService.issueShowCause(
      id,
      reason || 'Non-compliance with statutory SLA turnaround deadlines.',
      req.user?.phone || 'Central Command Controller'
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/reassign', requireRole(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { authorityCode } = req.body;
    const result = await ComplaintsService.reassignAuthority(
      id,
      authorityCode,
      req.user?.phone || 'Central Command Controller'
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/heatmap', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const points = await prisma.complaint.findMany({
      select: {
        id: true,
        complaintCode: true,
        latitude: true,
        longitude: true,
        category: true,
        severity: true,
        status: true,
        address: true,
        createdAt: true
      }
    });
    res.json({ success: true, data: points });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', requireRole(['OFFICER', 'ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, inProgressPhotoUrl, resolutionPhotoUrl, resolutionRemarks } = req.body;
    const updated = await ComplaintsService.updateStatus(id, {
      status,
      inProgressPhotoUrl,
      resolutionPhotoUrl,
      resolutionRemarks,
      actorName: req.user?.phone || 'Field Officer',
      actorType: req.user?.role || 'OFFICER'
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rating, feedback, verified } = req.body;
    const result = await ComplaintsService.citizenFeedback(id, {
      rating: Number(rating),
      feedback,
      verified: Boolean(verified)
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export const complaintsRouter = router;
