import { useNoteStore } from '#/Entities/Note';

export function useNoteSearchLogic() {
  function setKeyword(keyword: string) {
    useNoteStore.setState({ keyword });
  }

  function clearKeyword() {
    useNoteStore.setState({ keyword: '' });
  }

  return { setKeyword, clearKeyword };
}
