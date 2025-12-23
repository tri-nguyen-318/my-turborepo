'use client';
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';

interface ChatMessage {
  channel: string;
  user: string;
  message: string;
  timestamp: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'http://localhost:3000';
export default function ChatUI() {
  const t = useTranslations('chat');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channels, setChannels] = useState<string[]>(['default', 'entertainment', 'work']);
  const [currentChannel, setCurrentChannel] = useState('default');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = io(BACKEND_URL, { transports: ['websocket'] });
    setSocket(s);
    s.emit('joinChannel', currentChannel);
    s.on('newMessage', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !username.trim()) return;
    socket?.emit('sendMessage', {
      channel: currentChannel,
      user: username,
      message: input,
      timestamp: Date.now(),
    });
    setInput('');
  };

  const handleCreateChannel = () => {
    if (!newChannel.trim() || channels.includes(newChannel)) return;
    socket?.emit('createChannel', newChannel, (res: any) => {
      if (res?.event === 'channelCreated') {
        setChannels(prev => [...prev, newChannel]);
        setNewChannel('');
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
    <div className="flex rounded-lg overflow-hidden bg-background flex-1 shadow-lg">
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
              value={newChannel}
              onChange={e => setNewChannel(e.target.value)}
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
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="max-w-xs"
          />
          <span className="text-muted-foreground">
            {t('channel')}: <b>#{currentChannel}</b>
          </span>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-2">
                <span className="font-semibold text-primary">{msg.user}</span>
                <span className="mx-2 text-muted-foreground">:</span>
                <span>{msg.message}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({new Date(msg.timestamp).toLocaleTimeString()})
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
          <div className="flex gap-2 px-4">
            <Input
              placeholder={t('typeMessage')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend}>{t('send')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
