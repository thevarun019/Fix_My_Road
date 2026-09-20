import React from 'react';
import { CategoryChip } from '../../components/CategoryChip';
import { useDraftStore } from '../../stores/draftStore';
import { useTranslation } from 'react-i18next';

interface Step3DescribeProps {
  onNext: () => void;
  onBack: () => void;
}

export const Step3Describe: React.FC<Step3DescribeProps> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const { draft, setDraft } = useDraftStore();

  const categories = [
    { id: 'POTHOLE', label: t('category_pothole'), icon: '🕳️', sub: 'Deep crater or depression' },
    { id: 'CRACK', label: t('category_crack'), icon: '⚡', sub: 'Long structural fissures' },
    { id: 'BROKEN_SURFACE', label: t('category_broken'), icon: '🧱', sub: 'Crumbled asphalt / gravel' },
    { id: 'WATERLOGGING', label: t('category_water'), icon: '🌊', sub: 'Standing water hazard' },
    { id: 'CAVE_IN', label: t('category_cavein'), icon: '⚠️', sub: 'Severe collapse / sinking' }
  ];

  const severities = [
    { id: 'CRITICAL', label: t('severity_critical'), sub: 'SLA: 12-24h (Immediate danger to 2-wheelers)' },
    { id: 'HIGH', label: t('severity_high'), sub: 'SLA: 24-48h (Substantial vehicle hazard)' },
    { id: 'MEDIUM', label: t('severity_medium'), sub: 'SLA: 48-72h (Moderate surface wear)' },
    { id: 'LOW', label: t('severity_low'), sub: 'SLA: 72-120h (Minor cosmetic issue)' }
  ];

  const roadTypes = [
    { id: 'NATIONAL_HIGHWAY', label: t('road_nh'), auth: 'Routes to NHAI' },
    { id: 'STATE_HIGHWAY', label: t('road_sh'), auth: 'Routes to State PWD' },
    { id: 'ARTERIAL', label: t('road_arterial'), auth: 'Routes to PWD / Municipal Corp' },
    { id: 'RESIDENTIAL', label: t('road_residential'), auth: 'Routes to Ward Local Body' }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-navy">{t('step3_title')}</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">{t('step3_sub')}</p>
      </div>

      {/* AI Recommendation Banner if available */}
      {draft.aiAnalysis && draft.aiAnalysis.isRoadHazard && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
              ✨ GEMINI AI SUGGESTION
            </span>
            <span className="font-bold text-emerald-950">
              {draft.aiAnalysis.confidenceScore}% Confidence Assessment
            </span>
          </div>
          <p className="text-emerald-900 font-medium">
            AI evaluated your photo and pre-selected <strong>{draft.aiAnalysis.hazardType}</strong> at{' '}
            <strong>{draft.aiAnalysis.severity}</strong> severity. Feel free to modify below if needed.
          </p>
        </div>
      )}

      {/* 1. Hazard Type */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
          1. Hazard Type (खराबी का प्रकार)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.label}
              icon={c.icon}
              subtext={c.sub}
              selected={draft.category === c.id}
              onClick={() => setDraft({ category: c.id })}
            />
          ))}
        </div>
      </div>

      {/* 2. Road Hierarchy */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
          2. Road Classification (सड़क का प्रकार)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roadTypes.map((r) => (
            <CategoryChip
              key={r.id}
              label={r.label}
              subtext={r.auth}
              selected={draft.roadCategory === r.id}
              onClick={() => setDraft({ roadCategory: r.id })}
            />
          ))}
        </div>
      </div>

      {/* 3. Hazard Severity */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
          3. Urgency / Hazard Severity (गंभीरता)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {severities.map((s) => (
            <CategoryChip
              key={s.id}
              label={s.label}
              subtext={s.sub}
              selected={draft.severity === s.id}
              onClick={() => setDraft({ severity: s.id })}
            />
          ))}
        </div>
      </div>

      {/* 4. Optional Description */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
          Additional Remarks / Landmark Notes (Optional)
        </label>
        <textarea
          rows={2}
          value={draft.description}
          onChange={(e) => setDraft({ description: e.target.value })}
          placeholder="e.g. Sharp edges causing skidding; right after the flyover ramp"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-saffron focus:border-saffron"
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-6 rounded-xl font-bold text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="py-3 px-8 rounded-xl font-bold text-sm bg-saffron hover:bg-saffron-dark text-white shadow-md"
        >
          Next: Review SLA & Confirm (समीक्षा) →
        </button>
      </div>
    </div>
  );
};
