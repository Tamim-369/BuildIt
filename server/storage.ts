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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private content: Map<number, Content>;
  private sideEffects: Map<number, SideEffect>;
  private medications: Map<number, Medication>;
  private currentUserId: number;
  private currentContentId: number;
  private currentSideEffectId: number;
  private currentMedicationId: number;

  constructor() {
    this.users = new Map();
    this.content = new Map();
    this.sideEffects = new Map();
    this.medications = new Map();
    this.currentUserId = 1;
    this.currentContentId = 1;
    this.currentSideEffectId = 1;
    this.currentMedicationId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed educational content
    const contentItems: InsertContent[] = [
      {
        title: "Low-Fat Smoothie Recipe",
        description: "Easy-to-digest smoothie recipe specifically designed to help manage nausea during GLP-1 treatment.",
        type: "nutrition",
        tags: ["nausea", "high-fiber"],
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "5 min read"
      },
      {
        title: "5-Minute Energy Boost Walk",
        description: "Gentle walking routine designed to combat fatigue while maintaining your treatment schedule.",
        type: "exercise", 
        tags: ["fatigue"],
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "8 min watch"
      },
      {
        title: "Managing Treatment Plateaus",
        description: "Proven strategies to overcome weight loss plateaus during GLP-1 treatment.",
        type: "behavioral",
        tags: ["plateau", "motivation"],
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "12 min watch"
      },
      {
        title: "Anti-Nausea Meal Planning",
        description: "Weekly meal plans designed to minimize digestive side effects.",
        type: "nutrition",
        tags: ["nausea", "meal-planning"],
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "7 min read"
      }
    ];

    contentItems.forEach(item => this.createContent(item));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      condition: insertUser.condition || null,
      preferences: insertUser.preferences || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getContent(tags?: string[]): Promise<Content[]> {
    const allContent = Array.from(this.content.values());
    
    if (!tags || tags.length === 0) {
      return allContent;
    }

    return allContent.filter(content => 
      tags.some(tag => content.tags.includes(tag))
    );
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.currentContentId++;
    const content: Content = {
      ...insertContent,
      id,
      url: insertContent.url || null,
      duration: insertContent.duration || null,
      createdAt: new Date()
    };
    this.content.set(id, content);
    return content;
  }

  async createSideEffect(insertSideEffect: InsertSideEffect): Promise<SideEffect> {
    const id = this.currentSideEffectId++;
    const sideEffect: SideEffect = {
      ...insertSideEffect,
      id,
      notes: insertSideEffect.notes || null,
      timestamp: new Date()
    };
    this.sideEffects.set(id, sideEffect);
    return sideEffect;
  }

  async getSideEffectsByUser(userId: number, limit?: number): Promise<SideEffect[]> {
    const userSideEffects = Array.from(this.sideEffects.values())
      .filter(effect => effect.userId === userId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
    
    return limit ? userSideEffects.slice(0, limit) : userSideEffects;
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = this.currentMedicationId++;
    const medication: Medication = {
      ...insertMedication,
      id,
      isActive: insertMedication.isActive !== undefined ? insertMedication.isActive : true,
      createdAt: new Date()
    };
    this.medications.set(id, medication);
    return medication;
  }

  async getMedicationsByUser(userId: number): Promise<Medication[]> {
    return Array.from(this.medications.values())
      .filter(medication => medication.userId === userId && medication.isActive);
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updated = { ...medication, ...updates };
    this.medications.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
