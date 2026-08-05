import { create } from 'zustand';
import { ExtraHourRecord, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../services/settingsService';

interface ExtraHoursState {
  records: ExtraHourRecord[];
  settings: UserSettings;
  isLoading: boolean;
  selectedDate: string | null; // For day details modal
  isDayModalOpen: boolean;
  isQuickAddOpen: boolean;
  isRateModalOpen: boolean;
  editingRecord: ExtraHourRecord | null;
  searchQuery: string;

  setRecords: (records: ExtraHourRecord[]) => void;
  setSettings: (settings: UserSettings) => void;
  setIsLoading: (isLoading: boolean) => void;
  openDayModal: (dateStr: string, recordToEdit?: ExtraHourRecord) => void;
  closeDayModal: () => void;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  openRateModal: () => void;
  closeRateModal: () => void;
  setSearchQuery: (query: string) => void;
}

export const useExtraHoursStore = create<ExtraHoursState>((set) => ({
  records: [],
  settings: { ...DEFAULT_SETTINGS, userId: '', updatedAt: '' },
  isLoading: true,
  selectedDate: null,
  isDayModalOpen: false,
  isQuickAddOpen: false,
  isRateModalOpen: false,
  editingRecord: null,
  searchQuery: '',

  setRecords: (records) => set({ records }),
  setSettings: (settings) => set({ settings }),
  setIsLoading: (isLoading) => set({ isLoading }),

  openDayModal: (dateStr, recordToEdit) =>
    set({
      selectedDate: dateStr,
      editingRecord: recordToEdit || null,
      isDayModalOpen: true,
    }),

  closeDayModal: () =>
    set({
      selectedDate: null,
      editingRecord: null,
      isDayModalOpen: false,
    }),

  openQuickAdd: () => set({ isQuickAddOpen: true }),
  closeQuickAdd: () => set({ isQuickAddOpen: false }),

  openRateModal: () => set({ isRateModalOpen: true }),
  closeRateModal: () => set({ isRateModalOpen: false }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
