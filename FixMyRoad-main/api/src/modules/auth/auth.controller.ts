import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();

const sendOtpSchema = z.object({
  phone: z.string().min(10)
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
  role: z.string().optional()
});

router.post('/send-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = sendOtpSchema.parse(req.body);
    const result = await AuthService.sendOtp(phone);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, code, role } = verifyOtpSchema.parse(req.body);
    const result = await AuthService.verifyOtp(phone, code, role);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

export const authRouter = router;
