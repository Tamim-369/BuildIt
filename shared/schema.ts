import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// User Interface and Schema
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  condition?: string;
  preferences?: {
    foodAllergies?: string[];
    exerciseLevel?: string;
    energyLevels?: string;
  };
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  condition: { type: String },
  preferences: {
    foodAllergies: [String],
    exerciseLevel: String,
    energyLevels: String
  },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model<IUser>('User', userSchema);

// Content Interface and Schema
export interface IContent extends Document {
  _id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  url?: string;
  duration?: string;
  createdAt: Date;
}

const contentSchema = new Schema<IContent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  tags: [{ type: String, required: true }],
  url: String,
  duration: String,
  createdAt: { type: Date, default: Date.now }
});

export const ContentModel = mongoose.model<IContent>('Content', contentSchema);

// Side Effect Interface and Schema
export interface ISideEffect extends Document {
  _id: string;
  userId: string;
  symptom: string;
  severity: number;
  notes?: string;
  timestamp: Date;
}

const sideEffectSchema = new Schema<ISideEffect>({
  userId: { type: String, required: true },
  symptom: { type: String, required: true },
  severity: { type: Number, required: true, min: 1, max: 10 },
  notes: String,
  timestamp: { type: Date, default: Date.now }
});

export const SideEffectModel = mongoose.model<ISideEffect>('SideEffect', sideEffectSchema);

// Medication Interface and Schema
export interface IMedication extends Document {
  _id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
  isActive: boolean;
  createdAt: Date;
}

const medicationSchema = new Schema<IMedication>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  timeOfDay: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const MedicationModel = mongoose.model<IMedication>('Medication', medicationSchema);

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  condition: z.string().optional(),
  preferences: z.object({
    foodAllergies: z.array(z.string()).optional(),
    exerciseLevel: z.string().optional(),
    energyLevels: z.string().optional()
  }).optional()
});

export const insertContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.string().min(1),
  tags: z.array(z.string()),
  url: z.string().optional(),
  duration: z.string().optional()
});

export const insertSideEffectSchema = z.object({
  userId: z.string(),
  symptom: z.string().min(1),
  severity: z.number().min(1).max(10),
  notes: z.string().optional()
});

export const insertMedicationSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  timeOfDay: z.string().optional(),
  isActive: z.boolean().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// TypeScript types for consistency with frontend expectations
export type User = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  condition?: string | null;
  preferences?: {
    foodAllergies?: string[];
    exerciseLevel?: string;
    energyLevels?: string;
  } | null;
  createdAt: Date | null;
};

export type Content = {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  url?: string | null;
  duration?: string | null;
  createdAt: Date | null;
};

export type SideEffect = {
  id: string;
  userId: string;
  symptom: string;
  severity: number;
  notes?: string | null;
  timestamp: Date | null;
};

export type Medication = {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string | null;
  isActive: boolean;
  createdAt: Date | null;
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type InsertSideEffect = z.infer<typeof insertSideEffectSchema>;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;