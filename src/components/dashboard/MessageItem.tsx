
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/types/messaging';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { currentUser } = useAuth();
  const isSender = message.sender_id === currentUser?.id;
  const senderName = message.sender?.name || 'User';
  const senderAvatar = message.sender?.avatarUrl;

  return (
    <div className={cn('flex mb-4', isSender ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex items-end max-w-[70%]', isSender ? 'flex-row-reverse' : 'flex-row')}>
        {!isSender && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={senderAvatar || undefined} alt={senderName} />
            <AvatarFallback>{senderName.substring(0, 1)}</AvatarFallback>
          </Avatar>
        )}
        <div
          className={cn(
            'p-3 rounded-lg',
            isSender ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
          )}
        >
          <p className="text-sm">{message.content}</p>
          <p className={cn('text-xs mt-1', isSender ? 'text-blue-200 text-right' : 'text-muted-foreground text-left')}>
            {format(new Date(message.created_at), 'p')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
