
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface TestimonialsTabProps {
  editMode: boolean;
}

const TestimonialsTab: React.FC<TestimonialsTabProps> = ({ editMode }) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-medium mb-4">No testimonials yet</h3>
      <p className="text-muted-foreground mb-6">
        Share your portfolio with clients to receive testimonials.
      </p>
      {editMode && (
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Testimonial Manually
        </Button>
      )}
    </div>
  );
};

export default TestimonialsTab;
