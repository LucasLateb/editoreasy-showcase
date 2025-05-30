
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

  let itemClassName = 'p-4 hover:bg-muted/50 cursor-pointer flex items-center space-x-3 transition-all border-b border-border/40';
  
  if (isSelected) {
    itemClassName += ' bg-muted border-l-4 border-l-primary';
  } else if (hasUnreadMessages) {
    itemClassName += ' bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500';
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div
      className={itemClassName}
      onClick={() => onSelectConversation(conversation.id, otherParticipant)}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={otherParticipant?.avatarUrl || undefined} alt={otherParticipant?.name || 'User'} />
          <AvatarFallback className="font-medium">{FallbackName}</AvatarFallback>
        </Avatar>
        {hasUnreadMessages && (
          <div className="absolute -top-1 -right-1">
            <NotificationDot className="h-3 w-3" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className={`text-sm truncate font-medium ${hasUnreadMessages ? 'font-semibold text-foreground' : 'text-foreground'}`}>
            {otherParticipant?.name || 'Utilisateur inconnu'}
          </p>
          {conversation.last_message_at && (
            <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatTime(conversation.last_message_at)}
            </p>
          )}
        </div>
        
        {conversation.lastMessagePreview && (
          <p className={`text-xs truncate ${hasUnreadMessages ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {conversation.lastMessagePreview}
          </p>
        )}
      </div>
      
      <div className="flex flex-col items-end justify-center ml-2">
        {hasUnreadMessages && conversation.unread_count > 1 && (
          <NotificationDot 
            className="bg-blue-500 text-white text-xs min-w-[18px] h-[18px] rounded-full flex items-center justify-center" 
            showCount 
            count={conversation.unread_count} 
          />
        )}
      </div>
    </div>
  );
};

export default ConversationListItem;
