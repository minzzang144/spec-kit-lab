import { useState } from 'react';
import { useCategoryList } from '#/Entities/Category';
import { useNoteList } from '#/Entities/Note';
import { useCreateCategory, DeleteCategoryAction } from '#/Features/CategoryWrite';
import { Button, Input } from '#/Shared/Ui';

export function CategoryManagePage() {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  const { data: categoryList } = useCategoryList();
  const { data: noteList } = useNoteList();
  const createCategory = useCreateCategory();

  function getNoteCount(categoryId: string): number {
    return noteList?.filter((note) => note.categoryId === categoryId).length ?? 0;
  }

  function handleCreate() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setError('카테고리 이름을 입력해주세요.');
      return;
    }
    setError('');
    createCategory.mutate(
      { name: trimmed },
      {
        onSuccess: () => setNewCategoryName(''),
        onError: (e) => {
          const err = e as { message?: string };
          setError(err.message ?? '카테고리 생성에 실패했습니다.');
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">카테고리 관리</h1>

      <div className="mb-8 flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="새 카테고리 이름"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            aria-label="새 카테고리 이름"
          />
          <Button onClick={handleCreate} disabled={createCategory.isPending}>
            추가
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {categoryList?.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span>{category.name}</span>
              {category.isDefault && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  기본
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                ({getNoteCount(category.id)}개)
              </span>
            </div>
            {!category.isDefault && (
              <DeleteCategoryAction
                categoryId={category.id}
                noteCount={getNoteCount(category.id)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
