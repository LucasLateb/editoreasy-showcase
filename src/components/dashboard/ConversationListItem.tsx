
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/messaging';
import { User as AuthUser } from '@/types';
import NotificationDot from '@/components/ui/NotificationDot';

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

  // Build className with conditional logic for proper highlighting
  let itemClassName = 'p-3 cursor-pointer flex items-center space-x-3 border-l-4 transition-all';
  
  if (isSelected) {
    // Selected conversation gets muted background and border
    itemClassName += ' bg-muted border-l-primary';
  } else if (hasUnreadMessages) {
    // Unread messages get blue highlight and border for extra emphasis
    itemClassName += ' bg-sky-100 dark:bg-sky-800 border-l-sky-500';
  } else {
    // Default state with transparent border
    itemClassName += ' hover:bg-muted border-l-transparent';
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
        <p className={`text-sm font-medium truncate ${hasUnreadMessages ? 'font-semibold' : ''}`}>
          {otherParticipant?.name || 'Unknown User'}
        </p>
        {conversation.lastMessagePreview && (
          <p className="text-xs text-muted-foreground truncate">
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
          <NotificationDot className="mt-1" />
        )}
      </div>
    </div>
  );
};

export default ConversationListItem;
