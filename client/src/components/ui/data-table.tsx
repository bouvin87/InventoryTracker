import React, { useState, useMemo, memo, useEffect } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableProps {
  data: BatchItem[];
  onView: (item: BatchItem) => void;
  onInventoryComplete: (item: BatchItem) => void;
  onInventoryPartial: (item: BatchItem) => void;
  onUndoInventory?: (item: BatchItem) => void;
  resetToFirstPage?: boolean;
}

export function DataTable({
  data,
  onView,
  onInventoryComplete,
  onInventoryPartial,
  onUndoInventory,
  resetToFirstPage,
}: DataTableProps) {
  const [sortField, setSortField] = useState<keyof BatchItem | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showLocation, setShowLocation] = useState<boolean>(false);
  const [showUser, setShowUser] = useState<boolean>(false);
  const [showStatus, setShowStatus] = useState<boolean>(true);
  const [showInventoried, setShowInventoried] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); // Visa 50 rader åt gången som standard

  // Återställ till första sidan när itemsPerPage ändras
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Återställ till första sidan när data ändras (vid filtrering)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Handle sorting
  const toggleSort = (field: string) => {
    const batchField = field as keyof BatchItem;
    if (sortField === batchField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(batchField);
      setSortDirection("asc");
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    let sortedResults = [...data];

    if (sortField) {
      // Om användaren har valt en specifik sortering, använd den
      sortedResults = sortedResults.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          if (sortDirection === "asc") {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }

        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    } else {
      // Steg 1: Gruppera batches efter artikelnummer
      const articleGroups: Record<string, BatchItem[]> = {};

      sortedResults.forEach((batch) => {
        const articleNumber = batch.articleNumber;
        if (!articleGroups[articleNumber]) {
          articleGroups[articleNumber] = [];
        }
        articleGroups[articleNumber].push(batch);
      });

      // Steg 2: Sortera varje grupp efter vikt (stigande från låg till hög) och sedan batchnummer
      Object.keys(articleGroups).forEach((articleNumber) => {
        articleGroups[articleNumber].sort((a, b) => {
          // Primär sortering på vikt (lägst först)
          if (a.totalWeight !== b.totalWeight) {
            return a.totalWeight - b.totalWeight;
          }

          // Sekundär sortering på batchnummer
          return a.batchNumber.localeCompare(b.batchNumber);
        });
      });

      // Steg 3: Sortera artikelnummer i stigande ordning
      const sortedArticleNumbers = Object.keys(articleGroups).sort();

      // Steg 4: Flata ut resultatet tillbaka till en array
      sortedResults = [];
      sortedArticleNumbers.forEach((articleNumber) => {
        sortedResults.push(...articleGroups[articleNumber]);
      });
    }

    return sortedResults;
  }, [data, sortField, sortDirection]);

  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "partially_completed":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Inventerad";
      case "partially_completed":
        return "Delvis inventerad";
      case "not_started":
        return "Ej påbörjad";
      default:
        return status;
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
      style={{ maxWidth: "100%" }}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Inventeringslista</h3>
          <p className="text-sm text-gray-500">
            {sortedData.length > itemsPerPage 
              ? `Visar ${Math.min(currentPage * itemsPerPage, sortedData.length)} av ${sortedData.length} poster`
              : `${sortedData.length} poster`
            }
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            onClick={() => setShowStatus(!showStatus)}
          >
            <span className="material-icons mr-1 text-sm">
              {showStatus ? "visibility_off" : "visibility"}
            </span>
            {showStatus ? "Dölj status" : "Visa status"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            onClick={() => setShowInventoried(!showInventoried)}
          >
            <span className="material-icons mr-1 text-sm">
              {showInventoried ? "visibility_off" : "visibility"}
            </span>
            {showInventoried ? "Dölj inv." : "Visa inv."}
          </Button>

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

          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            onClick={() => setShowUser(!showUser)}
          >
            <span className="material-icons mr-1 text-sm">
              {showUser ? "visibility_off" : "visibility"}
            </span>
            {showUser ? "Dölj användare" : "Visa användare"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ overflowX: "scroll" }}>
        <Table className="min-w-full w-max">
          <TableHeader className="bg-gray-50">
            <TableRow>
              {showStatus && (
                <TableHead
                  className="whitespace-nowrap"
                  onClick={() => toggleSort("status")}
                >
                  Status
                  <button className="ml-1 text-gray-400">
                    <span className="material-icons text-sm">unfold_more</span>
                  </button>
                </TableHead>
              )}
              <TableHead
                className="whitespace-nowrap"
                onClick={() => toggleSort("articleNumber")}
              >
                Artikelnr
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              <TableHead
                className="whitespace-nowrap"
                onClick={() => toggleSort("description")}
              >
                Beskrivning
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              {showLocation && (
                <TableHead
                  className="whitespace-nowrap"
                  onClick={() => toggleSort("location")}
                >
                  Lagerplats
                  <button className="ml-1 text-gray-400">
                    <span className="material-icons text-sm">unfold_more</span>
                  </button>
                </TableHead>
              )}
              <TableHead
                className="whitespace-nowrap"
                onClick={() => toggleSort("batchNumber")}
              >
                Batchnr
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              <TableHead
                className="whitespace-nowrap"
                onClick={() => toggleSort("totalWeight")}
              >
                Vikt
                <button className="ml-1 text-gray-400">
                  <span className="material-icons text-sm">unfold_more</span>
                </button>
              </TableHead>
              {showInventoried && (
                <TableHead
                  className="whitespace-nowrap"
                  onClick={() => toggleSort("inventoredWeight")}
                >
                  Inv. vikt
                  <button className="ml-1 text-gray-400">
                    <span className="material-icons text-sm">unfold_more</span>
                  </button>
                </TableHead>
              )}
              {showUser && (
                <TableHead
                  className="whitespace-nowrap"
                  onClick={() => toggleSort("userName")}
                >
                  Användare
                  <button className="ml-1 text-gray-400">
                    <span className="material-icons text-sm">unfold_more</span>
                  </button>
                </TableHead>
              )}
              <TableHead className="text-right whitespace-nowrap">
                Åtgärder
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                {showStatus && (
                  <TableCell>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(item.status)}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {item.articleNumber}
                </TableCell>
                <TableCell>{item.description}</TableCell>
                {showLocation && <TableCell>{item.location || "--"}</TableCell>}
                <TableCell>{item.batchNumber}</TableCell>
                <TableCell>{item.totalWeight} kg</TableCell>
                {showInventoried && (
                  <TableCell>
                    {item.inventoredWeight !== null ? (
                      <span
                        className={
                          item.inventoredWeight > item.totalWeight
                            ? "text-orange-600 font-semibold"
                            : ""
                        }
                      >
                        {item.inventoredWeight} kg
                        {item.inventoredWeight > item.totalWeight && (
                          <span
                            className="ml-1 text-orange-600 text-xs"
                            title="Inventerad vikt överstiger ursprunglig totalvikt"
                          >
                            ⚠️
                          </span>
                        )}
                      </span>
                    ) : (
                      "--"
                    )}
                  </TableCell>
                )}
                {showUser && <TableCell>{item.userName || "--"}</TableCell>}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Inventering/Delvis inventering för ej påbörjade */}
                    {item.status === "not_started" && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() => onInventoryComplete(item)}
                              >
                                <span className="material-icons text">
                                  check_circle
                                </span>
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600"
                                onClick={() => onInventoryPartial(item)}
                              >
                                <span className="material-icons text">
                                  indeterminate_check_box
                                </span>
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
                    {item.status === "partially_completed" && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() => onInventoryComplete(item)}
                              >
                                <span className="material-icons text">
                                  check_circle
                                </span>
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600"
                                onClick={() => onInventoryPartial(item)}
                              >
                                <span className="material-icons text">add</span>
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
                    {(item.status === "completed" ||
                      item.status === "partially_completed") &&
                      onUndoInventory && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => onUndoInventory(item)}
                              >
                                <span className="material-icons text">
                                  undo
                                </span>
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

      {/* Paginering för bättre prestanda */}
      <div className="bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-700">
              Visar{" "}
              <span className="font-medium">
                {sortedData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              till{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, sortedData.length)}
              </span>{" "}
              av{" "}
              <span className="font-medium">{sortedData.length}</span> poster
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rader per sida:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value={sortedData.length.toString()}>Alla</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {sortedData.length > itemsPerPage && (
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium"
              >
                <span className="material-icons text-sm">chevron_left</span>
                Föregående
              </Button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Sida {currentPage} av {Math.ceil(sortedData.length / itemsPerPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(Math.ceil(sortedData.length / itemsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(sortedData.length / itemsPerPage)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium"
              >
                Nästa
                <span className="material-icons text-sm">chevron_right</span>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
