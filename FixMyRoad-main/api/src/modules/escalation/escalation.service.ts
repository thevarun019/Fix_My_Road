import { prisma } from '../../config/prisma';

export class EscalationService {
  static getEscalationDesignation(level: number): string {
    switch (level) {
      case 0:
        return 'Junior Engineer (Local Authority Field Control)';
      case 1:
        return 'Command Center / Assistant Executive Engineer (Sub-Division)';
      case 2:
        return 'Command Center / Superintending Engineer (Circle/District)';
      case 3:
      default:
        return 'National Command Center / Chief Engineer (Ministry Level)';
    }
  }

  static async escalateComplaint(complaintId: string, reason: string = 'Local Authority SLA resolution deadline breached'): Promise<any> {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { authority: true }
    });

    if (!complaint) return null;
    if (complaint.status === 'RESOLVED' || complaint.status === 'VERIFIED') return null;

    const currentLevel = complaint.escalationLevel;
    const nextLevel = Math.min(3, currentLevel + 1);
    const designatedOfficerTitle = this.getEscalationDesignation(nextLevel);

    const [updatedComplaint, log] = await prisma.$transaction([
      prisma.complaint.update({
        where: { id: complaintId },
        data: {
          escalationLevel: nextLevel,
          slaBreached: true,
          assignedOfficerName: `${designatedOfficerTitle} - ${complaint.authority?.code || 'Local Authority'}`,
          auditLogs: {
            create: {
              action: `ESCALATED_TO_COMMAND_CENTER_L${nextLevel}`,
              actorType: 'SYSTEM',
              details: JSON.stringify({
                reason,
                escalatedTo: designatedOfficerTitle,
                previousLevel: currentLevel,
                transferredToCommandCenter: true
              })
            }
          }
        }
      }),
      prisma.escalationLog.create({
        data: {
          complaintId,
          fromLevel: currentLevel,
          toLevel: nextLevel,
          reason,
          escalatedToTitle: designatedOfficerTitle
        }
      })
    ]);

    console.log(`[COMMAND CENTER ESCALATION] Complaint ${complaint.complaintCode} escalated to Level ${nextLevel}: ${designatedOfficerTitle}`);

    return { updatedComplaint, log };
  }

  static async sweepOverdueComplaints(): Promise<number> {
    const now = new Date();
    const overdue = await prisma.complaint.findMany({
      where: {
        status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] },
        slaDeadline: { lt: now },
        escalationLevel: { lt: 3 }
      }
    });

    let count = 0;
    for (const c of overdue) {
      await this.escalateComplaint(c.id, 'Automated Cron Sweeper: SLA overdue');
      count++;
    }

    return count;
  }
}
