import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  batchNumber: text("batch_number").notNull().unique(),
  product: text("product").notNull(),
  location: text("location").notNull(),
  expectedQuantity: integer("expected_quantity").notNull(),
  actualQuantity: integer("actual_quantity"),
  unit: text("unit").notNull(),
  status: text("status").notNull().default("not_started"),
  notes: text("notes"),
  updatedAt: text("updated_at"),
  userId: integer("user_id"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true,
  actualQuantity: true,
  status: true,
  notes: true,
  updatedAt: true,
  userId: true,
});

export const updateBatchSchema = z.object({
  actualQuantity: z.number(),
  notes: z.string().optional(),
  status: z.string(),
  updatedAt: z.string(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type BatchItem = typeof batches.$inferSelect;
export type UpdateBatchItem = z.infer<typeof updateBatchSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
