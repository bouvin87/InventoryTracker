import { BatchItem, InsertBatch, UpdateBatchItem, User, InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  getBatch(id: number): Promise<BatchItem | undefined>;
  getAllBatches(): Promise<BatchItem[]>;
  createBatch(batch: InsertBatch): Promise<BatchItem>;
  updateBatch(id: number, data: UpdateBatchItem): Promise<BatchItem>;
  markBatchAsInventored(id: number, userId?: number, userName?: string): Promise<BatchItem>;
  markBatchAsPartiallyInventored(id: number, weight: number, userId?: number, userName?: string): Promise<BatchItem>;
  importBatches(batches: InsertBatch[], overwrite: boolean): Promise<BatchItem[]>;
  clearAllBatches(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private batches: Map<number, BatchItem>;
  private userCurrentId: number;
  private batchCurrentId: number;
  
  async clearAllBatches(): Promise<void> {
    this.batches.clear();
    this.batchCurrentId = 1;
  }

  constructor() {
    this.users = new Map();
    this.batches = new Map();
    this.userCurrentId = 1;
    this.batchCurrentId = 1;
    
    // Add sample users
    this.users.set(1, {
      id: 1,
      username: "john",
      password: "password",
      name: "John Doe",
      role: "Lageransvarig"
    });
    
    this.users.set(2, {
      id: 2,
      username: "anna",
      password: "password",
      name: "Anna Svensson",
      role: "Inventerare"
    });
    
    this.users.set(3, {
      id: 3,
      username: "erik",
      password: "password",
      name: "Erik Johansson",
      role: "Inventerare"
    });
    
    this.users.set(4, {
      id: 4,
      username: "maria",
      password: "password",
      name: "Maria Larsson",
      role: "Lageransvarig"
    });
    
    this.userCurrentId = 5; // Uppdatera current ID
    
    // Initialize with some sample data
    this.addSampleData();
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
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
      location: insertBatch.location || null,
      status: "not_started",
      inventoredWeight: null,
      updatedAt: null,
      userId: null,
      userName: null
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
  
  async markBatchAsInventored(id: number, userId?: number, userName?: string): Promise<BatchItem> {
    const batch = this.batches.get(id);
    if (!batch) {
      throw new Error(`Batch with id ${id} not found`);
    }
    
    const updatedBatch = { 
      ...batch, 
      status: "completed", 
      inventoredWeight: batch.totalWeight, 
      updatedAt: new Date().toISOString(),
      userId: userId || null,
      userName: userName || null
    };
    this.batches.set(id, updatedBatch);
    return updatedBatch;
  }
  
  async markBatchAsPartiallyInventored(id: number, weight: number, userId?: number, userName?: string): Promise<BatchItem> {
    const batch = this.batches.get(id);
    if (!batch) {
      throw new Error(`Batch with id ${id} not found`);
    }
    
    const updatedBatch = { 
      ...batch, 
      status: "partially_completed", 
      inventoredWeight: weight, 
      updatedAt: new Date().toISOString(),
      userId: userId || null,
      userName: userName || null
    };
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
          articleNumber: insertBatch.articleNumber,
          description: insertBatch.description,
          totalWeight: insertBatch.totalWeight
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
        batchNumber: "A12345",
        articleNumber: "45678",
        description: "Stålbalk 40mm",
        totalWeight: 2500
      },
      {
        batchNumber: "B67890",
        articleNumber: "23456",
        description: "Aluminiumplåt 2mm",
        totalWeight: 1200
      },
      {
        batchNumber: "C13579",
        articleNumber: "89012",
        description: "Kopparrör 15mm",
        totalWeight: 800
      },
      {
        batchNumber: "D24680",
        articleNumber: "34567",
        description: "Järnplåt 5mm",
        totalWeight: 3200
      },
      {
        batchNumber: "E35791",
        articleNumber: "10111",
        description: "Mässingsstång 10mm",
        totalWeight: 950
      }
    ];
    
    // Create each sample batch
    sampleData.forEach(batch => {
      const id = this.batchCurrentId++;
      this.batches.set(id, {
        ...batch,
        id,
        location: null,
        status: "not_started",
        inventoredWeight: null,
        updatedAt: null,
        userId: null,
        userName: null
      });
    });
    
    // Update a few batches with different statuses
    const batch1 = this.batches.get(1);
    if (batch1) {
      this.batches.set(1, {
        ...batch1,
        status: "completed",
        inventoredWeight: batch1.totalWeight,
        updatedAt: "2023-09-12 14:32",
        userId: 1,
        userName: "John Doe"
      });
    }
    
    const batch2 = this.batches.get(2);
    if (batch2) {
      this.batches.set(2, {
        ...batch2,
        status: "partially_completed",
        inventoredWeight: Math.round(batch2.totalWeight * 0.7),
        updatedAt: "2023-09-12 10:15",
        userId: 1,
        userName: "John Doe"
      });
    }
    
    const batch4 = this.batches.get(4);
    if (batch4) {
      this.batches.set(4, {
        ...batch4,
        status: "completed",
        inventoredWeight: batch4.totalWeight,
        updatedAt: "2023-09-11 16:45",
        userId: 1,
        userName: "John Doe"
      });
    }
  }
}

export const storage = new MemStorage();
