
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/messaging';
import { User as AuthUser } from '@/types'; // Renamed to avoid conflict with User type if any
import { Badge } from "@/components/ui/badge";

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

  return (
    <div
      className={`p-3 hover:bg-muted cursor-pointer flex items-center space-x-3 ${isSelected ? 'bg-muted' : ''}`}
      onClick={() => onSelectConversation(conversation.id, otherParticipant)}
    >
      <Avatar>
        <AvatarImage src={otherParticipant?.avatarUrl || undefined} alt={otherParticipant?.name || 'User'} />
        <AvatarFallback>{FallbackName}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{otherParticipant?.name || 'Unknown User'}</p>
        {conversation.lastMessagePreview && (
          <p className="text-xs text-muted-foreground truncate">{conversation.lastMessagePreview}</p>
        )}
      </div>
      <div className="flex flex-col items-end space-y-1">
        {conversation.last_message_at && (
          <p className="text-xs text-muted-foregroundwhitespace-nowrap">
            {new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        {conversation.unread_count && conversation.unread_count > 0 && (
          <Badge variant="destructive" className="px-2 py-0.5 text-xs">
            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ConversationListItem;
