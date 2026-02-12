import type { UseFormReturn } from 'react-hook-form';
import { useCategoryList, ALL_CATEGORY_ID } from '#/Entities/Category';
import {
  Button,
  Input,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/Shared/Ui';
import type { NoteFormData } from '../../Model';

type NoteEditorProps = {
  form: UseFormReturn<NoteFormData>;
  onSubmit: (data: NoteFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function NoteEditor({
  form,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = '저장',
}: NoteEditorProps) {
  const { data: categoryList } = useCategoryList();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedCategoryId = watch('categoryId');

  const selectableCategoryList = categoryList?.filter(
    (category) => category.id !== ALL_CATEGORY_ID,
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          placeholder="노트 제목을 입력하세요"
          {...register('title')}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-red-500" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          placeholder="노트 내용을 입력하세요"
          rows={12}
          {...register('content')}
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? 'content-error' : undefined}
        />
        {errors.content && (
          <p id="content-error" className="text-sm text-red-500" role="alert">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">카테고리</Label>
        <Select
          value={selectedCategoryId ?? ''}
          onValueChange={(value) => setValue('categoryId', value)}
        >
          <SelectTrigger id="category" aria-label="카테고리 선택">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {selectableCategoryList?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
