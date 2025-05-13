
import React from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type EditorType = {
  id: string;
  name: string | null;
  subscription_tier: string | null;
  role?: string;
  specialization?: string;
};

interface EditorSearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editors: EditorType[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  isLoading: boolean;
}

const EditorSearchDialog: React.FC<EditorSearchDialogProps> = ({
  isOpen,
  onOpenChange,
  editors,
  searchTerm,
  onSearchTermChange,
  isLoading,
}) => {
  const navigate = useNavigate();

  const handleEditorSelect = (editorId: string) => {
    onOpenChange(false);
    navigate(`/editor/${editorId}`);
  };

  const filteredEditors = editors.filter(editor => 
    editor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search for editors..." 
        value={searchTerm}
        onValueChange={onSearchTermChange}
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

export default EditorSearchDialog;
