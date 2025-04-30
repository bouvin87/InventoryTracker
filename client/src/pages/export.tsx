import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BatchItem } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function Export() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [exportType, setExportType] = useState<string>("all");
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [includeInProgress, setIncludeInProgress] = useState(true);
  const [includeNotStarted, setIncludeNotStarted] = useState(true);
  
  const { toast } = useToast();
  
  // Fetch inventory data for stats
  const { data: batches, isLoading } = useQuery({
    queryKey: ['/api/batches'],
    select: (data: BatchItem[]) => data || [],
  });

  // Calculate statistics
  const totalBatches = batches?.length || 0;
  const completedBatches = batches?.filter(b => b.status === 'completed').length || 0;
  const inProgressBatches = batches?.filter(b => b.status === 'in_progress').length || 0;
  const notStartedBatches = batches?.filter(b => b.status === 'not_started').length || 0;

  // Export batches
  const handleExport = async () => {
    try {
      let url = '/api/export';
      const params = new URLSearchParams();
      
      if (exportType !== "all") {
        params.append('type', exportType);
      }
      
      // Add status filters if not all are selected
      const statuses: string[] = [];
      if (includeCompleted) statuses.push('completed');
      if (includeInProgress) statuses.push('in_progress');
      if (includeNotStarted) statuses.push('not_started');
      
      if (statuses.length > 0 && statuses.length < 3) {
        statuses.forEach(status => params.append('status', status));
      }
      
      // Append params to URL if any are set
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Create a download link for the Excel file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      
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
          onSearch={() => {}}
        />
        
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Exportera resultat</h2>
            <p className="text-gray-600 mt-1">Exportera inventeringsdata till Excel-format</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Totalt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{totalBatches}</p>
                <p className="text-sm text-gray-500 mt-1">batches</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Inventerade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-green-600">{completedBatches}</p>
                <p className="text-sm text-gray-500 mt-1">batches</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pågående</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-yellow-600">{inProgressBatches}</p>
                <p className="text-sm text-gray-500 mt-1">batches</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ej påbörjade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-red-600">{notStartedBatches}</p>
                <p className="text-sm text-gray-500 mt-1">batches</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="material-icons text-green-600">download</span>
                  Exportalternativ
                </CardTitle>
                <CardDescription>
                  Välj vilken data du vill exportera till Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="export-type">Export typ</Label>
                    <Select value={exportType} onValueChange={setExportType}>
                      <SelectTrigger id="export-type">
                        <SelectValue placeholder="Välj exporttyp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alla batches</SelectItem>
                        <SelectItem value="summary">Enbart sammanställning</SelectItem>
                        <SelectItem value="detailed">Detaljerad rapport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Inkludera status</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="completed" 
                          checked={includeCompleted}
                          onCheckedChange={(checked) => setIncludeCompleted(checked === true)}
                        />
                        <label
                          htmlFor="completed"
                          className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Inventerade batches
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="in-progress" 
                          checked={includeInProgress}
                          onCheckedChange={(checked) => setIncludeInProgress(checked === true)}
                        />
                        <label
                          htmlFor="in-progress"
                          className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Pågående batches
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="not-started" 
                          checked={includeNotStarted}
                          onCheckedChange={(checked) => setIncludeNotStarted(checked === true)}
                        />
                        <label
                          htmlFor="not-started"
                          className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Ej påbörjade batches
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleExport} 
                      disabled={isLoading || (!includeCompleted && !includeInProgress && !includeNotStarted)}
                      className="w-full sm:w-auto"
                    >
                      <span className="material-icons mr-2 text-sm">download</span>
                      Exportera till Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
