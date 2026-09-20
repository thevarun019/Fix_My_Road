import { prisma } from '../../config/prisma';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { addSlaJob } from '../../config/queue';
import { EscalationService } from '../escalation/escalation.service';

export class ComplaintsService {
  /**
   * Generates government standard complaint tracking ID
   * Example: DL-MCD-2026-0842
   */
  static generateComplaintCode(authorityCode: string): string {
    const year = new Date().getFullYear();
    const cleanAuth = (authorityCode || 'GOV').split('-')[0].toUpperCase();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    return `IN-${cleanAuth}-${year}-${randomSeq}`;
  }

  /**
   * Distance calculation between two lat/lng in meters (Haversine formula)
   */
  static getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Priority score calculation (0 - 100)
   */
  static calculatePriority(category: string, severity: string, roadCategory: string): number {
    let score = 20;

    // Severity
    if (severity === 'CRITICAL') score += 40;
    else if (severity === 'HIGH') score += 25;
    else if (severity === 'MEDIUM') score += 15;
    else score += 5;

    // Road classification
    if (roadCategory === 'NATIONAL_HIGHWAY') score += 30;
    else if (roadCategory === 'STATE_HIGHWAY') score += 25;
    else if (roadCategory === 'ARTERIAL') score += 15;
    else score += 5;

    // Hazard type
    if (category === 'CAVE_IN' || category === 'POTHOLE') score += 10;
    if (category === 'WATERLOGGING') score += 8;

    return Math.min(100, score);
  }

  static async createComplaint(data: {
    userId?: string;
    latitude: number;
    longitude: number;
    address: string;
    pincode?: string;
    category: string;
    severity: string;
    roadCategory: string;
    description?: string;
    photoUrl: string;
    blurredPhotoUrl?: string;
  }) {
    // 1. Resolve Jurisdiction & Authority
    const routing = await JurisdictionService.resolveJurisdictionAndAuthority(
      data.latitude,
      data.longitude,
      data.roadCategory,
      data.severity
    );

    // 2. Check for duplicates nearby (within 30 meters filed in last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const nearbyComplaints = await prisma.complaint.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        status: { notIn: ['RESOLVED', 'REJECTED'] }
      }
    });

    let dedupClusterId: string | null = null;
    for (const nearby of nearbyComplaints) {
      const dist = this.getDistanceMeters(data.latitude, data.longitude, nearby.latitude, nearby.longitude);
      if (dist <= 30) {
        dedupClusterId = nearby.dedupClusterId || nearby.id;
        break;
      }
    }

    // 3. Calculate SLA deadlines
    const slaHours = routing.estimatedSlaHours;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    const priorityScore = this.calculatePriority(data.category, data.severity, data.roadCategory);
    const complaintCode = this.generateComplaintCode(routing.authority?.code || 'PWD');

    // 4. Create in Database
    const complaint = await prisma.complaint.create({
      data: {
        complaintCode,
        userId: data.userId || null,
        authorityId: routing.authority?.id || null,
        jurisdictionId: routing.jurisdiction?.id || null,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        pincode: data.pincode,
        category: data.category,
        severity: data.severity,
        roadCategory: data.roadCategory,
        description: data.description,
        photoUrl: data.photoUrl,
        blurredPhotoUrl: data.blurredPhotoUrl || data.photoUrl,
        status: 'SUBMITTED',
        priorityScore,
        slaHours,
        slaDeadline,
        slaBreached: false,
        escalationLevel: 0,
        assignedOfficerName: routing.authority?.nodalOfficerName || 'Ward Junior Engineer',
        assignedOfficerPhone: routing.authority?.nodalPhone || '011-23225200',
        dedupClusterId: dedupClusterId || undefined,
        auditLogs: {
          create: {
            action: 'CREATED',
            actorType: 'CITIZEN',
            actorId: data.userId || 'anonymous',
            details: JSON.stringify({
              priorityScore,
              slaHours,
              assignedAuthority: routing.authority?.name
            })
          }
        }
      },
      include: {
        authority: true,
        jurisdiction: true,
        auditLogs: true
      }
    });

    // 5. Schedule SLA timer check in queue
    const warningMs = Math.max(0, (slaHours - 6) * 60 * 60 * 1000);
    const deadlineMs = slaHours * 60 * 60 * 1000;
    await addSlaJob('sla-warning', { complaintId: complaint.id }, warningMs);
    await addSlaJob('sla-breached', { complaintId: complaint.id }, deadlineMs);

    return complaint;
  }

  static async getComplaintByCode(code: string): Promise<any> {
    const complaint = await prisma.complaint.findUnique({
      where: { complaintCode: code.toUpperCase() },
      include: {
        authority: true,
        jurisdiction: true,
        escalations: {
          orderBy: { escalatedAt: 'desc' }
        },
        auditLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!complaint) {
      throw new Error(`Complaint with tracking ID ${code} not found`);
    }

    // Auto-escalate if SLA deadline passed and not yet resolved
    if (
      complaint.status !== 'RESOLVED' &&
      complaint.status !== 'VERIFIED' &&
      new Date(complaint.slaDeadline).getTime() < Date.now() &&
      complaint.escalationLevel === 0
    ) {
      await EscalationService.escalateComplaint(
        complaint.id,
        'Statutory SLA deadline elapsed without Local Authority resolution - Escalated to Central Command Center'
      );
      return this.getComplaintByCode(code);
    }

    // Dynamic remaining SLA calculation
    const now = Date.now();
    let remainingMs = new Date(complaint.slaDeadline).getTime() - now;
    if (complaint.slaPaused && typeof complaint.slaRemainingSeconds === 'number') {
      remainingMs = complaint.slaRemainingSeconds * 1000;
    }
    const isBreached = complaint.status !== 'RESOLVED' && complaint.status !== 'VERIFIED' && remainingMs < 0;

    return {
      ...complaint,
      slaRemainingSeconds: Math.max(0, Math.floor(remainingMs / 1000)),
      isBreached: isBreached || complaint.slaBreached,
      custodyTier: (complaint.escalationLevel > 0 || isBreached || complaint.slaBreached)
        ? 'COMMAND_CENTER'
        : 'LOCAL_AUTHORITY'
    };
  }

  static async listComplaints(filters: {
    status?: string;
    authorityId?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    tier?: 'escalated' | 'local' | 'all' | string;
  }) {
    // Proactively sweep overdue complaints before listing so tier state is always up to date
    try {
      await EscalationService.sweepOverdueComplaints();
    } catch (e) {
      // pass
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.authorityId) where.authorityId = filters.authorityId;
    if (filters.category) where.category = filters.category;

    // 2-Tier Routing Filter:
    // 'escalated': ONLY cases that breached local authority SLA / escalated to Command Center
    // 'local': Fresh complaints in local authority custody within SLA
    if (filters.tier === 'escalated') {
      where.OR = [
        { escalationLevel: { gt: 0 } },
        { slaBreached: true }
      ];
    } else if (filters.tier === 'local') {
      where.escalationLevel = 0;
      where.slaBreached = false;
    }

    if (filters.search) {
      const searchCondition = [
        { complaintCode: { contains: filters.search } },
        { address: { contains: filters.search } }
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchCondition }];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
    }

    const [items, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        orderBy: [{ priorityScore: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          authority: true,
          jurisdiction: true
        }
      }),
      prisma.complaint.count({ where })
    ]);

    return {
      items: items.map(c => ({
        ...c,
        custodyTier: (c.escalationLevel > 0 || c.slaBreached || (c.status !== 'RESOLVED' && c.status !== 'VERIFIED' && new Date(c.slaDeadline).getTime() < Date.now()))
          ? 'COMMAND_CENTER'
          : 'LOCAL_AUTHORITY'
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async forceEscalateComplaint(id: string, reason?: string) {
    return EscalationService.escalateComplaint(
      id,
      reason || 'Local Authority resolution window expired without action. Escalated to Central Command Center.'
    );
  }

  static async updateStatus(
    id: string,
    data: {
      status: string;
      inProgressPhotoUrl?: string;
      resolutionPhotoUrl?: string;
      resolutionRemarks?: string;
      actorName?: string;
      actorType?: string;
    }
  ) {
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new Error('Complaint not found');

    const isResolved = data.status === 'RESOLVED' || data.status === 'VERIFIED';
    const isInProgress = data.status === 'IN_PROGRESS';

    let slaPaused = complaint.slaPaused;
    let slaPausedAt = complaint.slaPausedAt;
    let slaRemainingSeconds = complaint.slaRemainingSeconds;

    if (isInProgress) {
      slaPaused = true;
      slaPausedAt = new Date();
      // Freeze the remaining seconds at the moment in-progress work begins
      const remainingMs = new Date(complaint.slaDeadline).getTime() - Date.now();
      slaRemainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    } else if (isResolved) {
      slaPaused = false;
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status: data.status,
        inProgressPhotoUrl: data.inProgressPhotoUrl || complaint.inProgressPhotoUrl,
        resolutionPhotoUrl: data.resolutionPhotoUrl || complaint.resolutionPhotoUrl,
        resolutionRemarks: data.resolutionRemarks || complaint.resolutionRemarks,
        resolvedAt: isResolved ? new Date() : complaint.resolvedAt,
        slaPaused,
        slaPausedAt,
        slaRemainingSeconds,
        auditLogs: {
          create: {
            action: `STATUS_${data.status}`,
            actorType: data.actorType || 'OFFICER',
            actorId: data.actorName || 'officer',
            details: JSON.stringify({
              remarks: data.resolutionRemarks,
              hasInProgressPhoto: !!data.inProgressPhotoUrl,
              hasResolutionPhoto: !!data.resolutionPhotoUrl,
              slaPaused
            })
          }
        }
      },
      include: {
        authority: true,
        jurisdiction: true,
        auditLogs: true
      }
    });

    return updated;
  }

  static async issueShowCause(id: string, reason: string, officerName?: string) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { authority: true }
    });
    if (!complaint) throw new Error('Complaint not found');

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        auditLogs: {
          create: {
            action: 'SHOW_CAUSE_ISSUED',
            actorType: 'COMMAND_CENTER',
            actorId: officerName || 'Central Command Controller',
            details: JSON.stringify({
              reason,
              notifiedAuthority: complaint.authority?.name,
              issuedAt: new Date().toISOString()
            })
          }
        }
      },
      include: { authority: true, jurisdiction: true, auditLogs: true, escalations: true }
    });

    return updated;
  }

  static async reassignAuthority(id: string, authorityCode: string, officerName?: string) {
    const authority = await prisma.authority.findUnique({
      where: { code: authorityCode }
    });
    if (!authority) throw new Error(`Authority ${authorityCode} not found`);

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        authorityId: authority.id,
        auditLogs: {
          create: {
            action: 'AUTHORITY_REASSIGNED',
            actorType: 'COMMAND_CENTER',
            actorId: officerName || 'Central Command Controller',
            details: JSON.stringify({
              newAuthority: authority.name,
              reassignedAt: new Date().toISOString()
            })
          }
        }
      },
      include: { authority: true, jurisdiction: true, auditLogs: true, escalations: true }
    });

    return updated;
  }

  static async citizenFeedback(id: string, data: { rating: number; feedback?: string; verified: boolean }) {
    return prisma.complaint.update({
      where: { id },
      data: {
        citizenRating: data.rating,
        citizenFeedback: data.feedback,
        citizenVerified: data.verified,
        status: data.verified ? 'VERIFIED' : 'IN_PROGRESS',
        auditLogs: {
          create: {
            action: data.verified ? 'CITIZEN_VERIFIED' : 'CITIZEN_REOPENED',
            actorType: 'CITIZEN',
            details: JSON.stringify({ rating: data.rating, feedback: data.feedback })
          }
        }
      }
    });
  }
}
