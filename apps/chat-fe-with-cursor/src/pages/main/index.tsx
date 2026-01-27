import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NICKNAME_MAX_LENGTH, NICKNAME_STORAGE_KEY } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

function generateRandomNickname(): string {
  return 'User-' + crypto.randomUUID().slice(0, 8);
}

export function Main() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const goWithNickname = (value: string) => {
    const toStore = value.trim() || generateRandomNickname();
    try {
      sessionStorage.setItem(NICKNAME_STORAGE_KEY, toStore);
    } catch {
      // ignore
    }
    navigate('/lobby');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goWithNickname(nickname);
  };

  const handleNoNickname = () => {
    goWithNickname('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-semibold mb-4">실시간 채팅</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs">
        <Input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, NICKNAME_MAX_LENGTH))}
          placeholder="닉네임 (선택)"
          maxLength={NICKNAME_MAX_LENGTH}
        />
        <Button type="submit">시작</Button>
        <Button type="button" variant="outline" onClick={handleNoNickname}>
          닉네임 없이 진행
        </Button>
      </form>
    </div>
  );
}
