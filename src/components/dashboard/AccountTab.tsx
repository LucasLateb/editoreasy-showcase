
import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

interface AccountTabProps {
  currentUser: User;
}

const AccountTab: React.FC<AccountTabProps> = ({ currentUser }) => {
  const { updateAvatar } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.avatarUrl || null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form setup
  const form = useForm({
    defaultValues: {
      name: currentUser?.name || '',
    }
  });

  // Sample avatar options
  const sampleAvatars = [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952',
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1',
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'
  ];

  // Reset success message after 3 seconds
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (saveSuccess) {
      timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [saveSuccess]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG or GIF image.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive"
      });
      return;
    }

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      setIsUploading(true);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Update user profile
      await updateAvatar(publicUrlData.publicUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been successfully updated."
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your avatar.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const selectSampleAvatar = async (url: string) => {
    setPreviewUrl(url);
    setIsUploading(true);
    try {
      await updateAvatar(url);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been successfully updated."
      });
    } catch (error: any) {
      console.error('Error setting sample avatar:', error);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your avatar.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSaveProfile = async (values: any) => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Show success message
      setSaveSuccess(true);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully saved."
      });
      
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save failed",
        description: error.message || "There was an error saving your profile.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your profile information and subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar 
              className="h-24 w-24 cursor-pointer ring-2 ring-primary ring-offset-2 hover:opacity-90 transition-opacity"
              onClick={handleAvatarClick}
            >
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt={currentUser.name} />
              ) : null}
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {currentUser.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif"
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={handleAvatarClick} 
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : "Change Profile Picture"}
            </Button>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Or choose one of these sample avatars:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {sampleAvatars.map((avatar, index) => (
                  <Avatar 
                    key={index} 
                    className="h-16 w-16 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => selectSampleAvatar(avatar)}
                  >
                    <AvatarImage src={avatar} alt={`Sample avatar ${index+1}`} />
                  </Avatar>
                ))}
              </div>
            </div>
          </div>

          {saveSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-800 mt-4">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <AlertDescription>
                Profile changes have been saved successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Information */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={currentUser.email} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscription">Subscription Tier</Label>
                <Input 
                  id="subscription" 
                  value={currentUser.subscriptionTier.charAt(0).toUpperCase() + currentUser.subscriptionTier.slice(1)} 
                  disabled 
                />
              </div>
              
              {/* Subscription Section */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Current Plan: {currentUser.subscriptionTier.charAt(0).toUpperCase() + currentUser.subscriptionTier.slice(1)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentUser.subscriptionTier === 'free' 
                        ? 'Upgrade to unlock more features' 
                        : 'Your subscription renews on October 12, 2023'}
                    </p>
                  </div>
                  <Button variant="outline">
                    {currentUser.subscriptionTier === 'free' ? 'Upgrade' : 'Manage'}
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountTab;
