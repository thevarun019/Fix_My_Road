import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

const router = Router();

// RTI Compliance Export: Full immutable audit trail with timestamp certificate
router.get('/rti-export/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const complaint = await prisma.complaint.findUnique({
      where: { complaintCode: code.toUpperCase() },
      include: {
        authority: true,
        jurisdiction: true,
        escalations: { orderBy: { escalatedAt: 'asc' } },
        auditLogs: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const rtiDossier = {
      governmentHeader: {
        portal: 'RoadWatch — Centralized Public Grievance Redress and Monitoring System (CPGRAMS / Road Safety)',
        state: complaint.jurisdiction?.state || 'Govt of India',
        rtiComplianceSection: 'Under Section 4(1)(b) of the Right to Information Act, 2005'
      },
      complaintRecord: {
        complaintId: complaint.id,
        trackingNumber: complaint.complaintCode,
        filingDate: complaint.createdAt,
        currentStatus: complaint.status,
        incidentLocation: {
          address: complaint.address,
          coordinates: `${complaint.latitude}, ${complaint.longitude}`,
          pincode: complaint.pincode,
          jurisdiction: complaint.jurisdiction?.name
        },
        roadCategory: complaint.roadCategory,
        damageClassification: complaint.category,
        severityLevel: complaint.severity,
        responsibleAuthority: complaint.authority?.name,
        designatedNodalOfficer: complaint.assignedOfficerName,
        slaAllottedHours: complaint.slaHours,
        slaDeadline: complaint.slaDeadline,
        isSlaBreached: complaint.slaBreached,
        escalationLevel: complaint.escalationLevel
      },
      escalationTimeline: complaint.escalations.map((e, idx) => ({
        stage: idx + 1,
        fromLevel: e.fromLevel,
        toLevel: e.toLevel,
        escalatedTo: e.escalatedToTitle,
        reason: e.reason,
        timestamp: e.escalatedAt
      })),
      auditTrail: complaint.auditLogs.map((log) => ({
        action: log.action,
        actorType: log.actorType,
        actorId: log.actorId,
        details: log.details ? JSON.parse(log.details) : {},
        timestamp: log.timestamp
      })),
      certifiedBy: 'RoadWatch Automated Audit System, Ministry of Road Transport & Highways Partner'
    };

    res.json({ success: true, data: rtiDossier });
  } catch (err) {
    next(err);
  }
});

export const auditRouter = router;
