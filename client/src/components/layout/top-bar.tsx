import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  toggleSidebar: () => void;
  onSearch: (searchTerm: string) => void;
  onAddBatch: () => void;
}

export function TopBar({ toggleSidebar, onSearch, onAddBatch }: TopBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center md:hidden">
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-600"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-lg font-semibold text-primary ml-3">Batchinventering</h1>
        </div>
        
        <div className="hidden md:flex items-center flex-1">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Sök batchnummer..."
              className="h-9 pl-10 bg-gray-100 border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-400 text-lg">search</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button type="button" className="relative p-1 text-gray-500 hover:text-gray-600 focus:outline-none">
              <span className="material-icons">notifications</span>
              <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500"></span>
            </button>
          </div>
          
          <div className="relative">
            <button type="button" className="relative p-1 text-gray-500 hover:text-gray-600 focus:outline-none">
              <span className="material-icons">help_outline</span>
            </button>
          </div>
          
          <div className="md:hidden flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
              AN
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-b border-gray-200 px-6 py-2 flex justify-between items-center">
        <div className="text-sm font-medium">
          Inventeringssystem
        </div>
        <Button 
          onClick={onAddBatch}
          className="bg-primary text-white"
          size="sm"
        >
          <span className="material-icons mr-1 text-sm">add</span>
          Lägg till batch
        </Button>
      </div>
    </div>
  );
}
