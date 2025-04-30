import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { BatchItem, UpdateBatchItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: BatchItem | null;
  onSave: (id: number, data: UpdateBatchItem) => Promise<void>;
}

export function InventoryModal({ isOpen, onClose, batch, onSave }: InventoryModalProps) {
  const [inventoredWeight, setInventoredWeight] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState<string>("");
  const [status, setStatus] = useState<string>("completed");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (batch) {
      setInventoredWeight(batch.inventoredWeight || undefined);
      setLocation(batch.location || "");
      setStatus(batch.status);
    }
  }, [batch]);

  const handleSave = async () => {
    if (!batch) return;
    
    if (status === "completed" && inventoredWeight === undefined) {
      toast({
        title: "Validering misslyckades",
        description: "Vänligen ange inventerad vikt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(batch.id, {
        location,
        inventoredWeight: status === "completed" ? batch.totalWeight : (inventoredWeight || 0),
        status,
        updatedAt: new Date().toISOString().substring(0, 16).replace('T', ' ')
      });
      
      toast({
        title: "Inventering sparad",
        description: "Inventeringen har sparats framgångsrikt",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Kunde inte spara",
        description: error instanceof Error ? error.message : "Ett okänt fel uppstod vid sparande",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!batch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inventera batch: {batch.batchNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Artikelnummer</p>
                <p className="text-sm font-medium">{batch.articleNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Beskrivning</p>
                <p className="text-sm font-medium">{batch.description}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total vikt</p>
                <p className="text-sm font-medium">{batch.totalWeight} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Inventerad vikt</p>
                <p className="text-sm font-medium">{batch.inventoredWeight !== null ? `${batch.inventoredWeight} kg` : '--'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Lagerplats</Label>
            <Input 
              type="text" 
              id="location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ange lagerplats"
            />
          </div>
          
          {status === "partially_completed" && (
            <div className="space-y-2">
              <Label htmlFor="inventoredWeight">Inventerad vikt (kg)</Label>
              <div className="flex rounded-md shadow-sm">
                <Input 
                  type="number" 
                  id="inventoredWeight" 
                  value={inventoredWeight === undefined ? "" : inventoredWeight}
                  onChange={(e) => setInventoredWeight(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="rounded-r-none"
                  placeholder="0"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-gray-50 text-gray-500 text-sm">
                  kg
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Välj status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Inventerad</SelectItem>
                <SelectItem value="partially_completed">Delvis inventerad</SelectItem>
                <SelectItem value="not_started">Ej påbörjad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Avbryt</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Sparar..." : "Spara"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
