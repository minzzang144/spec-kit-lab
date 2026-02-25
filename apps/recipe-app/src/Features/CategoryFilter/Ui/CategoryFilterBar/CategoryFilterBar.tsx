import { useCategoryList } from '#/Entities/Category';

import { useCategoryFilter } from '../../Model';

export function CategoryFilterBar() {
	const { data: categoryList, isLoading } = useCategoryList();
	const { selectedCategoryId, setSelectedCategoryId, isAllSelected } =
		useCategoryFilter();

	if (isLoading) {
		return (
			<div className="flex gap-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className="h-8 w-20 animate-pulse rounded-full bg-muted"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-2" role="group" aria-label="카테고리 필터">
			<button
				type="button"
				onClick={() => setSelectedCategoryId(null)}
				className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
					isAllSelected
						? 'bg-primary text-primary-foreground'
						: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
				}`}
			>
				전체
			</button>
			{categoryList?.map((category) => (
				<button
					key={category.id}
					type="button"
					onClick={() => setSelectedCategoryId(category.id)}
					className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
						selectedCategoryId === category.id
							? 'bg-primary text-primary-foreground'
							: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
					}`}
				>
					{category.name}
				</button>
			))}
		</div>
	);
}
