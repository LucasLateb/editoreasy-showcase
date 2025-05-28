
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Corrected import
import { Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NewMessageFormProps {
  conversationId: string;
}

const NewMessageForm: React.FC<NewMessageFormProps> = ({ conversationId }) => {
  const [content, setContent] = useState('');
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUser || !conversationId) return;

    setIsSending(true);
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content: content.trim(),
    });

    setIsSending(false);
    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send message. " + error.message,
        variant: "destructive",
      });
    } else {
      setContent(''); // Clear input after sending
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex items-center space-x-2 bg-background">
      <Input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="flex-1"
        disabled={isSending}
      />
      <Button type="submit" size="icon" disabled={!content.trim() || isSending}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default NewMessageForm;
