
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; // Using sonner for consistency, or adapt per component

export const getOrCreateConversation = async (currentUserId: string, targetUserId: string): Promise<string | null> => {
  if (!currentUserId || !targetUserId) {
    console.error('Current user ID or target user ID is missing.');
    toast.error('Unable to start conversation. User information is missing.');
    return null;
  }

  if (currentUserId === targetUserId) {
    console.error("Cannot create a conversation with oneself.");
    toast.error("You cannot start a conversation with yourself.");
    return null;
  }

  const sortedParticipantIds = [currentUserId, targetUserId].sort();

  try {
    // Check if conversation already exists using array containment operators
    // This checks if participant_ids contains all elements of sortedParticipantIds
    // AND sortedParticipantIds contains all elements of participant_ids.
    // This is equivalent to checking for array equality if elements are unique and order is consistent.
    let { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .contains('participant_ids', sortedParticipantIds)
      .containedBy('participant_ids', sortedParticipantIds)
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: 'single row not found'
      console.error('Error fetching conversation:', fetchError);
      toast.error('Error finding existing conversation.');
      return null;
    }

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    // For insert, the Supabase client handles JS arrays correctly.
    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({ participant_ids: sortedParticipantIds })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating conversation:', insertError);
      toast.error('Could not create new conversation.');
      return null;
    }

    if (!newConversation) {
        toast.error('Failed to create conversation.');
        return null;
    }
    
    // Invalidate conversation list to refetch
    // This might be handled by realtime, but explicit invalidation can be good.
    // await queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });


    return newConversation.id;

  } catch (error) {
    console.error('Unexpected error in getOrCreateConversation:', error);
    toast.error('An unexpected error occurred.');
    return null;
  }
};

