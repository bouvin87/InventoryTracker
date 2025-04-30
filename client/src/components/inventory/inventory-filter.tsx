import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export interface FilterValues {
  status: string;
  location: string;
  batchNumber: string;
}

interface InventoryFilterProps {
  onFilter: (filters: FilterValues) => void;
  locations: string[];
}

export function InventoryFilter({ onFilter, locations }: InventoryFilterProps) {
  const [filters, setFilters] = useState<FilterValues>({
    status: "all",
    location: "all",
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
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <SelectItem value="in_progress">Pågående</SelectItem>
              <SelectItem value="not_started">Ej påbörjad</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="location" className="mb-1">Lagerplats</Label>
          <Select 
            value={filters.location} 
            onValueChange={(value) => handleFilterChange("location", value)}
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="Alla lagerplatser" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla lagerplatser</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
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
