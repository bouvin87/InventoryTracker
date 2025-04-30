import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BatchItem } from "@shared/schema";

interface PartialInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: BatchItem | null;
  onConfirm: (id: number, weight: number, location: string) => Promise<void>;
}

export function PartialInventoryModal({ 
  isOpen, 
  onClose,
  batch, 
  onConfirm 
}: PartialInventoryModalProps) {
  const [weight, setWeight] = useState<number>(0);
  const [location, setLocation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (batch && isOpen) {
      // Initialize with a default value of half the total weight
      setWeight(Math.floor(batch.totalWeight / 2));
      setLocation(batch.location || "");
      setError(null);
    }
  }, [batch, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batch) return;
    
    // Validate input
    if (weight <= 0) {
      setError("Vikten måste vara större än 0.");
      return;
    }
    
    if (weight > batch.totalWeight) {
      setError(`Vikten kan inte överstiga total vikt (${batch.totalWeight} kg).`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onConfirm(batch.id, weight, location);
      onClose();
    } catch (err) {
      setError("Ett fel uppstod vid uppdatering.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!batch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delvis inventering</DialogTitle>
          <DialogDescription>
            Ange inventerad vikt för batch {batch.batchNumber}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalWeight" className="text-right">
                Total vikt:
              </Label>
              <div className="col-span-3">
                <Input
                  id="totalWeight"
                  value={batch.totalWeight}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inventoryWeight" className="text-right">
                Inventerad vikt:
              </Label>
              <div className="col-span-3">
                <Input
                  id="inventoryWeight"
                  type="number"
                  min={0}
                  max={batch.totalWeight}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Lagerplats:
              </Label>
              <div className="col-span-3">
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ange lagerplats"
                />
              </div>
            </div>
            
            {error && (
              <div className="col-span-4 text-red-500 text-sm mt-1">
                {error}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sparar..." : "Spara"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}