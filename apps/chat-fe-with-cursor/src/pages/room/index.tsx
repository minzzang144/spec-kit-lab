import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/shared/lib/socket';
import { SOCKET_EMIT, SOCKET_ON, MESSAGE_MAX_LENGTH } from '@/shared/config/constants';
import type { Message } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

type JoinLeftEvent = { type: 'joined' | 'left'; nickname: string };

export function Room() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<JoinLeftEvent[]>([]);
  const [inputText, setInputText] = useState('');
  const [failedText, setFailedText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastSentRef = useRef<string | null>(null);

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
    const onMessage = (msg: Message) => {
      setMessages((m) => [...m, msg]);
    };
    const onError = (p: { code?: string; reason?: string }) => {
      if (p.code === 'MESSAGE_INVALID' || p.code === 'NOT_IN_ROOM') {
        const t = lastSentRef.current;
        if (t != null) {
          setFailedText(t);
          setErrorMsg(p.reason ?? p.code);
        }
        lastSentRef.current = null;
      }
    };

    sock.on(SOCKET_ON.ROOM_JOINED, onRoomJoined);
    sock.on(SOCKET_ON.USER_JOINED, onUserJoined);
    sock.on(SOCKET_ON.USER_LEFT, onUserLeft);
    sock.on(SOCKET_ON.ROOM_DELETED, onRoomDeleted);
    sock.on(SOCKET_ON.ROOM_LIST_UPDATED, onRoomListUpdated);
    sock.on(SOCKET_ON.MESSAGE, onMessage);
    sock.on(SOCKET_ON.ERROR, onError);

    return () => {
      sock.off(SOCKET_ON.ROOM_JOINED, onRoomJoined);
      sock.off(SOCKET_ON.USER_JOINED, onUserJoined);
      sock.off(SOCKET_ON.USER_LEFT, onUserLeft);
      sock.off(SOCKET_ON.ROOM_DELETED, onRoomDeleted);
      sock.off(SOCKET_ON.ROOM_LIST_UPDATED, onRoomListUpdated);
      sock.off(SOCKET_ON.MESSAGE, onMessage);
      sock.off(SOCKET_ON.ERROR, onError);
    };
  }, [id, navigate, queryClient]);

  const handleLeave = () => {
    const sock = getSocket();
    if (sock) sock.emit(SOCKET_EMIT.LEAVE_ROOM);
    navigate('/lobby');
  };

  const handleSend = () => {
    const t = inputText.trim();
    if (!t || t.length > MESSAGE_MAX_LENGTH) return;
    const sock = getSocket();
    if (!sock) return;
    lastSentRef.current = t;
    sock.emit(SOCKET_EMIT.SEND_MESSAGE, { text: t });
    setInputText('');
  };

  const handleRetry = () => {
    if (failedText == null) return;
    const t = failedText.trim();
    if (!t || t.length > MESSAGE_MAX_LENGTH) {
      setFailedText(null);
      setErrorMsg(null);
      return;
    }
    const sock = getSocket();
    if (!sock) return;
    lastSentRef.current = t;
    sock.emit(SOCKET_EMIT.SEND_MESSAGE, { text: t });
    setFailedText(null);
    setErrorMsg(null);
  };

  if (!id) return <div className="p-4">잘못된 방입니다.</div>;

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">방: {id}</h1>
        <Button type="button" variant="outline" onClick={handleLeave}>
          나가기
        </Button>
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
      {errorMsg != null && failedText != null && (
        <div className="mb-2 p-2 bg-destructive/10 rounded text-destructive text-sm flex items-center gap-2">
          <span>전송 실패: {errorMsg}</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-destructive"
            onClick={handleRetry}
          >
            재전송
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지 (최대 2000자)"
          maxLength={MESSAGE_MAX_LENGTH}
          className="flex-1"
        />
        <Button type="button" onClick={handleSend} disabled={!inputText.trim()}>
          전송
        </Button>
      </div>
    </div>
  );
}
