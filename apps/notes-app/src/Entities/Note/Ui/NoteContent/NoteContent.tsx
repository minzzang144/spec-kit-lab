type NoteContentProps = {
  content: string;
  className?: string;
};

export function NoteContent({ content, className }: NoteContentProps) {
  if (!content) return null;

  return <p className={className}>{content}</p>;
}
