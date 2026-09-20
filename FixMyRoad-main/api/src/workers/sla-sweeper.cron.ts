import { EscalationService } from '../modules/escalation/escalation.service';
import { localEventBus } from '../config/queue';

export function startSlaWorkers() {
  console.log('[SLA Engine] Initializing background SLA watchers & sweeper...');

  // In-process event bus triggers
  localEventBus.on('sla-warning', async ({ complaintId }) => {
    console.log(`[SLA Warning Event] Complaint ${complaintId} is nearing SLA deadline.`);
  });

  localEventBus.on('sla-breached', async ({ complaintId }) => {
    console.log(`[SLA Breached Event] Complaint ${complaintId} has exceeded SLA timeframe.`);
    await EscalationService.escalateComplaint(complaintId, 'SLA timer fired breach event');
  });

  // Background interval sweeper (runs every 60 seconds)
  setInterval(async () => {
    try {
      const escalatedCount = await EscalationService.sweepOverdueComplaints();
      if (escalatedCount > 0) {
        console.log(`[SLA Sweeper] Auto-escalated ${escalatedCount} overdue complaints.`);
      }
    } catch (err: any) {
      console.error('[SLA Sweeper Error]', err.message);
    }
  }, 60 * 1000);
}
