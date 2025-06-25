import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseExcel, generateExcel } from "./excel";
import { insertBatchSchema, updateBatchSchema, users, batches } from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import { setupAuth } from "./auth";
import { db } from "./db";
import { WebSocketServer, WebSocket } from 'ws';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit - utökad för att hantera större Excel-filer
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Konfigurera autentisering
  setupAuth(app);
  
  // Get all users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Returnera bara nödvändig information för dropdown (uteslut lösenord)
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Update user
  app.put('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const updateSchema = z.object({
        name: z.string().min(1, "Namnet får inte vara tomt"),
        username: z.string().min(1, "Användarnamnet får inte vara tomt"),
        role: z.string().min(1, "Rollen får inte vara tom"),
        password: z.string().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(id, validatedData);
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role
      });
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input values", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Prevent deletion of the currently logged in user
      if (req.user && req.user.id === id) {
        return res.status(400).json({ message: "Du kan inte ta bort din egen användare" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "Användaren har tagits bort" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Visa användardetaljer (dev only)
  app.get('/api/debug-users', async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers.map(user => ({
        id: user.id,
        username: user.username,
        passwordStart: user.password.substring(0, 20) + '...',
        passwordLength: user.password.length,
        hasPasswordDot: user.password.includes('.'),
        name: user.name,
        role: user.role
      })));
    } catch (error) {
      console.error("Error getting debug users:", error);
      res.status(500).json({ message: "Failed to get debug users" });
    }
  });
  
  // Reset database (dev only)
  app.post('/api/reset-db', async (req, res) => {
    try {
      console.log("RESET DB: Börjar återställa databasen...");
      
      // Ta bort alla befintliga användare och batches
      await db.delete(users);
      await db.delete(batches);
      
      console.log("RESET DB: Tabeller rensade, återskapar användare...");
      
      // Importera hashPassword direkt
      const { hashPassword } = await import('./password-utils');
      
      // Hasha lösenord för standardanvändare
      const hashedPassword = await hashPassword("password");
      console.log("RESET DB: Lösenord hashat: ", hashedPassword.substring(0, 20) + "...");
      
      // Skapa användare manuellt
      await db.insert(users).values([
        {
          username: "john",
          password: hashedPassword,
          name: "John Doe",
          role: "Lageransvarig"
        },
        {
          username: "anna",
          password: hashedPassword,
          name: "Anna Svensson",
          role: "Inventerare"
        }
      ]);
      
      console.log("RESET DB: Användare skapade, skapar exempeldata...");
      
      // Skapa exempeldata
      await storage.initializeSampleBatches();
      
      console.log("RESET DB: Reset av databas slutförd");
      res.json({ message: "Database has been reset", success: true });
    } catch (error) {
      console.error("Error resetting database:", error);
      res.status(500).json({ message: "Failed to reset database", success: false, error: String(error) });
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
      const importedBatches = await storage.importBatches(validBatches, overwrite);
      
      // Explicitly trigger a WebSocket update after import completes
      notifyBatchUpdate();
      
      res.json({ 
        message: "Import successful", 
        count: validBatches.length,
        success: true 
      });
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
  
  // WebSocket server setup på en separat sökväg för att undvika 
  // konflikter med Vite HMR som också använder WebSockets
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });
  
  // Function to broadcast to all connected WebSocket clients
  const broadcastUpdate = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };
  
  // Setup WebSocket connections
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send a welcome message
    ws.send(JSON.stringify({ 
      type: 'welcome', 
      message: 'WebSocket connection established' 
    }));
    
    // Send initial data immediately after connection
    storage.getAllBatches().then(batches => {
      ws.send(JSON.stringify({
        type: 'batch_update',
        data: batches,
        timestamp: new Date().toISOString()
      }));
    }).catch(error => {
      console.error('Error sending initial data via WebSocket:', error);
    });
    
    // Listen for client messages
    ws.on('message', (message) => {
      console.log('Received message from client:', message.toString());
    });
    
    // Handle disconnections
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Notify WebSocket clients of batch changes
  // Throttle-funktion för att förhindra för många uppdateringar på kort tid
  let updateTimeout: NodeJS.Timeout | null = null;
  const throttleTime = 2000; // 2000ms (2 sekunder) för bättre prestanda på mobila enheter
  
  const notifyBatchUpdate = () => {
    // Om en uppdatering redan är planerad, gör ingenting
    if (updateTimeout) {
      return;
    }
    
    // Planera en uppdatering
    updateTimeout = setTimeout(() => {
      // First fetch latest batches
      storage.getAllBatches().then(batches => {
        // Then broadcast update to all clients
        broadcastUpdate({ 
          type: 'batch_update', 
          data: batches,
          timestamp: new Date().toISOString()
        });
        
        // Återställ timeout
        updateTimeout = null;
      }).catch(error => {
        console.error('Error sending batch update through WebSocket:', error);
        // Återställ timeout även vid fel
        updateTimeout = null;
      });
    }, throttleTime);
  };
  
  // Modify the routes that change batch data to trigger WebSocket updates
  const originalMarkBatchAsInventored = storage.markBatchAsInventored;
  storage.markBatchAsInventored = async function(...args) {
    const result = await originalMarkBatchAsInventored.apply(this, args);
    notifyBatchUpdate();
    return result;
  };
  
  const originalMarkBatchAsPartiallyInventored = storage.markBatchAsPartiallyInventored;
  storage.markBatchAsPartiallyInventored = async function(...args) {
    const result = await originalMarkBatchAsPartiallyInventored.apply(this, args);
    notifyBatchUpdate();
    return result;
  };
  
  const originalUpdateBatch = storage.updateBatch;
  storage.updateBatch = async function(...args) {
    const result = await originalUpdateBatch.apply(this, args);
    notifyBatchUpdate();
    return result;
  };
  
  const originalCreateBatch = storage.createBatch;
  storage.createBatch = async function(...args) {
    const result = await originalCreateBatch.apply(this, args);
    notifyBatchUpdate();
    return result;
  };
  
  const originalImportBatches = storage.importBatches;
  storage.importBatches = async function(...args) {
    const result = await originalImportBatches.apply(this, args);
    notifyBatchUpdate();
    return result;
  };
  
  const originalClearAllBatches = storage.clearAllBatches;
  storage.clearAllBatches = async function(...args) {
    const result = await originalClearAllBatches.apply(this, args);
    notifyBatchUpdate();
    return result;
  };
  
  return httpServer;
}
