import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

const router = Router();

router.get('/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();

    const [
      totalComplaints,
      resolvedComplaints,
      inProgressComplaints,
      submittedComplaints,
      commandCenterEscalatedCount,
      localAuthorityActiveCount,
      criticalCount,
      authorities
    ] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: { in: ['RESOLVED', 'VERIFIED'] } } }),
      prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.complaint.count({ where: { status: 'SUBMITTED' } }),
      prisma.complaint.count({
        where: {
          OR: [
            { escalationLevel: { gt: 0 } },
            { slaBreached: true }
          ],
          status: { notIn: ['RESOLVED', 'VERIFIED'] }
        }
      }),
      prisma.complaint.count({
        where: {
          escalationLevel: 0,
          slaBreached: false,
          status: { in: ['SUBMITTED', 'IN_PROGRESS'] }
        }
      }),
      prisma.complaint.count({ where: { severity: 'CRITICAL' } }),
      prisma.authority.findMany({
        include: {
          _count: {
            select: { complaints: true }
          }
        }
      })
    ]);

    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

    res.json({
      success: true,
      data: {
        totalComplaints,
        resolvedComplaints,
        inProgressComplaints,
        submittedComplaints,
        breachedCount: commandCenterEscalatedCount,
        commandCenterEscalatedCount,
        localAuthorityActiveCount,
        criticalCount,
        resolutionRate,
        authoritiesCount: authorities.length
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorities = await prisma.authority.findMany({
      include: {
        complaints: {
          select: {
            id: true,
            status: true,
            slaBreached: true,
            priorityScore: true,
            createdAt: true,
            resolvedAt: true
          }
        }
      }
    });

    const leaderboard = authorities.map((auth) => {
      const total = auth.complaints.length;
      const resolved = auth.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'VERIFIED').length;
      const breached = auth.complaints.filter(c => c.slaBreached).length;
      const onTime = resolved - breached;
      const onTimeRate = total > 0 ? Math.round((Math.max(0, onTime) / total) * 100) : 100;
      const score = Math.max(0, Math.min(100, Math.round(onTimeRate * 0.7 + (total > 0 ? (resolved / total) * 30 : 30))));

      return {
        id: auth.id,
        code: auth.code,
        name: auth.name,
        nameHi: auth.nameHi,
        type: auth.type,
        totalComplaints: total,
        resolvedComplaints: resolved,
        breachedComplaints: breached,
        score,
        badge: score >= 85 ? 'EXEMPLARY' : score >= 70 ? 'GOOD' : 'NEEDS_ATTENTION'
      };
    }).sort((a, b) => b.score - a.score);

    res.json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
});

router.get('/escalations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const escalations = await prisma.complaint.findMany({
      where: {
        OR: [
          { escalationLevel: { gt: 0 } },
          { slaBreached: true }
        ],
        status: { notIn: ['RESOLVED', 'VERIFIED'] }
      },
      orderBy: [{ escalationLevel: 'desc' }, { slaDeadline: 'asc' }],
      include: {
        authority: true,
        jurisdiction: true,
        escalations: { orderBy: { escalatedAt: 'desc' } }
      }
    });

    res.json({ success: true, data: escalations });
  } catch (err) {
    next(err);
  }
});

router.post('/escalations/:id/directive', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { directive, officerNote } = req.body;

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    await prisma.auditLog.create({
      data: {
        complaintId: id,
        action: 'COMMAND_CENTER_DIRECTIVE_ISSUED',
        actorType: 'SUPER_ADMIN',
        actorId: 'National Command Desk',
        details: JSON.stringify({
          directive: directive || 'Show Cause Notice: Explain SLA Breach to Ministry',
          officerNote: officerNote || 'HQ priority intervention dispatched',
          timestamp: new Date()
        })
      }
    });

    res.json({ success: true, message: 'Executive directive registered and dispatched to field division.' });
  } catch (err) {
    next(err);
  }
});

export const dashboardRouter = router;
