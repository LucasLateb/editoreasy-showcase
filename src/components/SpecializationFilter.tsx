
import React from 'react';
import { X } from 'lucide-react';
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
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-64">
          <Select
            value={selectedSpecialization || ""}
            onValueChange={(value) => value ? onSelectSpecialization(value) : null}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by specialization" />
            </SelectTrigger>
            <SelectContent>
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
            className="flex items-center gap-1"
          >
            <span>Clear filter</span>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {selectedSpecialization && (
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs">
            Showing editors specialized in: {selectedSpecialization}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default SpecializationFilter;
