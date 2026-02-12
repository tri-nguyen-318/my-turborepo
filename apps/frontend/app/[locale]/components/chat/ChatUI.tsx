'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import io, { Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';
import { useChatStore } from '@/lib/store/chatStore';


type MessageStatus = 'pending' | 'sent' | 'failed';
interface ChatMessage {
  id?: string;
  channel: string;
  user: string;
  message: string;
  timestamp: number;
  status?: MessageStatus;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
export default function ChatUI() {
  const t = useTranslations('chat');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const mode = useChatStore(s => s.mode);
  const setMode = useChatStore(s => s.setMode);
  const roomId = useChatStore(s => s.roomId);
  const setRoomId = useChatStore(s => s.setRoomId);
  const joined = useChatStore(s => s.joined);
  const setJoined = useChatStore(s => s.setJoined);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // For tracking local messages by temp id
  const tempIdRef = useRef(0);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      username: '',
      input: '',
      roomId: 'general',
    },
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || mode !== 'users') return;
    const s = io(BACKEND_URL, { transports: ['websocket'] });
    setSocket(s);
    const onConnect = () => setSocketReady(true);
    const onDisconnect = () => {
      setSocketReady(false);
      setJoined(false);
    };
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('newMessage', (msg: ChatMessage) => {
      setMessages(prev => {
        if (msg.user && msg.message) {
          const idx = prev.findIndex(
            m => m.status === 'pending' && m.user === msg.user && m.message === msg.message
          );
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...msg, status: 'sent', id: updated[idx].id };
            return updated;
          }
        }
        return [...prev, { ...msg, status: 'sent' }];
      });
    });
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('newMessage');
      s.disconnect();
    };
     
  }, [mode, mounted, setJoined]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = () => {
    const rid = getValues('roomId').trim();
    if (!socketReady || !rid) return;
    setRoomId(rid);
    socket?.emit('joinRoom', rid);
    setJoined(true);
    setMessages([]);
  };
  const handleSend = async () => {
    if (sendingRef.current) return;
    const { input, username } = getValues();
    if (!input.trim() || !username.trim()) return;
    sendingRef.current = true;
    const tempId = `temp-${tempIdRef.current++}`;
    const baseMsg: ChatMessage = {
      id: tempId,
      channel: roomId,
      user: username,
      message: input,
      timestamp: Date.now(),
      status: 'pending',
    };
    setMessages(prev => [...prev, baseMsg]);
    setValue('input', '');
    if (mode === 'users') {
      if (!socketReady || !joined) return;
      socket?.emit(
        'sendMessage',
        {
          roomId,
          user: username,
          message: input,
          timestamp: baseMsg.timestamp,
        },
        (ack: { success: boolean; error?: string }) => {
          setMessages(prev => {
            const idx = prev.findIndex(m => m.id === tempId);
            if (idx === -1) return prev;
            const updated = [...prev];
            if (ack?.success) {
              updated[idx] = { ...updated[idx], status: 'sent' };
            } else {
              updated[idx] = { ...updated[idx], status: 'failed' };
            }
            return updated;
          });
          sendingRef.current = false;
        }
      );
    } else {
      try {
        const res = await fetch(`${BACKEND_URL}/chat/ai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: username, message: input }),
        });
        if (!res.ok) {
          throw new Error('Bad response');
        }
        const data = await res.json();
        setMessages(prev => {
          const idx = prev.findIndex(m => m.id === tempId);
          const updated = [...prev];
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], status: 'sent' };
          }
          updated.push({
            channel: roomId,
            user: 'AI',
            message: data?.reply || 'AI is not configured',
            timestamp: Date.now(),
            status: 'sent',
          });
          return updated;
        });
      } catch {
        setMessages(prev => {
          const idx = prev.findIndex(m => m.id === tempId);
          const updated = [...prev];
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], status: 'failed' };
          }
          return updated;
        });
      } finally {
        sendingRef.current = false;
      }
    }
  };

  const ModeToggle = () => (
    <div className="flex gap-2 mb-2">
      <Button variant={mode === 'users' ? 'default' : 'outline'} onClick={() => setMode('users')}>
        Chat with Users
      </Button>
      <Button variant={mode === 'ai' ? 'default' : 'outline'} onClick={() => setMode('ai')}>
        Chat AI
      </Button>
    </div>
  );

  // removed legacy channel handling

  return (
    <form className="flex rounded-lg overflow-hidden bg-background flex-1 shadow-lg" onSubmit={e => e.preventDefault()}>
      <Card className="flex-1 flex flex-col bg-card border-0 shadow-none">
        {mounted ? (
          <CardHeader className="flex-row items-center gap-4 bg-card/90">
            <ModeToggle />
            <div className="flex items-center gap-2">
              <Input placeholder={t('yourName')} {...register('username')} className="max-w-xs" />
              {mode === 'users' && (
                <>
                  <Input
                    placeholder="Room ID"
                    {...register('roomId')}
                    className="max-w-xs"
                    onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                  />
                  <Button onClick={handleJoinRoom} disabled={!socketReady}>
                    {joined ? 'Joined' : 'Join'}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
        ) : (
          <CardHeader className="flex-row items-center gap-4 bg-card/90">
            <div className="h-9 w-24 bg-muted rounded animate-pulse" />
            <div className="h-9 w-40 bg-muted rounded animate-pulse" />
            <div className="h-9 w-28 bg-muted rounded animate-pulse" />
          </CardHeader>
        )}
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-primary">{msg.user}</span>
                <span className="mx-2 text-muted-foreground">:</span>
                <span>{msg.message}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({new Date(msg.timestamp).toLocaleTimeString()})
                </span>
                {msg.status === 'pending' && (
                  <span className="text-xs text-yellow-500">⏳</span>
                )}
                {msg.status === 'failed' && (
                  <span className="text-xs text-red-500" title="Failed to send">❌</span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
          {mounted ? (
            <div className="flex gap-2 px-4">
              <Input
                placeholder={t('typeMessage')}
                {...register('input')}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1"
                disabled={mode === 'users' ? !socketReady || !joined : false}
              />
              <Button
                onClick={handleSend}
                disabled={mode === 'users' ? !socketReady || !joined : false}
              >
                {t('send')}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 px-4">
              <div className="h-9 w-full bg-muted rounded animate-pulse" />
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
