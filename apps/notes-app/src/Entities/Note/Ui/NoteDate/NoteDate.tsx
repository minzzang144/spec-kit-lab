import { formatDate } from '#/Shared/Model';

type NoteDateProps = {
	isoDate: string;
};

export function NoteDate({ isoDate }: NoteDateProps) {
	return (
		<time dateTime={isoDate} className="text-xs text-muted-foreground">
			{formatDate(isoDate)}
		</time>
	);
}
