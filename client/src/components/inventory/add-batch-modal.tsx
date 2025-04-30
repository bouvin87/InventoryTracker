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
import { Checkbox } from "@/components/ui/checkbox";
import { InsertBatch } from "@shared/schema";

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: InsertBatch, markAsInventoried: boolean) => Promise<void>;
}

export function AddBatchModal({ 
  isOpen, 
  onClose,
  onAdd 
}: AddBatchModalProps) {
  const [batchNumber, setBatchNumber] = useState("");
  const [articleNumber, setArticleNumber] = useState("");
  const [description, setDescription] = useState("");
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [isInventoried, setIsInventoried] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setBatchNumber("");
      setArticleNumber("");
      setDescription("");
      setTotalWeight(0);
      setLocation("");
      setIsInventoried(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!batchNumber) {
      setError("Batchnummer måste anges.");
      return;
    }
    
    if (!articleNumber) {
      setError("Artikelnummer måste anges.");
      return;
    }
    
    if (totalWeight <= 0) {
      setError("Saldo måste vara större än 0.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onAdd({ 
        batchNumber, 
        articleNumber,
        description,
        totalWeight,
        location
      }, isInventoried);
      onClose();
    } catch (err) {
      setError("Ett fel uppstod vid skapande av batch.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lägg till batch manuellt</DialogTitle>
          <DialogDescription>
            Fyll i information för att skapa en ny batch
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batchNumber" className="text-right">
                Batchnummer:
              </Label>
              <div className="col-span-3">
                <Input
                  id="batchNumber"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Ange batchnummer"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="articleNumber" className="text-right">
                Artikelnummer:
              </Label>
              <div className="col-span-3">
                <Input
                  id="articleNumber"
                  value={articleNumber}
                  onChange={(e) => setArticleNumber(e.target.value)}
                  placeholder="Ange artikelnummer"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Beskrivning:
              </Label>
              <div className="col-span-3">
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ange beskrivning"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalWeight" className="text-right">
                Saldo:
              </Label>
              <div className="col-span-3">
                <Input
                  id="totalWeight"
                  type="number"
                  min={1}
                  step={1}
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(Number(e.target.value))}
                  required
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ange lagerplats"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1"></div>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox 
                  id="isInventoried" 
                  checked={isInventoried} 
                  onCheckedChange={(checked) => setIsInventoried(checked === true)}
                />
                <Label 
                  htmlFor="isInventoried" 
                  className="cursor-pointer"
                >
                  Redan inventerad
                </Label>
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