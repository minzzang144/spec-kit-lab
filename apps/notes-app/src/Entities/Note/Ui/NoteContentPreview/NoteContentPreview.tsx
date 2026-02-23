import { NoteContent } from '../NoteContent';

type NoteContentPreviewProps = {
	content: string;
};

export function NoteContentPreview({ content }: NoteContentPreviewProps) {
	return (
		<NoteContent
			content={content}
			className="line-clamp-2 text-sm text-muted-foreground"
		/>
	);
}
