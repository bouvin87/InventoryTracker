import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { queryClient } from "@/lib/queryClient";
import { Switch } from "wouter";

export default function Import() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  // Import batches mutation
  const importBatchesMutation = useMutation({
    mutationFn: async ({ file, overwrite }: { file: File, overwrite: boolean }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('overwrite', overwrite.toString());
      
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
      setFile(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Ogiltig filtyp",
        description: "Vänligen välj en Excel-fil (.xls eller .xlsx)",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Ingen fil vald",
        description: "Vänligen välj en Excel-fil att importera",
        variant: "destructive",
      });
      return;
    }

    try {
      await importBatchesMutation.mutateAsync({ file, overwrite });
    } catch (error) {
      // Error is already handled in the mutation
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
          onAddBatch={() => {}}
        />
        
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Importera data</h2>
            <p className="text-gray-600 mt-1">Ladda upp Excel-filer med batchdata för att importera till systemet</p>
          </div>
          
          <div className="max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="material-icons text-primary">upload_file</span>
                  Excel-import
                </CardTitle>
                <CardDescription>
                  Ladda upp en Excel-fil med batchdata. Filen ska innehålla kolumner för batchnummer, artikelnummer, beskrivning, lagerplats och totalvikt.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload-page">Excel-fil</Label>
                    <div
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                        isDragging ? "border-primary bg-primary-50" : "border-gray-300"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-1 text-center">
                        <span className="material-icons text-gray-400 text-3xl">description</span>
                        <div className="flex text-sm text-gray-600">
                          <Label
                            htmlFor="file-upload-page"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80"
                          >
                            <span>Ladda upp en fil</span>
                            <input
                              id="file-upload-page"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".xlsx,.xls"
                              onChange={handleFileChange}
                            />
                          </Label>
                          <p className="pl-1">eller dra och släpp</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Excel-fil (.xlsx, .xls)
                        </p>
                        {file && (
                          <p className="text-sm text-primary font-medium mt-2">
                            {file.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="overwrite-page" 
                      checked={overwrite} 
                      onCheckedChange={(checked) => setOverwrite(checked === true)}
                    />
                    <label
                      htmlFor="overwrite-page"
                      className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Skriv över befintliga batches om batchnummer matchar
                    </label>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleImport} 
                      disabled={!file || importBatchesMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {importBatchesMutation.isPending ? "Importerar..." : "Importera data"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Exempelformat för Excel-filen</h3>
              
              <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        batchNumber
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        articleNumber
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        totalWeight
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A12345</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">45678</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mässingdetalj</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A-12-5</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">B67890</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">67890</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Kopparhylsa</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">B-05-3</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
