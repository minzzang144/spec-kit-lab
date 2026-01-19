import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { connectSocket, getSocket } from '@/shared/lib/socket';
import { SOCKET_EMIT, NICKNAME_STORAGE_KEY } from '@/shared/config/constants';
import { getRooms, createRoom } from '@/shared/api';
import { Button } from '@/shared/ui/button';

function getNickname(): string {
  try {
    return sessionStorage.getItem(NICKNAME_STORAGE_KEY) || 'User-' + crypto.randomUUID().slice(0, 8);
  } catch {
    return 'User-' + crypto.randomUUID().slice(0, 8);
  }
}

export function Lobby() {
  const navigate = useNavigate();
  const { data: rooms = [], isLoading, error } = useQuery({ queryKey: ['rooms'], queryFn: getRooms });
  const createMutation = useMutation({
    mutationFn: () => createRoom(getNickname()),
    onSuccess: ({ room }) => {
      const sock = getSocket();
      if (!sock) return;
      sock.emit(SOCKET_EMIT.JOIN_ROOM, { roomId: room.id, nickname: getNickname() });
      navigate(`/room/${room.id}`);
    },
  });

  useEffect(() => {
    const sock = connectSocket();
    sock.emit(SOCKET_EMIT.SET_NICKNAME, { nickname: getNickname() });
  }, []);

  const handleJoin = (roomId: string) => {
    const sock = getSocket();
    if (!sock) return;
    sock.emit(SOCKET_EMIT.JOIN_ROOM, { roomId, nickname: getNickname() });
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-xl font-semibold mb-4">로비</h1>
      <Button
        type="button"
        className="mb-4"
        onClick={() => createMutation.mutate()}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? '생성 중…' : '방 만들기'}
      </Button>
      {createMutation.isError && (
        <p className="text-destructive mb-2">방 생성에 실패했습니다.</p>
      )}
      {isLoading && <p>목록 로딩 중…</p>}
      {error && <p className="text-destructive">목록을 불러올 수 없습니다.</p>}
      {!isLoading && !error && (
        <ul className="space-y-2">
          {rooms.map((r) => (
            <li
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => handleJoin(r.id)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin(r.id)}
              className="cursor-pointer rounded-md border border-input px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {r.name} (참가자 {r.participantCount})
            </li>
          ))}
          {rooms.length === 0 && <li className="text-muted-foreground py-4">방이 없습니다.</li>}
        </ul>
      )}
    </div>
  );
}
