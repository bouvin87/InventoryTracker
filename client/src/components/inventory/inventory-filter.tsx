import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export interface FilterValues {
  status: string;
  batchNumber: string;
}

interface InventoryFilterProps {
  onFilter: (filters: FilterValues) => void;
}

export function InventoryFilter({ onFilter }: InventoryFilterProps) {
  const [filters, setFilters] = useState<FilterValues>({
    status: "all",
    batchNumber: "",
  });

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilter(filters);
  };

  // This section is no longer needed as we explicitly have an "all" option
  // const allLocations = ["all", ...locations];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-800">Filtrera inventering</h3>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status" className="mb-1">Status</Label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Alla statusar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla statusar</SelectItem>
              <SelectItem value="completed">Inventerad</SelectItem>
              <SelectItem value="partially_completed">Delvis inventerad</SelectItem>
              <SelectItem value="not_started">Ej påbörjad</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="batchNumber" className="mb-1">Batchnummer</Label>
          <Input
            type="text"
            id="batchNumber"
            placeholder="Sök batchnummer"
            value={filters.batchNumber}
            onChange={(e) => handleFilterChange("batchNumber", e.target.value)}
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={applyFilters}
            className="w-full"
          >
            <span className="material-icons mr-2 text-sm">filter_list</span>
            Filtrera
          </Button>
        </div>
      </div>
    </div>
  );
}
