import type { StateCreator } from 'zustand';
import type { FilterState } from '../../Type';

export type FilterSlice = FilterState & {
  setSelectedCategoryId: (id: string) => void;
};

export const createFilterSlice: StateCreator<FilterSlice> = (set) => ({
  selectedCategoryId: 'all',
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
});
