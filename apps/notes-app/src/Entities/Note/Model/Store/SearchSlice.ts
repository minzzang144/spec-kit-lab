import type { StateCreator } from 'zustand';

export type SearchSlice = {
  keyword: string;
};

export const createSearchSlice: StateCreator<SearchSlice> = () => ({
  keyword: '',
});
