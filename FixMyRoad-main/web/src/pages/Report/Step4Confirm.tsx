import React, { useState } from 'react';
import { useDraftStore } from '../../stores/draftStore';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { saveDraftOffline } from '../../lib/idb';
import { useOnline } from '../../hooks/useOnline';
import { Building2, Clock, ShieldAlert, ArrowUpRight, Send, CheckCircle2 } from 'lucide-react';

interface Step4ConfirmProps {
  onSuccess: (complaint: any) => void;
  onBack: () => void;
}

export const Step4Confirm: React.FC<Step4ConfirmProps> = ({ onSuccess, onBack }) => {
  const { t } = useTranslation();
  const { draft } = useDraftStore();
  const isOnline = useOnline();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authority and SLA computation
  let authorityName = 'Local Municipal Authority / Urban Local Body';
  let authorityCode = 'ULB';
  let slaHours = 48;
  let escalationTarget = 'Assistant Executive Engineer (AEE), Local Division';

  if (draft.roadCategory === 'NATIONAL_HIGHWAY') {
    authorityName = 'National Highways Authority of India (NHAI)';
    authorityCode = 'NHAI';
    slaHours = draft.severity === 'CRITICAL' ? 12 : 24;
    escalationTarget = 'Project Director (NHAI Regional Corridor)';
  } else if (draft.roadCategory === 'STATE_HIGHWAY') {
    authorityName = 'State Public Works Department (PWD)';
    authorityCode = 'PWD';
    slaHours = draft.severity === 'CRITICAL' ? 24 : 48;
    escalationTarget = 'Executive Engineer (Road Maintenance Division)';
  } else {
    slaHours = draft.severity === 'CRITICAL' ? 24 : draft.severity === 'HIGH' ? 48 : 72;
  }

  const handleSubmit = async () => {
    if (!draft.latitude || !draft.longitude) {
      setError('Live GPS coordinates are required. Please go back to Step 2 and confirm your live location.');
      return;
    }

    if (!draft.address) {
      setError('Road address is required. Please verify location details.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      latitude: draft.latitude,
      longitude: draft.longitude,
      address: draft.address,
      pincode: draft.pincode,
      category: draft.category,
      severity: draft.severity,
      roadCategory: draft.roadCategory,
      description: draft.description,
      photoUrl: draft.photoDataUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600'
    };

    try {
      if (!isOnline) {
        // Save to IndexedDB offline storage
        const offlineId = `OFFLINE-${Date.now()}`;
        await saveDraftOffline({
          id: offlineId,
          ...payload,
          photoDataUrl: draft.photoDataUrl || ''
        });

        onSuccess({
          complaintCode: `IN-${authorityCode}-OFFLINE`,
          status: 'STORED_OFFLINE',
          slaHours,
          slaDeadline: new Date(Date.now() + slaHours * 3600 * 1000).toISOString(),
          address: draft.address,
          category: draft.category,
          authority: { name: authorityName },
          isOffline: true
        });
        return;
      }

      const res = await apiRequest('/complaints', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      onSuccess(res.data);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError(err.message || 'Failed to submit complaint. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-navy">{t('step4_title')}</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">{t('step4_sub')}</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
          {error}
        </div>
      )}

      {/* Target Authority & SLA Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
          <div className="flex items-center space-x-2 text-navy text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{t('assigned_authority')} (Tier 1)</span>
          </div>
          <p className="text-sm font-black text-navy">{authorityName}</p>
          <span className="text-[11px] text-gray-600 mt-1 block">
            Direct dispatch to local field engineer
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl">
          <div className="flex items-center space-x-2 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{t('sla_timeframe')}</span>
          </div>
          <p className="text-2xl font-black text-amber-900">{slaHours} Hours</p>
          <span className="text-[11px] text-amber-800 font-medium block">
            Local authority resolution deadline
          </span>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
          <div className="flex items-center space-x-2 text-purple-900 text-xs font-bold uppercase tracking-wider mb-1">
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
            <span>Command Center Escalation (Tier 2)</span>
          </div>
          <p className="text-xs font-bold text-purple-900 leading-snug">National Command Center &amp; Ministry HQ</p>
          <span className="text-[11px] text-purple-700 mt-1 block">
            Automatic escalation only if local authority fails to act within SLA
          </span>
        </div>
      </div>

      {/* Complaint Summary Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
          Grievance Summary
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          {draft.photoDataUrl && (
            <img
              src={draft.photoDataUrl}
              alt="Road damage preview"
              className="w-full sm:w-36 h-28 object-cover rounded-xl border border-gray-200 shadow-sm"
            />
          )}
          <div className="space-y-1.5 text-xs text-gray-700 flex-1">
            <div>
              <span className="font-bold text-gray-900">Hazard: </span>
              <span>{draft.category} ({draft.severity})</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">Road Type: </span>
              <span>{draft.roadCategory.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">Location: </span>
              <span>{draft.address} (PIN: {draft.pincode})</span>
            </div>
            {draft.description && (
              <div>
                <span className="font-bold text-gray-900">Remarks: </span>
                <span className="italic">{draft.description}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="py-3 px-6 rounded-xl font-bold text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="py-3.5 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-saffron to-saffron-dark hover:from-saffron-dark hover:to-orange-700 text-white shadow-lg flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? t('submitting') : t('submit_complaint')}</span>
        </button>
      </div>
    </div>
  );
};
