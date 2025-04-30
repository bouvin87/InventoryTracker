import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BatchItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DataTableProps {
  data: BatchItem[];
  onView: (item: BatchItem) => void;
  onInventoryComplete: (item: BatchItem) => void;
  onInventoryPartial: (item: BatchItem) => void;
  onUndoInventory?: (item: BatchItem) => void;
}

export function DataTable({ data, onView, onInventoryComplete, onInventoryPartial, onUndoInventory }: DataTableProps) {
  const [sortField, setSortField] = useState<keyof BatchItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showLocation, setShowLocation] = useState<boolean>(true);

  // Handle sorting
  const toggleSort = (field: string) => {
    const batchField = field as keyof BatchItem;
    if (sortField === batchField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(batchField);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, sortField, sortDirection]);

  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'partially_completed':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Inventerad';
      case 'partially_completed':
        return 'Delvis inventerad';
      case 'not_started':
        return 'Ej påbörjad';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden" style={{ maxWidth: '100%' }}>
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Inventeringslista</h3>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-3"
            onClick={() => setShowLocation(!showLocation)}
          >
            <span className="material-icons mr-1 text-sm">
              {showLocation ? "visibility_off" : "visibility"}
            </span>
            {showLocation ? "Dölj lagerplats" : "Visa lagerplats"}
          </Button>
          
          <Button variant="outline" size="sm" className="h-9 px-3">
            <span className="material-icons mr-1 text-sm">refresh</span>
            Uppdatera
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto" style={{ overflowX: 'scroll' }}>
        <Table className="min-w-full w-max">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('articleNumber')}>
                Artikelnummer
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('description')}>
                Beskrivning
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              {showLocation && (
                <TableHead className="whitespace-nowrap" onClick={() => toggleSort('location')}>
                  Lagerplats
                  <button className="ml-1 text-gray-400">
                    <span className="material-icons text-sm">unfold_more</span>
                  </button>
                </TableHead>
              )}
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('batchNumber')}>
                Batchnummer
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('totalWeight')}>
                Totalt saldo
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('inventoredWeight')}>
                Inventerad vikt
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('status')}>
                Status
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              <TableHead className="text-right whitespace-nowrap">
                Åtgärder
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{item.articleNumber}</TableCell>
                <TableCell>{item.description}</TableCell>
                {showLocation && <TableCell>{item.location || '--'}</TableCell>}
                <TableCell>{item.batchNumber}</TableCell>
                <TableCell>{item.totalWeight} kg</TableCell>
                <TableCell>
                  {item.inventoredWeight !== null ? (
                    <span className={item.inventoredWeight > item.totalWeight ? 'text-orange-600 font-semibold' : ''}>
                      {item.inventoredWeight} kg
                      {item.inventoredWeight > item.totalWeight && (
                        <span className="ml-1 text-orange-600 text-xs" title="Inventerad vikt överstiger ursprunglig totalvikt">
                          ⚠️
                        </span>
                      )}
                    </span>
                  ) : '--'}
                </TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    
                    {/* Inventering/Delvis inventering för ej påbörjade */}
                    {item.status === 'not_started' && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => onInventoryComplete(item)}>
                                <span className="material-icons text-sm">check_circle</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Inventerat</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onInventoryPartial(item)}>
                                <span className="material-icons text-sm">indeterminate_check_box</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Inventerat del</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                    
                    {/* Fortsätt inventera för delvis inventerade */}
                    {item.status === 'partially_completed' && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => onInventoryComplete(item)}>
                                <span className="material-icons text-sm">check_circle</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Slutför inventering</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onInventoryPartial(item)}>
                                <span className="material-icons text-sm">add</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Fortsätt inventera</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                    
                    {/* Ångra-knapp för inventerade eller delvis inventerade */}
                    {(item.status === 'completed' || item.status === 'partially_completed') && onUndoInventory && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => onUndoInventory(item)}>
                              <span className="material-icons text-sm">undo</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ångra inventering</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Visar alla <span className="font-medium">{sortedData.length}</span> poster
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
