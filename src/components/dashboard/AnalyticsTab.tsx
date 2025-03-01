
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const AnalyticsTab: React.FC = () => {
  return (
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
  );
};

export default AnalyticsTab;
