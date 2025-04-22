
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AnalyticsTab: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Alert variant="default" className="mb-4">
        <AlertTitle>Premium Feature</AlertTitle>
        <AlertDescription>
          Analytics are available only on <span className="font-semibold">Premium</span> and <span className="font-semibold">Pro</span> plans.
        </AlertDescription>
        <Button
          variant="default"
          className="mt-4"
          onClick={() => navigate('/pricing')}
        >
          Upgrade Plan
        </Button>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analytics</CardTitle>
          <CardDescription>
            View statistics about your portfolio performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-muted-foreground text-sm mb-1">Total Views</div>
              <div className="text-3xl font-bold">1,245</div>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-muted-foreground text-sm mb-1">Likes</div>
              <div className="text-3xl font-bold">86</div>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-muted-foreground text-sm mb-1">Profile Visits</div>
              <div className="text-3xl font-bold">324</div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-center text-muted-foreground italic">
              More detailed analytics available in Premium and Pro plans
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;

