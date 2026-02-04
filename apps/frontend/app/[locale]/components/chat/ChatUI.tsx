'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import io, { Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';


type MessageStatus = 'pending' | 'sent' | 'failed';
interface ChatMessage {
  id?: string; // for local tracking
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
  const [channels, setChannels] = useState<string[]>(['default', 'entertainment', 'work']);
  const [currentChannel, setCurrentChannel] = useState('default');
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
      newChannel: '',
    },
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const s = io(BACKEND_URL, { transports: ['websocket'] });
    setSocket(s);
    const onConnect = () => setSocketReady(true);
    const onDisconnect = () => setSocketReady(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.emit('joinChannel', currentChannel);
    s.on('newMessage', (msg: ChatMessage) => {
      setMessages(prev => {
        // If this is an echo of a local pending message, update its status
        if (msg.user && msg.message) {
          const idx = prev.findIndex(
            m => m.status === 'pending' && m.user === msg.user && m.message === msg.message
          );
          if (idx !== -1) {
            // Update status to 'sent' and timestamp
            const updated = [...prev];
            updated[idx] = { ...msg, status: 'sent', id: updated[idx].id };
            return updated;
          }
        }
        // Otherwise, just add as a new message
        return [...prev, { ...msg, status: 'sent' }];
      });
    });
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!socketReady) return;
    const { input, username } = getValues();
    if (!input.trim() || !username.trim()) return;
    const tempId = `temp-${tempIdRef.current++}`;
    const localMsg: ChatMessage = {
      id: tempId,
      channel: currentChannel,
      user: username,
      message: input,
      timestamp: Date.now(),
      status: 'pending',
    };
    setMessages(prev => [...prev, localMsg]);
    setValue('input', '');
    socket?.emit(
      'sendMessage',
      {
        channel: currentChannel,
        user: username,
        message: input,
        timestamp: localMsg.timestamp,
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
      }
    );
  };

  const handleCreateChannel = () => {
    const { newChannel } = getValues();
    if (!newChannel.trim() || channels.includes(newChannel)) return;
    socket?.emit('createChannel', newChannel, (res: any) => {
      if (res?.event === 'channelCreated') {
        setChannels(prev => [...prev, newChannel]);
        setValue('newChannel', '');
      }
    });
  };

  const handleJoinChannel = (channel: string) => {
    if (channel === currentChannel) return;
    socket?.emit('leaveChannel', currentChannel);
    setCurrentChannel(channel);
    setMessages([]);
    socket?.emit('joinChannel', channel);
  };

  return (
    <form className="flex rounded-lg overflow-hidden bg-background flex-1 shadow-lg" onSubmit={e => e.preventDefault()}>
      <Card className="w-60 min-w-[200px] flex flex-col bg-card border-0 shadow-none">
        <CardHeader className="bg-card/90">
          <CardTitle>{t('channels')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-2">
          <ScrollArea className="flex-1">
            <ul className="space-y-1">
              {channels.map(ch => (
                <li key={ch}>
                  <Button
                    variant={ch === currentChannel ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleJoinChannel(ch)}
                  >
                    #{ch}
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder={t('newChannel')}
              {...register('newChannel')}
              className="flex-1"
            />
            <Button onClick={handleCreateChannel} variant="secondary">
              {t('create')}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col bg-card border-0 shadow-none">
        <CardHeader className="flex-row items-center gap-4 bg-card/90">
          <Input
            placeholder={t('yourName')}
            {...register('username')}
            className="max-w-xs"
          />
          <span className="text-muted-foreground">
            {t('channel')}: <b>#{currentChannel}</b>
          </span>
        </CardHeader>
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
          <div className="flex gap-2 px-4">
            <Input
              placeholder={t('typeMessage')}
              {...register('input')}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1"
              disabled={!socketReady}
            />
            <Button onClick={handleSend} disabled={!socketReady}>{t('send')}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
