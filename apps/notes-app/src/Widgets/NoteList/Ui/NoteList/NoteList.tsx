import { useCategoryList } from '#/Entities/Category';

import { useNoteListFilter } from '../../Model/Hook/useNoteListFilter';
import { NoteListEmpty } from '../NoteListEmpty';
import { NoteListItem } from '../NoteListItem';

import { NoteListLoading } from './NoteList.loading';

export function NoteList() {
	const { data: noteList, isLoading, isError } = useNoteListFilter();
	const { data: categoryList } = useCategoryList();

	if (isLoading) {
		return <NoteListLoading />;
	}

	if (isError) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				노트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
			</p>
		);
	}

	if (!noteList || noteList.length === 0) {
		return <NoteListEmpty />;
	}

	function getCategoryName(categoryId: string): string {
		return categoryList?.find((c) => c.id === categoryId)?.name ?? '미분류';
	}

	return (
		<ul className="flex flex-col gap-3">
			{noteList.map((note) => (
				<NoteListItem
					key={note.id}
					note={note}
					categoryName={getCategoryName(note.categoryId)}
				/>
			))}
		</ul>
	);
}
