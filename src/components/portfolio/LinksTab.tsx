
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, ExternalLink, Instagram, Youtube, Linkedin, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Link {
  id: string;
  title: string;
  url: string;
  platform: 'instagram' | 'youtube' | 'linkedin' | 'website' | 'other';
}

interface LinksTabProps {
  editMode: boolean;
  isViewOnly?: boolean;
  links?: Link[];
  setLinks?: (links: Link[]) => void;
}

const LinksTab: React.FC<LinksTabProps> = ({ 
  editMode, 
  isViewOnly = false, 
  links = [], 
  setLinks = () => {} 
}) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    platform: 'other' as Link['platform']
  });

  const platformIcons = {
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin,
    website: Globe,
    other: ExternalLink
  };

  const platformColors = {
    instagram: 'bg-pink-500 hover:bg-pink-600',
    youtube: 'bg-red-500 hover:bg-red-600',
    linkedin: 'bg-blue-600 hover:bg-blue-700',
    website: 'bg-green-500 hover:bg-green-600',
    other: 'bg-gray-500 hover:bg-gray-600'
  };

  const handleOpenLinkDialog = (link?: Link) => {
    if (link) {
      setEditingLink(link);
      setLinkForm({
        title: link.title,
        url: link.url,
        platform: link.platform
      });
    } else {
      setEditingLink(null);
      setLinkForm({
        title: '',
        url: '',
        platform: 'other'
      });
    }
    setLinkDialogOpen(true);
  };

  const handleSaveLink = () => {
    if (!linkForm.title.trim() || !linkForm.url.trim()) return;

    const newLink: Link = {
      id: editingLink?.id || Date.now().toString(),
      title: linkForm.title.trim(),
      url: linkForm.url.trim(),
      platform: linkForm.platform
    };

    if (editingLink) {
      setLinks(links.map(link => link.id === editingLink.id ? newLink : link));
    } else {
      setLinks([...links, newLink]);
    }

    setLinkDialogOpen(false);
    setEditingLink(null);
    setLinkForm({ title: '', url: '', platform: 'other' });
  };

  const handleDeleteLink = (linkId: string) => {
    setLinks(links.filter(link => link.id !== linkId));
  };

  const handleLinkClick = (url: string) => {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  if (links.length === 0 && !editMode) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-4">No links shared yet</h3>
        <p className="text-muted-foreground">
          The editor hasn't shared any social media or website links.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editMode && !isViewOnly && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Manage Links</h3>
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenLinkDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={linkForm.title}
                    onChange={(e) => setLinkForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., My Instagram"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={linkForm.url}
                    onChange={(e) => setLinkForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="e.g., https://instagram.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <select
                    id="platform"
                    value={linkForm.platform}
                    onChange={(e) => setLinkForm(prev => ({ ...prev, platform: e.target.value as Link['platform'] }))}
                    className="w-full border border-border rounded-md px-3 py-2 bg-background"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveLink}>
                    {editingLink ? 'Update' : 'Add'} Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => {
          const IconComponent = platformIcons[link.platform];
          const colorClass = platformColors[link.platform];
          
          return (
            <div
              key={link.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full text-white ${colorClass}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">{link.title}</h4>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {link.url}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLinkClick(link.url)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                
                {editMode && !isViewOnly && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenLinkDialog(link)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {links.length === 0 && editMode && !isViewOnly && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No links added yet</p>
          <Button onClick={() => handleOpenLinkDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Your First Link
          </Button>
        </div>
      )}
    </div>
  );
};

export default LinksTab;
