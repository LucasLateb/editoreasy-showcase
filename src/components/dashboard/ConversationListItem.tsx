
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/messaging';
import { User as AuthUser } from '@/types';
import NotificationDot from '@/components/ui/NotificationDot';
import { Badge } from '@/components/ui/badge';

interface ConversationListItemProps {
  conversation: Conversation;
  currentUser: AuthUser;
  onSelectConversation: (conversationId: string, otherParticipant: AuthUser | null | undefined) => void;
  isSelected: boolean;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  onSelectConversation,
  isSelected,
}) => {
  const otherParticipant = conversation.otherParticipant;
  const FallbackName = otherParticipant?.name ? otherParticipant.name.substring(0, 2).toUpperCase() : '??';

  const hasUnreadMessages = conversation.unread_count && conversation.unread_count > 0;

  let itemClassName = 'p-3 hover:bg-muted cursor-pointer flex items-center space-x-3 transition-all';
  
  if (isSelected) {
    itemClassName += ' bg-muted';
  } else if (hasUnreadMessages) {
    itemClassName += ' bg-sky-100 dark:bg-sky-800/30 border-l-4 border-sky-500';
  }

  return (
    <div
      className={itemClassName}
      onClick={() => onSelectConversation(conversation.id, otherParticipant)}
    >
      <Avatar>
        <AvatarImage src={otherParticipant?.avatarUrl || undefined} alt={otherParticipant?.name || 'User'} />
        <AvatarFallback>{FallbackName}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${hasUnreadMessages ? 'font-bold' : 'font-medium'}`}>
          {otherParticipant?.name || 'Unknown User'}
        </p>
        {conversation.lastMessagePreview && (
          <p className={`text-xs ${hasUnreadMessages ? 'text-foreground' : 'text-muted-foreground'} truncate`}>
            {conversation.lastMessagePreview}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end space-y-1 justify-center">
        {conversation.last_message_at && (
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        {hasUnreadMessages && (
          conversation.unread_count > 1 ? (
            <NotificationDot className="mt-1" showCount count={conversation.unread_count} />
          ) : (
            <NotificationDot className="mt-1" />
          )
        )}
      </div>
    </div>
  );
};

export default ConversationListItem;
