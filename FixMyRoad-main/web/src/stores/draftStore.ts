import { create } from 'zustand';

export interface ReportDraft {
  photoBlob: Blob | null;
  photoDataUrl: string | null;
  photoSizeKb: number;
  blurredPhotoUrl?: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  pincode: string;
  category: string;
  severity: string;
  roadCategory: string;
  description: string;
  detectedDamage?: any;
  aiAnalysis?: any;
}

interface DraftState {
  draft: ReportDraft;
  setDraft: (partial: Partial<ReportDraft>) => void;
  resetDraft: () => void;
}

const initialDraft: ReportDraft = {
  photoBlob: null,
  photoDataUrl: null,
  photoSizeKb: 0,
  latitude: null,
  longitude: null,
  address: '',
  pincode: '',
  category: 'POTHOLE',
  severity: 'HIGH',
  roadCategory: 'ARTERIAL',
  description: ''
};

export const useDraftStore = create<DraftState>((set) => ({
  draft: initialDraft,
  setDraft: (partial) =>
    set((state) => ({ draft: { ...state.draft, ...partial } })),
  resetDraft: () => set({ draft: initialDraft })
}));
