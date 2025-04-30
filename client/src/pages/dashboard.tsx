import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { InventoryFilter, FilterValues } from "@/components/inventory/inventory-filter";
import { ImportModal } from "@/components/inventory/import-modal";
import { PartialInventoryModal } from "@/components/inventory/partial-inventory-modal";
import { AddBatchModal } from "@/components/inventory/add-batch-modal";
import { BatchItem, UpdateBatchItem, InsertBatch } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPartialInventoryModalOpen, setIsPartialInventoryModalOpen] = useState(false);
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterValues>({
    status: "all",
    batchNumber: "",
  });
  
  const { toast } = useToast();

  // Fetch inventory data
  const { data: batches, isLoading } = useQuery({
    queryKey: ['/api/batches'],
    select: (data: BatchItem[]) => data || [],
  });

  // Filter data based on search term and filters
  const filteredBatches = batches?.filter(batch => {
    // Search filter
    const searchMatch = 
      !searchTerm || 
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const statusMatch = filters.status === "all" || batch.status === filters.status;
    
    // Batch number filter
    const batchNumberMatch = !filters.batchNumber || 
      batch.batchNumber.toLowerCase().includes(filters.batchNumber.toLowerCase());
    
    return searchMatch && statusMatch && batchNumberMatch;
  }) || [];

  // Calculate statistics
  const totalBatches = filteredBatches.length;
  const completedBatches = filteredBatches.filter(b => b.status === 'completed').length;
  const partiallyCompletedBatches = filteredBatches.filter(b => b.status === 'partially_completed').length;
  const notStartedBatches = filteredBatches.filter(b => b.status === 'not_started').length;
  const completionPercentage = totalBatches ? Math.round((completedBatches / totalBatches) * 100) : 0;

  // Update batch mutation
  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: UpdateBatchItem }) => {
      return apiRequest<BatchItem>('PUT', `/api/batches/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
    },
  });

  // Import batches mutation
  const importBatchesMutation = useMutation({
    mutationFn: async ({ file, overwrite }: { file: File, overwrite: boolean }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('overwrite', overwrite.toString());
      
      // Use fetch directly since apiRequest doesn't support FormData
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      toast({
        title: "Import lyckades",
        description: "Batchdata har importerats framgångsrikt",
      });
    },
  });

  

  // Export batches
  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Create a download link for the Excel file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export lyckades",
        description: "Inventeringsdata har exporterats till Excel",
      });
    } catch (error) {
      toast({
        title: "Export misslyckades",
        description: "Kunde inte exportera data till Excel",
        variant: "destructive",
      });
    }
  };

  // Complete inventory mutation
  const completeInventoryMutation = useMutation({
    mutationFn: async ({ id, location }: { id: number, location?: string }) => {
      await apiRequest('POST', `/api/batches/${id}/inventory-complete`, { location });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      toast({
        title: "Inventering slutförd",
        description: "Batchen har markerats som inventerad",
      });
    },
  });

  // Partial inventory mutation
  const partialInventoryMutation = useMutation({
    mutationFn: async ({ id, weight, location }: { id: number, weight: number, location: string }) => {
      await apiRequest('POST', `/api/batches/${id}/inventory-partial`, { weight, location });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      toast({
        title: "Delvis inventering slutförd",
        description: "Batchen har markerats som delvis inventerad",
      });
    },
  });
  
  // Undo inventory mutation
  const undoInventoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('POST', `/api/batches/${id}/undo-inventory`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      toast({
        title: "Inventering ångrad",
        description: "Batchen har återställts till ej påbörjad status",
      });
    },
  });

  // Handle batch actions
  const handleViewBatch = (batch: BatchItem) => {
    setSelectedBatch(batch);
  };

  const handleInventoryComplete = async (batch: BatchItem) => {
    try {
      // Vi skickar med location om den finns, annars lämnar vi den odefinierad
      const payload: { id: number; location?: string } = {
        id: batch.id
      };
      
      if (batch.location) {
        payload.location = batch.location;
      }
      
      await completeInventoryMutation.mutateAsync(payload);
    } catch (error) {
      toast({
        title: "Fel vid inventering",
        description: "Kunde inte markera batch som inventerad",
        variant: "destructive",
      });
    }
  };

  const handleInventoryPartial = (batch: BatchItem) => {
    setSelectedBatch(batch);
    setIsPartialInventoryModalOpen(true);
  };

  const handleConfirmPartialInventory = async (id: number, weight: number, location: string) => {
    await partialInventoryMutation.mutateAsync({ id, weight, location });
  };

  const handleImportFile = async (file: File, overwrite: boolean) => {
    await importBatchesMutation.mutateAsync({ file, overwrite });
  };
  
  const handleUndoInventory = async (batch: BatchItem) => {
    try {
      await undoInventoryMutation.mutateAsync(batch.id);
    } catch (error) {
      toast({
        title: "Fel vid återställning",
        description: "Kunde inte ångra inventering",
        variant: "destructive",
      });
    }
  };

  // Add batch mutation
  const addBatchMutation = useMutation({
    mutationFn: async (data: InsertBatch) => {
      return apiRequest<BatchItem>('POST', '/api/batches', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      toast({
        title: "Batch tillagd",
        description: "Ny batch har lagts till",
      });
    },
  });

  const handleAddBatch = async (data: InsertBatch, markAsInventoried: boolean) => {
    try {
      // Skapa batch
      const newBatch = await addBatchMutation.mutateAsync(data);
      
      // Om den ska markeras som inventerad direkt
      if (markAsInventoried && newBatch) {
        await completeInventoryMutation.mutateAsync({ 
          id: newBatch.id,
          location: data.location || undefined
        });
      }
    } catch (error) {
      toast({
        title: "Fel vid tillägg av batch",
        description: "Kunde inte lägga till batch",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <Button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-primary text-white p-3 rounded-full shadow-lg flex items-center justify-center h-12 w-12"
        >
          <span className="material-icons">menu</span>
        </Button>
      </div>
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-10">
        <TopBar 
          toggleSidebar={() => setIsSidebarOpen(true)} 
          onSearch={setSearchTerm}
          onAddBatch={() => setIsAddBatchModalOpen(true)}
        />
        
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Batchinventering</h2>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setIsImportModalOpen(true)}
                className="bg-primary text-white"
              >
                <span className="material-icons mr-2 text-sm">upload_file</span>
                Importera batch
              </Button>
              
              <Button 
                onClick={handleExport}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <span className="material-icons mr-2 text-sm">download</span>
                Exportera resultat
              </Button>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              icon="inventory_2"
              iconColor="text-primary"
              backgroundColor="bg-primary-100"
              title="Totalt antal batches"
              value={totalBatches}
            />
            
            <StatCard
              icon="check_circle"
              iconColor="text-green-600"
              backgroundColor="bg-green-100"
              title="Inventerade batches"
              value={completedBatches}
              progressValue={completionPercentage}
              progressText={`${completionPercentage}% klart`}
            />
            
            <StatCard
              icon="indeterminate_check_box"
              iconColor="text-blue-600"
              backgroundColor="bg-blue-100"
              title="Delvis inventerade"
              value={partiallyCompletedBatches}
            />
            
            <StatCard
              icon="pending_actions"
              iconColor="text-red-600"
              backgroundColor="bg-red-100"
              title="Ej påbörjade batches"
              value={notStartedBatches}
            />
          </div>
          
          {/* Filters */}
          <InventoryFilter onFilter={setFilters} />
          
          {/* Inventory table */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
              Laddar inventeringsdata...
            </div>
          ) : (
            <DataTable 
              data={filteredBatches}
              onView={handleViewBatch}
              onInventoryComplete={handleInventoryComplete}
              onInventoryPartial={handleInventoryPartial}
              onUndoInventory={handleUndoInventory}
            />
          )}
        </div>
      </main>
      
      {/* Modals */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportFile}
      />
      
      <PartialInventoryModal
        isOpen={isPartialInventoryModalOpen}
        onClose={() => setIsPartialInventoryModalOpen(false)}
        batch={selectedBatch}
        onConfirm={handleConfirmPartialInventory}
      />

      <AddBatchModal
        isOpen={isAddBatchModalOpen}
        onClose={() => setIsAddBatchModalOpen(false)}
        onAdd={handleAddBatch}
      />
    </div>
  );
}
