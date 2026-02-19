type NoteContentPreviewProps = {
  content: string;
};

export function NoteContentPreview({ content }: NoteContentPreviewProps) {
  if (!content) return null;

  return (
    <p className="line-clamp-2 text-sm text-muted-foreground">{content}</p>
  );
}
