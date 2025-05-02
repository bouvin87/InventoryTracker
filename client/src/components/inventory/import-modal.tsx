import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { importExcel } from "@/lib/excel";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, overwrite: boolean) => Promise<void>;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

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

    setIsLoading(true);
    try {
      // Visa en initial toast för att indikera att import har börjat
      toast({
        title: "Import pågår",
        description: "Importerar Excel-data. Detta kan ta en stund för stora filer...",
      });
      
      await onImport(file, overwrite);
      
      // Visa en toast när importen är klar
      toast({
        title: "Import lyckades",
        description: "Excel-filen har importerats framgångsrikt",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Import misslyckades",
        description: error instanceof Error ? error.message : "Ett okänt fel uppstod vid import",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="material-icons text-primary">upload_file</span>
            Importera Excel-fil med batches
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">
            Välj en Excel-fil som innehåller batchdata för att importera till systemet.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="file-upload">Excel-fil</Label>
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
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80"
                  >
                    <span>Ladda upp en fil</span>
                    <input
                      id="file-upload"
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
              id="overwrite" 
              checked={overwrite} 
              onCheckedChange={(checked) => setOverwrite(checked === true)}
            />
            <label
              htmlFor="overwrite"
              className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Skriv över befintliga batches om batchnummer matchar
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? "Importerar..." : "Importera"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
