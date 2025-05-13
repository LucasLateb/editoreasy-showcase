
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { EditorType } from '@/types/exploreTypes';

interface EditorSearchProps {
  editors: EditorType[];
  isLoading: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditorSearch: React.FC<EditorSearchProps> = ({
  editors,
  isLoading,
  isOpen,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Make sure editors is always an array
  const editorsArray = Array.isArray(editors) ? editors : [];

  const filteredEditors = searchTerm 
    ? editorsArray.filter(editor => 
        editor.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : editorsArray;

  const handleEditorSelect = (editorId: string) => {
    onOpenChange(false);
    navigate(`/editor/${editorId}`);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search for editors..." 
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        {isLoading ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Loading editors...</p>
          </div>
        ) : (
          <>
            <CommandEmpty>No editors found.</CommandEmpty>
            <CommandGroup heading="Editors">
              {filteredEditors.length > 0 ? (
                filteredEditors.map((editor) => (
                  <CommandItem
                    key={editor.id}
                    onSelect={() => handleEditorSelect(editor.id)}
                    className="flex items-center"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>{editor.name}</span>
                    {editor.subscription_tier && editor.subscription_tier !== 'free' && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        • {editor.subscription_tier.charAt(0).toUpperCase() + editor.subscription_tier.slice(1)}
                      </span>
                    )}
                  </CommandItem>
                ))
              ) : (
                <div className="p-2 text-center">
                  <p className="text-sm text-muted-foreground">No editors available</p>
                </div>
              )}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default EditorSearch;
