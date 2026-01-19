import { useParams } from 'react-router-dom';

export function Room() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="min-h-screen p-4">
      Room {id ?? '?'} (placeholder)
    </div>
  );
}
