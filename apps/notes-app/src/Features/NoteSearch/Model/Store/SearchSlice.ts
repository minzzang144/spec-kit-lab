import type { StateCreator } from 'zustand';

export type SearchSlice = {
  keyword: string;
  setKeyword: (keyword: string) => void;
  clearKeyword: () => void;
};

export const createSearchSlice: StateCreator<SearchSlice> = (set) => ({
  keyword: '',
  setKeyword: (keyword) => set({ keyword }),
  clearKeyword: () => set({ keyword: '' }),
});
