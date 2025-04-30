import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [actualQuantity, setActualQuantity] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<string>("completed");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (batch) {
      setActualQuantity(batch.actualQuantity || undefined);
      setNotes(batch.notes || "");
      setStatus(batch.status);
    }
  }, [batch]);

  const handleSave = async () => {
    if (!batch) return;
    
    if (actualQuantity === undefined) {
      toast({
        title: "Validering misslyckades",
        description: "Vänligen ange inventerad mängd",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(batch.id, {
        actualQuantity,
        notes,
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
                <p className="text-xs text-gray-500">Produkt</p>
                <p className="text-sm font-medium">{batch.product}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lagerplats</p>
                <p className="text-sm font-medium">{batch.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Förväntad mängd</p>
                <p className="text-sm font-medium">{batch.expectedQuantity} {batch.unit}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Enhet</p>
                <p className="text-sm font-medium">{batch.unit}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="actualCount">Inventerad mängd</Label>
            <div className="flex rounded-md shadow-sm">
              <Input 
                type="number" 
                id="actualCount" 
                value={actualQuantity === undefined ? "" : actualQuantity}
                onChange={(e) => setActualQuantity(e.target.value ? parseInt(e.target.value) : undefined)}
                className="rounded-r-none"
                placeholder="0"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-gray-50 text-gray-500 text-sm">
                {batch.unit}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Noteringar om inventeringen..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Välj status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Inventerad</SelectItem>
                <SelectItem value="in_progress">Pågående</SelectItem>
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
