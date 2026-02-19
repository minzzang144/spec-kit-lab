import { Input, Button } from '#/Shared/Ui';
import { useSearchKeyword } from '../../Model';

export function NoteSearch() {
  const { inputValue, handleInputChange, handleClear } = useSearchKeyword();

  return (
    <div className="relative flex items-center">
      <Input
        placeholder="노트 검색..."
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        className="pr-8"
      />
      {inputValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 h-7 w-7 p-0"
          aria-label="검색어 지우기"
        >
          ×
        </Button>
      )}
    </div>
  );
}
