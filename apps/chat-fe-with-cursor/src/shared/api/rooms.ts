/**
 * contracts/openapi.yaml 기준
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  participantCount: number;
}

export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${API_URL}/rooms`);
  if (!res.ok) throw new Error(`getRooms failed: ${res.status}`);
  return res.json();
}

export async function createRoom(nickname: string): Promise<{ room: Room }> {
  const res = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname: nickname.trim() }),
  });
  if (!res.ok) throw new Error(`createRoom failed: ${res.status}`);
  return res.json();
}
