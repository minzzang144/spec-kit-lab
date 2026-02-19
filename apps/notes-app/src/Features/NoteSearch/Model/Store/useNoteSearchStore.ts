import { create } from 'zustand';
import { createSearchSlice } from './SearchSlice';
import type { SearchSlice } from './SearchSlice';

export const useNoteSearchStore = create<SearchSlice>()((...a) => ({
  ...createSearchSlice(...a),
}));
