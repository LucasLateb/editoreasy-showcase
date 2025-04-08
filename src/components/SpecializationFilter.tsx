
import React from 'react';
import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SpecializationFilterProps {
  availableSpecializations: string[];
  selectedSpecialization: string | null;
  onSelectSpecialization: (specialization: string | null) => void;
}

const SpecializationFilter: React.FC<SpecializationFilterProps> = ({
  availableSpecializations,
  selectedSpecialization,
  onSelectSpecialization,
}) => {
  return (
    <div className="mb-6 flex flex-col items-center justify-center">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <div className="w-full">
          <Select
            value={selectedSpecialization || ""}
            onValueChange={(value) => value ? onSelectSpecialization(value) : null}
          >
            <SelectTrigger className="bg-accent border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Filter by specialization" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
              {availableSpecializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedSpecialization && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSelectSpecialization(null)}
            className="flex items-center gap-1 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <span>Clear filter</span>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {selectedSpecialization && (
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
            Showing editors specialized in: {selectedSpecialization}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default SpecializationFilter;
