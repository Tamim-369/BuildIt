import { 
  users, 
  content, 
  sideEffects, 
  medications,
  type User, 
  type Content,
  type SideEffect,
  type Medication,
  type InsertUser, 
  type InsertContent,
  type InsertSideEffect,
  type InsertMedication 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content management
  getContent(tags?: string[]): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  
  // Side effects
  createSideEffect(sideEffect: InsertSideEffect): Promise<SideEffect>;
  getSideEffectsByUser(userId: number, limit?: number): Promise<SideEffect[]>;
  
  // Medications
  createMedication(medication: InsertMedication): Promise<Medication>;
  getMedicationsByUser(userId: number): Promise<Medication[]>;
  updateMedication(id: number, updates: Partial<Medication>): Promise<Medication | undefined>;
}

// DatabaseStorage implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser as any)
      .returning();
    return user;
  }

  async getContent(tags?: string[]): Promise<Content[]> {
    if (!tags || tags.length === 0) {
      return await db.select().from(content);
    }

    // Use raw SQL for jsonb array intersection check
    const result = await db.execute(
      sql`SELECT * FROM ${content} WHERE tags && ${JSON.stringify(tags)}::jsonb`
    );
    
    return result.rows as Content[];
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const [newContent] = await db
      .insert(content)
      .values(insertContent as any)
      .returning();
    return newContent;
  }

  async createSideEffect(insertSideEffect: InsertSideEffect): Promise<SideEffect> {
    const [sideEffect] = await db
      .insert(sideEffects)
      .values(insertSideEffect)
      .returning();
    return sideEffect;
  }

  async getSideEffectsByUser(userId: number, limit?: number): Promise<SideEffect[]> {
    const query = db
      .select()
      .from(sideEffects)
      .where(eq(sideEffects.userId, userId))
      .orderBy(desc(sideEffects.timestamp));

    if (limit) {
      return await query.limit(limit);
    }

    return await query;
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const [medication] = await db
      .insert(medications)
      .values(insertMedication)
      .returning();
    return medication;
  }

  async getMedicationsByUser(userId: number): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId));
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication | undefined> {
    const [medication] = await db
      .update(medications)
      .set(updates)
      .where(eq(medications.id, id))
      .returning();
    return medication || undefined;
  }
}

export const storage = new DatabaseStorage();
