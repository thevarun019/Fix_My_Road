import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorities = await prisma.authority.findMany({
      include: {
        _count: {
          select: { complaints: true }
        }
      }
    });
    res.json({ success: true, data: authorities });
  } catch (err) {
    next(err);
  }
});

router.get('/jurisdictions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jurisdictions = await prisma.jurisdiction.findMany();
    res.json({ success: true, data: jurisdictions });
  } catch (err) {
    next(err);
  }
});

export const authoritiesRouter = router;
