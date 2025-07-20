import { 
  UserModel,
  ContentModel,
  SideEffectModel,
  MedicationModel,
  type User, 
  type Content,
  type SideEffect,
  type Medication,
  type InsertUser, 
  type InsertContent,
  type InsertSideEffect,
  type InsertMedication 
} from "@shared/schema";
import "./db"; // Initialize MongoDB connection

// Helper function to convert MongoDB document to our expected format
function convertUser(doc: any): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    password: doc.password,
    firstName: doc.firstName,
    lastName: doc.lastName,
    condition: doc.condition || null,
    preferences: doc.preferences || null,
    createdAt: doc.createdAt || null
  };
}

function convertContent(doc: any): Content {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    type: doc.type,
    tags: doc.tags,
    url: doc.url || null,
    duration: doc.duration || null,
    createdAt: doc.createdAt || null
  };
}

function convertSideEffect(doc: any): SideEffect {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    symptom: doc.symptom,
    severity: doc.severity,
    notes: doc.notes || null,
    timestamp: doc.timestamp || null
  };
}

function convertMedication(doc: any): Medication {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    dosage: doc.dosage,
    frequency: doc.frequency,
    timeOfDay: doc.timeOfDay || null,
    isActive: doc.isActive,
    createdAt: doc.createdAt || null
  };
}

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  // Content management
  getContent(tags?: string[]): Promise<Content[]>;
  createContent(insertContent: InsertContent): Promise<Content>;

  // Side effects tracking
  createSideEffect(insertSideEffect: InsertSideEffect): Promise<SideEffect>;
  getSideEffectsByUser(userId: string, limit?: number): Promise<SideEffect[]>;

  // Medication management
  createMedication(insertMedication: InsertMedication): Promise<Medication>;
  getMedicationsByUser(userId: string): Promise<Medication[]>;
  updateMedication(id: string, updates: Partial<Medication>): Promise<Medication | undefined>;
}

// MongoDB Storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      return user ? convertUser(user) : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email });
      return user ? convertUser(user) : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const user = new UserModel(insertUser);
      const savedUser = await user.save();
      return convertUser(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getContent(tags?: string[]): Promise<Content[]> {
    try {
      let query = {};
      if (tags && tags.length > 0) {
        query = { tags: { $in: tags } };
      }
      
      const content = await ContentModel.find(query);
      return content.map(convertContent);
    } catch (error) {
      console.error('Error getting content:', error);
      return [];
    }
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    try {
      const content = new ContentModel(insertContent);
      const savedContent = await content.save();
      return convertContent(savedContent);
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  async createSideEffect(insertSideEffect: InsertSideEffect): Promise<SideEffect> {
    try {
      const sideEffect = new SideEffectModel(insertSideEffect);
      const savedSideEffect = await sideEffect.save();
      return convertSideEffect(savedSideEffect);
    } catch (error) {
      console.error('Error creating side effect:', error);
      throw error;
    }
  }

  async getSideEffectsByUser(userId: string, limit?: number): Promise<SideEffect[]> {
    try {
      let query = SideEffectModel.find({ userId }).sort({ timestamp: -1 });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const sideEffects = await query;
      return sideEffects.map(convertSideEffect);
    } catch (error) {
      console.error('Error getting side effects:', error);
      return [];
    }
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    try {
      const medication = new MedicationModel(insertMedication);
      const savedMedication = await medication.save();
      return convertMedication(savedMedication);
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  }

  async getMedicationsByUser(userId: string): Promise<Medication[]> {
    try {
      const medications = await MedicationModel.find({ userId, isActive: true });
      return medications.map(convertMedication);
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication | undefined> {
    try {
      const medication = await MedicationModel.findByIdAndUpdate(id, updates, { new: true });
      return medication ? convertMedication(medication) : undefined;
    } catch (error) {
      console.error('Error updating medication:', error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();