import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
        <div className="flex items-center">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600 mr-3"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-lg font-semibold text-primary">
            Batchinventering
          </h1>
        </div>

        {/* På större skärmar: sökfält till vänster */}
        <div className="hidden md:flex items-center flex-1 ml-6">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Sök..."
              className="h-9 pl-10 bg-gray-100 border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-400 text-lg">
                search
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
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

      {/* Lägg till sökfält i mobilvy */}
      <div className="md:hidden px-6 py-2 border-b border-gray-200">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Sök..."
            className="h-9 pl-10 bg-gray-100 border-transparent w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons text-gray-400 text-lg">
              search
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 px-6 py-2 flex justify-between items-center">
        <div className="text-sm font-medium">Inventeringssystem</div>
        <div className="text-sm text-gray-500">Batchinventering</div>
      </div>
    </div>
  );
}
