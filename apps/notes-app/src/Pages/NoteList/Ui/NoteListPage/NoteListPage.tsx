import { Link } from 'react-router';

import { CategoryFilter } from '#/Widgets/CategoryFilter';
import { NoteList } from '#/Widgets/NoteList';
import { NoteSearch } from '#/Widgets/NoteSearch';

import { ROUTES } from '#/Shared/Config';
import { Button } from '#/Shared/Ui';

export function NoteListPage() {
	return (
		<div className="mx-auto max-w-2xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">내 노트</h1>
				<Button asChild>
					<Link to={ROUTES.NOTE_WRITE}>새 노트 작성</Link>
				</Button>
			</div>
			<div className="mb-3">
				<NoteSearch />
			</div>
			<div className="mb-4">
				<CategoryFilter />
			</div>
			<NoteList />
		</div>
	);
}
