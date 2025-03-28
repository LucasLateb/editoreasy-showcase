
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Mail, User, Briefcase, Edit, X, PlusCircle } from 'lucide-react';

interface ProfileCardProps {
  currentUser: any;
  about: string;
  setAbout: (value: string) => void;
  specializations: string[];
  setSpecializations: (specializations: string[]) => void;
  newSpecialization: string;
  setNewSpecialization: (value: string) => void;
  editMode: boolean;
  aboutDialogOpen: boolean;
  setAboutDialogOpen: (open: boolean) => void;
  specializationsDialogOpen: boolean;
  setSpecializationsDialogOpen: (open: boolean) => void;
  handleAddSpecialization: () => void;
  handleRemoveSpecialization: (index: number) => void;
  isViewOnly?: boolean;
  editorData?: any; // This will hold the data of the editor whose portfolio is being viewed
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  currentUser,
  about,
  setAbout,
  specializations,
  setSpecializations,
  newSpecialization,
  setNewSpecialization,
  editMode,
  aboutDialogOpen,
  setAboutDialogOpen,
  specializationsDialogOpen,
  setSpecializationsDialogOpen,
  handleAddSpecialization,
  handleRemoveSpecialization,
  isViewOnly = false,
  editorData
}) => {
  // Determine which user data to display
  const displayUser = isViewOnly ? editorData : currentUser;
  
  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 border border-border">
      {/* Profile information */}
      <div className="flex items-center mb-6">
        <Avatar className="h-16 w-16 mr-4 border-2 border-background shadow-sm">
          <AvatarImage src={displayUser?.avatarUrl} alt={displayUser?.name} />
          <AvatarFallback className="text-lg">
            {displayUser?.name?.charAt(0) || 'E'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-medium">{displayUser?.name || 'Video Editor'}</h2>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="mr-2">
              {displayUser?.subscriptionTier?.charAt(0).toUpperCase() + displayUser?.subscriptionTier?.slice(1) || 'Professional'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {displayUser?.likes || 0} likes
            </span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center">
            <User className="h-4 w-4 mr-2" />
            About
          </h3>
          {editMode && (
            <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit About Section</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Textarea 
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Write something about yourself..."
                    className="min-h-[120px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={() => setAboutDialogOpen(false)}>
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {about || (displayUser?.bio || 'Professional video editor with expertise in various styles and techniques.')}
        </p>
        
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Specializations
          </h3>
          {editMode && (
            <Dialog open={specializationsDialogOpen} onOpenChange={setSpecializationsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Specializations</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Current Specializations</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                          {spec}
                          <button 
                            onClick={() => handleRemoveSpecialization(index)} 
                            className="ml-1 rounded-full hover:bg-background/20 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      placeholder="Add new specialization"
                      className="flex-1"
                    />
                    <Button onClick={handleAddSpecialization} type="button">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setSpecializationsDialogOpen(false)}>
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {specializations.map((spec, index) => (
            <Badge key={index} variant="secondary">{spec}</Badge>
          ))}
        </div>
        
        <Button className="w-full">
          <Mail className="mr-2 h-4 w-4" />
          Contact Me
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;
