import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  condition: text("condition"), // diabetes, obesity, etc.
  preferences: jsonb("preferences").$type<{
    foodAllergies?: string[];
    exerciseLevel?: string;
    energyLevels?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // nutrition, exercise, behavioral
  tags: jsonb("tags").$type<string[]>().notNull(),
  url: text("url"), // YouTube URL or text content
  duration: text("duration"), // "5 min read" or "8 min watch"
  createdAt: timestamp("created_at").defaultNow(),
});

export const sideEffects = pgTable("side_effects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symptom: text("symptom").notNull(), // nausea, fatigue, muscle-loss, etc.
  severity: integer("severity").notNull(), // 1-10 scale
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dose: text("dose").notNull(),
  frequency: text("frequency").notNull(), // daily, weekly, etc.
  time: text("time").notNull(), // "8:00 PM"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
});

export const insertSideEffectSchema = createInsertSchema(sideEffects).omit({
  id: true,
  timestamp: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type InsertSideEffect = z.infer<typeof insertSideEffectSchema>;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type User = typeof users.$inferSelect;
export type Content = typeof content.$inferSelect;
export type SideEffect = typeof sideEffects.$inferSelect;
export type Medication = typeof medications.$inferSelect;
