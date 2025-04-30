import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

const ITEMS_PER_PAGE = 5;

export function DataTable({ data, onView, onInventoryComplete, onInventoryPartial, onUndoInventory }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof BatchItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Generate page numbers for pagination
  const pageNumbers = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, 5);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
    }
  }

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Inventeringslista</h3>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 px-3">
            <span className="material-icons mr-1 text-sm">refresh</span>
            Uppdatera
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('batchNumber')}>
                Batchnummer
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
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
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('location')}>
                Lagerplats
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('totalWeight')}>
                Total vikt
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
              <TableHead className="whitespace-nowrap" onClick={() => toggleSort('updatedAt')}>
                Senast uppdaterad
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
            {paginatedData.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{item.batchNumber}</TableCell>
                <TableCell>{item.articleNumber}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.location || '--'}</TableCell>
                <TableCell>{item.totalWeight} kg</TableCell>
                <TableCell>{item.inventoredWeight !== null ? `${item.inventoredWeight} kg` : '--'}</TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </TableCell>
                <TableCell>{item.updatedAt || '--'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => onView(item)}>
                            <span className="material-icons text-sm">visibility</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visa</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
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
        <div className="flex-1 flex justify-between sm:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Föregående
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Nästa
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Visar <span className="font-medium">{startIndex + 1}</span> till{" "}
              <span className="font-medium">
                {Math.min(startIndex + ITEMS_PER_PAGE, sortedData.length)}
              </span>{" "}
              av <span className="font-medium">{sortedData.length}</span> resultat
            </p>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(Math.max(1, currentPage - 1));
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {pageNumbers.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === pageNumber}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {totalPages > 5 && currentPage < totalPages - 2 && <PaginationEllipsis />}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(Math.min(totalPages, currentPage + 1));
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
