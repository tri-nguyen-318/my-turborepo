import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Mode = 'users' | 'ai';

interface ChatState {
  mode: Mode;
  roomId: string;
  joined: boolean;
  setMode: (mode: Mode) => void;
  setRoomId: (roomId: string) => void;
  setJoined: (joined: boolean) => void;
}

const initial = (() => {
  if (typeof window === 'undefined') {
    return { mode: 'users' as Mode, roomId: 'general', joined: false };
  }
  try {
    const raw = localStorage.getItem('chat-store');
    if (!raw) return { mode: 'users' as Mode, roomId: 'general', joined: false };
    const parsed = JSON.parse(raw);
    const state = parsed?.state || {};
    return {
      mode: (state.mode as Mode) ?? ('users' as Mode),
      roomId: (state.roomId as string) ?? 'general',
      joined: (state.joined as boolean) ?? false,
    };
  } catch {
    return { mode: 'users' as Mode, roomId: 'general', joined: false };
  }
})();

export const useChatStore = create<ChatState>()(
  persist(
    set => ({
      mode: initial.mode,
      roomId: initial.roomId,
      joined: initial.joined,
      setMode: mode => set({ mode }),
      setRoomId: roomId => set({ roomId }),
      setJoined: joined => set({ joined }),
    }),
    { name: 'chat-store' },
  ),
);
