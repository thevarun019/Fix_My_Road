import React, { useState } from 'react';
import { Step1Photo } from './Step1Photo';
import { Step2Location } from './Step2Location';
import { Step3Describe } from './Step3Describe';
import { Step4Confirm } from './Step4Confirm';
import { Success } from './Success';
import { useDraftStore } from '../../stores/draftStore';
import { Camera, MapPin, Tag, CheckSquare } from 'lucide-react';

export const ReportWizard: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [submittedComplaint, setSubmittedComplaint] = useState<any>(null);
  const { resetDraft } = useDraftStore();

  const steps = [
    { num: 1, label: 'Photo', icon: Camera },
    { num: 2, label: 'Location', icon: MapPin },
    { num: 3, label: 'Details', icon: Tag },
    { num: 4, label: 'Review SLA', icon: CheckSquare }
  ];

  const handleSuccess = (complaint: any) => {
    setSubmittedComplaint(complaint);
    setStep(5); // Success step
  };

  const handleReset = () => {
    resetDraft();
    setSubmittedComplaint(null);
    setStep(1);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step Progress Indicators */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0" />
            <div
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-saffron transition-all duration-300 z-0"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isCompleted = step > s.num;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                      isActive
                        ? 'bg-saffron text-white ring-4 ring-orange-200'
                        : isCompleted
                        ? 'bg-navy text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-1.5 hidden sm:block ${
                      isActive ? 'text-saffron-dark' : isCompleted ? 'text-navy' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Wizard Step Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl">
        {step === 1 && <Step1Photo onNext={() => setStep(2)} onAutonomousSubmit={handleSuccess} />}
        {step === 2 && <Step2Location onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3Describe onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <Step4Confirm onSuccess={handleSuccess} onBack={() => setStep(3)} />}
        {step === 5 && submittedComplaint && (
          <Success complaint={submittedComplaint} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};
