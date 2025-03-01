
import React from 'react';
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

interface AccountTabProps {
  currentUser: User;
}

const AccountTab: React.FC<AccountTabProps> = ({ currentUser }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account information and subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Profile Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <input 
                  type="text" 
                  className="glass-input w-full p-2 rounded-md" 
                  defaultValue={currentUser.name}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input 
                  type="email" 
                  className="glass-input w-full p-2 rounded-md" 
                  defaultValue={currentUser.email}
                  disabled
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <textarea 
                  className="glass-input w-full p-2 rounded-md h-24" 
                  defaultValue={currentUser.bio || ''}
                  placeholder="Tell clients about your video editing style and experience..."
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Subscription</h3>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
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
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

export default AccountTab;
