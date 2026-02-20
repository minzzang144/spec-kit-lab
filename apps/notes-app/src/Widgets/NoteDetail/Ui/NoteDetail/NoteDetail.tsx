import { CategoryBadge } from '#/Entities/Category';
import { NoteContent, NoteDate } from '#/Entities/Note';
import type { Note } from '#/Entities/Note';

import { formatDate } from '#/Shared/Model';

type NoteDetailProps = {
	note: Note;
	categoryName: string;
};

export function NoteDetail({ note, categoryName }: NoteDetailProps) {
	const isEdited = note.updatedAt !== note.createdAt;

	return (
		<article className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">{note.title}</h1>
				<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
					<CategoryBadge name={categoryName} />
					<NoteDate isoDate={note.createdAt} />
					{isEdited && (
						<span className="text-xs">
							수정: {formatDate(note.updatedAt)}
						</span>
					)}
				</div>
			</div>
			<NoteContent
				content={note.content}
				className="min-h-32 whitespace-pre-wrap leading-relaxed"
			/>
		</article>
	);
}
