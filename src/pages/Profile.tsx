
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Profile: React.FC = () => {
  const { currentUser, updateAvatar, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.avatarUrl || null);
  
  // Sample avatar options
  const sampleAvatars = [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952',
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1',
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'
  ];

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!currentUser) {
    return null;
  }

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
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar.",
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
    try {
      setIsUploading(true);
      await updateAvatar(url);
    } catch (error) {
      console.error('Error setting sample avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <div className="container mx-auto pt-32 pb-16 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information and avatar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
            </div>

            <div className="mt-6">
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

            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={currentUser.name} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={currentUser.email} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscription">Subscription Tier</Label>
                <Input id="subscription" defaultValue={currentUser.subscriptionTier} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
