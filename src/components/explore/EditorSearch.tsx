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

  const filteredEditors = editors.filter(editor => 
    editor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredEditors.map((editor) => (
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
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default EditorSearch;
