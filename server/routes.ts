import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  insertSideEffectSchema,
  insertMedicationSchema,
  type User 
} from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "metabolic-health-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          condition: user.condition
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          condition: user.condition
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data", error });
    }
  });

  app.get("/api/auth/verify", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          condition: user.condition
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Content routes
  app.get("/api/content", async (req, res) => {
    try {
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      const content = await storage.getContent(tags);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content", error });
    }
  });

  // Side effects routes
  app.post("/api/side-effects", authenticateToken, async (req: any, res) => {
    try {
      const sideEffectData = insertSideEffectSchema.parse({
        ...req.body,
        userId: req.user.userId
      });
      
      const sideEffect = await storage.createSideEffect(sideEffectData);
      res.status(201).json(sideEffect);
    } catch (error) {
      res.status(400).json({ message: "Invalid side effect data", error });
    }
  });

  app.get("/api/side-effects", authenticateToken, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sideEffects = await storage.getSideEffectsByUser(req.user.userId, limit);
      res.json(sideEffects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch side effects", error });
    }
  });

  // Medication routes
  app.post("/api/medications", authenticateToken, async (req: any, res) => {
    try {
      const medicationData = insertMedicationSchema.parse({
        ...req.body,
        userId: req.user.userId
      });
      
      const medication = await storage.createMedication(medicationData);
      res.status(201).json(medication);
    } catch (error) {
      res.status(400).json({ message: "Invalid medication data", error });
    }
  });

  app.get("/api/medications", authenticateToken, async (req: any, res) => {
    try {
      const medications = await storage.getMedicationsByUser(req.user.userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications", error });
    }
  });

  app.patch("/api/medications/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      
      const medication = await storage.updateMedication(id, updates);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(400).json({ message: "Failed to update medication", error });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      
      // Get today's side effects
      const allSideEffects = await storage.getSideEffectsByUser(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const symptomsToday = allSideEffects.filter(effect => 
        effect.timestamp! >= today
      ).length;

      // Get week's side effects for adherence calculation
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekSideEffects = allSideEffects.filter(effect =>
        effect.timestamp! >= weekAgo
      );

      // Simple adherence calculation (inverse of side effect frequency)
      const adherenceRate = Math.max(0, 100 - (weekSideEffects.length * 5));

      // Get content viewed (simplified - just return content count)
      const allContent = await storage.getContent();
      const contentViewed = Math.min(allContent.length, 7);

      res.json({
        symptomsToday,
        adherenceRate: `${Math.round(adherenceRate)}%`,
        contentViewed
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
