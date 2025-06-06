import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const batches = sqliteTable("batches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  batchNumber: text("batch_number").notNull().unique(),
  articleNumber: text("article_number").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  totalWeight: integer("total_weight").notNull(),
  inventoredWeight: integer("inventored_weight"),
  status: text("status").notNull().default("not_started"),
  updatedAt: text("updated_at"),
  userId: integer("user_id"),
  userName: text("user_name"),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true,
  inventoredWeight: true,
  status: true,
  updatedAt: true,
  userId: true,
  userName: true,
});

export const updateBatchSchema = z.object({
  location: z.string().optional(),
  inventoredWeight: z.number().nullable().optional(),
  status: z.string(),
  updatedAt: z.string(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type BatchItem = typeof batches.$inferSelect;
export type UpdateBatchItem = z.infer<typeof updateBatchSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
