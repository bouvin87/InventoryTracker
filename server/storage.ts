import { BatchItem, InsertBatch, UpdateBatchItem, User, InsertUser, batches, users } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: any; // Sessionslagring för Express
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

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Skapa standard användare om det inte finns några
    this.initializeUsers();
  }
  
  private async initializeUsers() {
    const usersResult = await db.select().from(users);
    
    if (usersResult.length === 0) {
      // Importera hashPassword-funktion
      const { hashPassword } = await import('./password-utils');
      
      // Hasha lösenord för standardanvändare
      const hashedPassword = await hashPassword("password");
      
      // Lägg till standardanvändare
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
        },
        {
          username: "erik",
          password: hashedPassword,
          name: "Erik Johansson",
          role: "Inventerare"
        },
        {
          username: "maria",
          password: hashedPassword,
          name: "Maria Larsson",
          role: "Lageransvarig"
        }
      ]);
      
      // Lägg till exempeldata för batches
      this.initializeSampleBatches();
    }
  }
  
  private async initializeSampleBatches() {
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
    
    // Lägga till alla batches
    const batchesResult = await db.insert(batches).values(
      sampleData.map(batch => ({
        ...batch,
        location: null,
        status: "not_started",
        inventoredWeight: null,
        updatedAt: null,
        userId: null,
        userName: null
      }))
    ).returning();
    
    // Uppdatera status för några batches
    if (batchesResult && batchesResult.length >= 4) {
      const batch1 = batchesResult[0];
      const batch2 = batchesResult[1];
      const batch4 = batchesResult[3];
      
      // Uppdatera batch 1 (komplett inventerad)
      await db.update(batches)
        .set({
          status: "completed",
          inventoredWeight: batch1.totalWeight,
          updatedAt: new Date().toISOString(),
          userId: 1,
          userName: "John Doe"
        })
        .where(eq(batches.id, batch1.id));
      
      // Uppdatera batch 2 (delvis inventerad)
      await db.update(batches)
        .set({
          status: "partially_completed",
          inventoredWeight: Math.round(batch2.totalWeight * 0.7),
          updatedAt: new Date().toISOString(),
          userId: 1,
          userName: "John Doe"
        })
        .where(eq(batches.id, batch2.id));
      
      // Uppdatera batch 4 (komplett inventerad)
      await db.update(batches)
        .set({
          status: "completed",
          inventoredWeight: batch4.totalWeight,
          updatedAt: new Date().toISOString(),
          userId: 1,
          userName: "John Doe"
        })
        .where(eq(batches.id, batch4.id));
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getBatch(id: number): Promise<BatchItem | undefined> {
    const result = await db.select().from(batches).where(eq(batches.id, id));
    return result[0];
  }

  async getAllBatches(): Promise<BatchItem[]> {
    return await db.select().from(batches);
  }

  async createBatch(batchData: InsertBatch): Promise<BatchItem> {
    const [batch] = await db.insert(batches).values({
      ...batchData,
      location: batchData.location || null,
      status: "not_started",
      inventoredWeight: null,
      updatedAt: null,
      userId: null,
      userName: null
    }).returning();
    
    return batch;
  }

  async updateBatch(id: number, data: UpdateBatchItem): Promise<BatchItem> {
    const [updatedBatch] = await db.update(batches)
      .set(data)
      .where(eq(batches.id, id))
      .returning();
    
    if (!updatedBatch) {
      throw new Error(`Batch with id ${id} not found`);
    }
    
    return updatedBatch;
  }

  async markBatchAsInventored(id: number, userId?: number, userName?: string): Promise<BatchItem> {
    // Hämta först batchen för att få totalWeight
    const batch = await this.getBatch(id);
    if (!batch) {
      throw new Error(`Batch with id ${id} not found`);
    }
    
    const [updatedBatch] = await db.update(batches)
      .set({
        status: "completed",
        inventoredWeight: batch.totalWeight,
        updatedAt: new Date().toISOString(),
        userId: userId || null,
        userName: userName || null
      })
      .where(eq(batches.id, id))
      .returning();
    
    return updatedBatch;
  }

  async markBatchAsPartiallyInventored(id: number, weight: number, userId?: number, userName?: string): Promise<BatchItem> {
    const [updatedBatch] = await db.update(batches)
      .set({
        status: "partially_completed",
        inventoredWeight: weight,
        updatedAt: new Date().toISOString(),
        userId: userId || null,
        userName: userName || null
      })
      .where(eq(batches.id, id))
      .returning();
    
    if (!updatedBatch) {
      throw new Error(`Batch with id ${id} not found`);
    }
    
    return updatedBatch;
  }

  async importBatches(batchesData: InsertBatch[], overwrite: boolean): Promise<BatchItem[]> {
    const results: BatchItem[] = [];
    
    for (const insertBatch of batchesData) {
      // Leta efter en befintlig batch med samma batchNumber
      const existingBatchResult = await db.select()
        .from(batches)
        .where(eq(batches.batchNumber, insertBatch.batchNumber));
      
      const existingBatch = existingBatchResult[0];
      
      if (existingBatch && overwrite) {
        // Uppdatera befintlig batch
        const [updatedBatch] = await db.update(batches)
          .set({
            articleNumber: insertBatch.articleNumber,
            description: insertBatch.description,
            totalWeight: insertBatch.totalWeight,
            location: insertBatch.location || existingBatch.location
          })
          .where(eq(batches.id, existingBatch.id))
          .returning();
        
        results.push(updatedBatch);
      } else if (!existingBatch) {
        // Skapa ny batch
        const newBatch = await this.createBatch(insertBatch);
        results.push(newBatch);
      }
      // Om en befintlig batch hittas och overwrite är false, hoppa över den
    }
    
    return results;
  }

  async clearAllBatches(): Promise<void> {
    await db.delete(batches);
  }
}

export const storage = new DatabaseStorage();
