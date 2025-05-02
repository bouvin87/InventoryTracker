import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseExcel, generateExcel } from "./excel";
import { insertBatchSchema, updateBatchSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import { setupAuth } from "./auth";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Konfigurera autentisering
  setupAuth(app);
  
  // Get all users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Clear all batches
  app.delete('/api/batches', async (req, res) => {
    try {
      await storage.clearAllBatches();
      res.json({ message: "All batches have been cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear batches" });
    }
  });

  // Get all batches
  app.get('/api/batches', async (req, res) => {
    try {
      const batches = await storage.getAllBatches();
      res.json(batches);
    } catch (error) {
      res.status(500).json({ message: "Failed to get batches" });
    }
  });

  // Get batch by ID
  app.get('/api/batches/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const batch = await storage.getBatch(id);
      
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      
      res.json(batch);
    } catch (error) {
      res.status(500).json({ message: "Failed to get batch" });
    }
  });

  // Create a new batch
  app.post('/api/batches', async (req, res) => {
    try {
      const validatedData = insertBatchSchema.parse(req.body);
      
      const newBatch = await storage.createBatch(validatedData);
      res.json(newBatch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create batch" });
    }
  });

  // Update batch
  app.put('/api/batches/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const batch = await storage.getBatch(id);
      
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      
      const validatedData = updateBatchSchema.parse(req.body);
      
      const updatedBatch = await storage.updateBatch(id, validatedData);
      res.json(updatedBatch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update batch" });
    }
  });
  
  // Mark batch as inventoried (fully)
  app.post('/api/batches/:id/inventory-complete', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const batch = await storage.getBatch(id);
      
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      
      // Validate request body
      const schema = z.object({
        location: z.string().optional(),
        userId: z.number().optional(),
        userName: z.string().optional()
      });
      
      // Parse body even if it's empty
      const { location, userId, userName } = schema.parse(req.body || {});
      
      // First update the location if provided
      if (location) {
        await storage.updateBatch(id, {
          location,
          status: batch.status, // Keep current status
          updatedAt: new Date().toISOString()
        });
      }
      
      const updatedBatch = await storage.markBatchAsInventored(id, userId, userName);
      res.json(updatedBatch);
    } catch (error) {
      console.error("Error marking batch as inventoried:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input values", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to mark batch as inventoried" });
    }
  });
  
  // Keep the old endpoint for backward compatibility
  app.post('/api/batches/:id/inventoried', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const batch = await storage.getBatch(id);
      
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      
      const updatedBatch = await storage.markBatchAsInventored(id);
      res.json(updatedBatch);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark batch as inventoried" });
    }
  });
  
  // Mark batch as partially inventoried
  app.post('/api/batches/:id/inventory-partial', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const batch = await storage.getBatch(id);
      
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      
      // Validate weight and location from request body
      const schema = z.object({
        weight: z.number().min(0),
        location: z.string().optional(),
        userId: z.number().optional(),
        userName: z.string().optional()
      });
      
      const { weight, location, userId, userName } = schema.parse(req.body);
      console.log(`Marking batch ${id} as partially inventoried with weight ${weight} and location ${location || 'not specified'}`);
      
      // First update the location if provided
      if (location) {
        await storage.updateBatch(id, {
          location,
          status: batch.status, // Keep current status
          updatedAt: new Date().toISOString()
        });
      }
      
      const updatedBatch = await storage.markBatchAsPartiallyInventored(id, weight, userId, userName);
      res.json(updatedBatch);
    } catch (error) {
      console.error("Error marking batch as partially inventoried:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input values", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to mark batch as partially inventoried" });
    }
  });
  
  // Keep the old endpoint for backward compatibility
  app.post('/api/batches/:id/partially-inventoried', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const batch = await storage.getBatch(id);
      
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      
      // Validate weight from request body
      const schema = z.object({
        weight: z.number().min(0)
      });
      
      const { weight } = schema.parse(req.body);
      
      const updatedBatch = await storage.markBatchAsPartiallyInventored(id, weight);
      res.json(updatedBatch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid weight value", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to mark batch as partially inventoried" });
    }
  });

  // Import Excel file
  app.post('/api/import', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const overwrite = req.body.overwrite === 'true';
      
      const batches = await parseExcel(req.file.buffer);
      
      // Validate batch data
      const validBatches = [];
      for (const batch of batches) {
        try {
          const validatedBatch = insertBatchSchema.parse(batch);
          validBatches.push(validatedBatch);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return res.status(400).json({ 
              message: "Invalid data in Excel file", 
              errors: error.errors,
              row: batches.indexOf(batch) + 2 // +2 to account for header row and 0-indexing
            });
          }
          throw error;
        }
      }
      
      // Store batches
      await storage.importBatches(validBatches, overwrite);
      
      res.json({ message: "Import successful", count: validBatches.length });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ message: "Failed to import Excel file", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Parse Excel file without importing
  app.post('/api/parse-excel', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const batches = await parseExcel(req.file.buffer);
      res.json(batches);
    } catch (error) {
      res.status(500).json({ message: "Failed to parse Excel file", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Undo inventory (reset to not started)
  app.post('/api/batches/:id/undo-inventory', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const batch = await storage.getBatch(id);
      
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      
      // Reset the batch to not started state
      const updatedBatch = await storage.updateBatch(id, {
        status: 'not_started',
        inventoredWeight: null,
        updatedAt: new Date().toISOString()
      });
      
      res.json(updatedBatch);
    } catch (error) {
      console.error("Error undoing inventory:", error);
      res.status(500).json({ message: "Failed to undo inventory" });
    }
  });

  // Export to Excel
  app.get('/api/export', async (req, res) => {
    try {
      const type = req.query.type as string || 'all';
      
      // Parse status filters
      let statuses: string[] | undefined;
      if (req.query.status) {
        if (Array.isArray(req.query.status)) {
          statuses = req.query.status as string[];
        } else {
          statuses = [req.query.status as string];
        }
      }
      
      const batches = await storage.getAllBatches();
      
      // Filter batches by status if requested
      const filteredBatches = statuses 
        ? batches.filter(batch => statuses!.includes(batch.status))
        : batches;
      
      const excelBuffer = await generateExcel(filteredBatches, type);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to export Excel file", error: error instanceof Error ? error.message : String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
