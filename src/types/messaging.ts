
import { User } from '.';

export interface Conversation {
  id: string;
  created_at: string;
  last_message_at: string | null;
  participant_ids: string[];
  // Champs enrichis pour l'UI
  otherParticipant?: User | null;
  lastMessagePreview?: string;
  unread_count?: number; // Pour une future fonctionnalité de messages non lus
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: User | null; // Pour afficher les détails de l'expéditeur
}
