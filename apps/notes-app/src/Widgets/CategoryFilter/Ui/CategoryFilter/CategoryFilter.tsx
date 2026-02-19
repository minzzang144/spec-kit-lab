import { useCategoryFilter } from '#/Features/CategoryFilter';
import { ALL_CATEGORY_ID } from '#/Entities/Category';
import { Button } from '#/Shared/Ui';

export function CategoryFilter() {
  const { categoryList, selectedCategoryId, setSelectedCategoryId } = useCategoryFilter();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategoryId === ALL_CATEGORY_ID ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedCategoryId(ALL_CATEGORY_ID)}
      >
        전체
      </Button>
      {categoryList?.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategoryId(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
