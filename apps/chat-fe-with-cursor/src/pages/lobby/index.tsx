import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectSocket } from '@/shared/lib/socket';
import { SOCKET_EMIT } from '@/shared/config/constants';
import { NICKNAME_STORAGE_KEY } from '@/shared/config/constants';
import { getRooms } from '@/shared/api';

export function Lobby() {
  const { data: rooms = [], isLoading, error } = useQuery({ queryKey: ['rooms'], queryFn: getRooms });

  useEffect(() => {
    const sock = connectSocket();
    const nickname =
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(NICKNAME_STORAGE_KEY)) ||
      'User-' + crypto.randomUUID().slice(0, 8);
    sock.emit(SOCKET_EMIT.SET_NICKNAME, { nickname });
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-xl font-semibold mb-4">로비</h1>
      <button type="button" className="border rounded px-3 py-2 mb-4" onClick={() => {}}>
        방 만들기
      </button>
      {isLoading && <p>목록 로딩 중…</p>}
      {error && <p className="text-destructive">목록을 불러올 수 없습니다.</p>}
      {!isLoading && !error && (
        <ul className="list-disc list-inside space-y-1">
          {rooms.map((r) => (
            <li key={r.id}>
              {r.name} (참가자 {r.participantCount})
            </li>
          ))}
          {rooms.length === 0 && <li className="text-muted-foreground">방이 없습니다.</li>}
        </ul>
      )}
    </div>
  );
}
