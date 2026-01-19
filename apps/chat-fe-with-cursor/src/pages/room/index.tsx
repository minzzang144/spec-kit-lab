import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/shared/lib/socket';
import { SOCKET_EMIT, SOCKET_ON } from '@/shared/config/constants';
import type { Message } from '@/shared/api';

type JoinLeftEvent = { type: 'joined' | 'left'; nickname: string };

export function Room() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<JoinLeftEvent[]>([]);

  useEffect(() => {
    const sock = getSocket();
    if (!sock || !id) return;

    const onRoomJoined = (p: { room: unknown; messages: Message[] }) => {
      setMessages(p.messages ?? []);
    };
    const onUserJoined = (p: { nickname: string }) => {
      setEvents((e) => [...e, { type: 'joined', nickname: p.nickname }]);
    };
    const onUserLeft = (p: { nickname: string }) => {
      setEvents((e) => [...e, { type: 'left', nickname: p.nickname }]);
    };
    const onRoomDeleted = () => navigate('/lobby');
    const onRoomListUpdated = () => queryClient.invalidateQueries({ queryKey: ['rooms'] });

    sock.on(SOCKET_ON.ROOM_JOINED, onRoomJoined);
    sock.on(SOCKET_ON.USER_JOINED, onUserJoined);
    sock.on(SOCKET_ON.USER_LEFT, onUserLeft);
    sock.on(SOCKET_ON.ROOM_DELETED, onRoomDeleted);
    sock.on(SOCKET_ON.ROOM_LIST_UPDATED, onRoomListUpdated);

    return () => {
      sock.off(SOCKET_ON.ROOM_JOINED, onRoomJoined);
      sock.off(SOCKET_ON.USER_JOINED, onUserJoined);
      sock.off(SOCKET_ON.USER_LEFT, onUserLeft);
      sock.off(SOCKET_ON.ROOM_DELETED, onRoomDeleted);
      sock.off(SOCKET_ON.ROOM_LIST_UPDATED, onRoomListUpdated);
    };
  }, [id, navigate, queryClient]);

  const handleLeave = () => {
    const sock = getSocket();
    if (sock) sock.emit(SOCKET_EMIT.LEAVE_ROOM);
    navigate('/lobby');
  };

  if (!id) return <div className="p-4">잘못된 방입니다.</div>;

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">방: {id}</h1>
        <button type="button" className="border rounded px-3 py-2" onClick={handleLeave}>
          나가기
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {events.map((ev, i) => (
          <p key={`ev-${i}`} className="text-muted-foreground text-sm">
            {ev.nickname}님이 {ev.type === 'joined' ? '들어왔습니다' : '나갔습니다'}.
          </p>
        ))}
        {messages.map((m) => (
          <div key={m.id} className="border-l-2 pl-2">
            <span className="font-medium">{m.senderNickname}:</span> {m.text}
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">메시지 입력은 US3(T018)에서 추가됩니다.</p>
    </div>
  );
}
