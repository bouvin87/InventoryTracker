import { BatchItem, InsertBatch, UpdateBatchItem, User, InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBatch(id: number): Promise<BatchItem | undefined>;
  getAllBatches(): Promise<BatchItem[]>;
  createBatch(batch: InsertBatch): Promise<BatchItem>;
  updateBatch(id: number, data: UpdateBatchItem): Promise<BatchItem>;
  importBatches(batches: InsertBatch[], overwrite: boolean): Promise<BatchItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private batches: Map<number, BatchItem>;
  private userCurrentId: number;
  private batchCurrentId: number;

  constructor() {
    this.users = new Map();
    this.batches = new Map();
    this.userCurrentId = 1;
    this.batchCurrentId = 1;
    
    // Add a default user
    this.users.set(1, {
      id: 1,
      username: "john",
      password: "password",
      name: "John Doe",
      role: "Lageransvarig"
    });
    
    // Initialize with some sample data
    this.addSampleData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getBatch(id: number): Promise<BatchItem | undefined> {
    return this.batches.get(id);
  }
  
  async getAllBatches(): Promise<BatchItem[]> {
    return Array.from(this.batches.values());
  }
  
  async createBatch(insertBatch: InsertBatch): Promise<BatchItem> {
    const id = this.batchCurrentId++;
    const batch: BatchItem = { 
      ...insertBatch, 
      id,
      status: "not_started",
      actualQuantity: null,
      notes: null,
      updatedAt: null,
      userId: null
    };
    this.batches.set(id, batch);
    return batch;
  }
  
  async updateBatch(id: number, data: UpdateBatchItem): Promise<BatchItem> {
    const batch = this.batches.get(id);
    if (!batch) {
      throw new Error(`Batch with id ${id} not found`);
    }
    
    const updatedBatch = { ...batch, ...data };
    this.batches.set(id, updatedBatch);
    return updatedBatch;
  }
  
  async importBatches(batches: InsertBatch[], overwrite: boolean): Promise<BatchItem[]> {
    const results: BatchItem[] = [];
    
    for (const insertBatch of batches) {
      // Check if batch with the same batchNumber already exists
      const existingBatch = Array.from(this.batches.values()).find(
        b => b.batchNumber === insertBatch.batchNumber
      );
      
      if (existingBatch && overwrite) {
        // Update existing batch
        const updatedBatch = { 
          ...existingBatch,
          product: insertBatch.product,
          location: insertBatch.location,
          expectedQuantity: insertBatch.expectedQuantity,
          unit: insertBatch.unit
        };
        this.batches.set(existingBatch.id, updatedBatch);
        results.push(updatedBatch);
      } else if (!existingBatch) {
        // Create new batch
        const newBatch = await this.createBatch(insertBatch);
        results.push(newBatch);
      }
      // If existing batch found and overwrite is false, skip it
    }
    
    return results;
  }
  
  private addSampleData() {
    const sampleData: InsertBatch[] = [
      {
        batchNumber: "BAT-2023-1001",
        product: "Kopplingsdon KP-45",
        location: "A-12-5",
        expectedQuantity: 250,
        unit: "st"
      },
      {
        batchNumber: "BAT-2023-1002",
        product: "Skruvset SK-100",
        location: "B-04-2",
        expectedQuantity: 500,
        unit: "st"
      },
      {
        batchNumber: "BAT-2023-1003",
        product: "Kabelhållare KH-25",
        location: "A-08-1",
        expectedQuantity: 120,
        unit: "st"
      },
      {
        batchNumber: "BAT-2023-1004",
        product: "Motordelar M-200",
        location: "C-02-4",
        expectedQuantity: 45,
        unit: "st"
      },
      {
        batchNumber: "BAT-2023-1005",
        product: "Packning P-55",
        location: "B-10-3",
        expectedQuantity: 300,
        unit: "st"
      }
    ];
    
    // Create each sample batch
    sampleData.forEach(batch => {
      const id = this.batchCurrentId++;
      this.batches.set(id, {
        ...batch,
        id,
        status: "not_started",
        actualQuantity: null,
        notes: null,
        updatedAt: null,
        userId: null
      });
    });
    
    // Update a few batches with different statuses
    const batch1 = this.batches.get(1);
    if (batch1) {
      this.batches.set(1, {
        ...batch1,
        status: "completed",
        actualQuantity: 253,
        updatedAt: "2023-09-12 14:32",
        userId: 1
      });
    }
    
    const batch2 = this.batches.get(2);
    if (batch2) {
      this.batches.set(2, {
        ...batch2,
        status: "in_progress",
        updatedAt: "2023-09-12 10:15",
        userId: 1
      });
    }
    
    const batch4 = this.batches.get(4);
    if (batch4) {
      this.batches.set(4, {
        ...batch4,
        status: "completed",
        actualQuantity: 42,
        updatedAt: "2023-09-11 16:45",
        userId: 1
      });
    }
    
    const batch5 = this.batches.get(5);
    if (batch5) {
      this.batches.set(5, {
        ...batch5,
        status: "in_progress",
        updatedAt: "2023-09-12 09:22",
        userId: 1
      });
    }
  }
}

export const storage = new MemStorage();
