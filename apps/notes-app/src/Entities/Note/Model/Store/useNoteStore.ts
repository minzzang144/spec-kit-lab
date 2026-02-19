import { create } from 'zustand';
import { createSearchSlice } from './SearchSlice';
import type { SearchSlice } from './SearchSlice';

type NoteStoreState = SearchSlice;

export const useNoteStore = create<NoteStoreState>()((...a) => ({
  ...createSearchSlice(...a),
}));
