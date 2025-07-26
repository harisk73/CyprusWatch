import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEmergencyServiceCallSchema } from "@shared/schema";
import { insertEmergencyPinSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Village routes
  app.get('/api/villages', async (req, res) => {
    try {
      const villages = await storage.getAllVillages();
      res.json(villages);
    } catch (error) {
      console.error("Error fetching villages:", error);
      res.status(500).json({ message: "Failed to fetch villages" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = { ...req.body, id: userId };
      const user = await storage.upsertUser(updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Emergency pin routes
  app.get('/api/emergency-pins', async (req, res) => {
    try {
      const pins = await storage.getEmergencyPins();
      res.json(pins);
    } catch (error) {
      console.error("Error fetching emergency pins:", error);
      res.status(500).json({ message: "Failed to fetch emergency pins" });
    }
  });

  app.post('/api/emergency-pins', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pinData = insertEmergencyPinSchema.parse({ ...req.body, userId });
      const pin = await storage.createEmergencyPin(pinData);
      
      // Broadcast to all connected clients
      broadcast({
        type: 'emergency_pin_created',
        data: pin
      });
      
      res.json(pin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid pin data", errors: error.errors });
      } else {
        console.error("Error creating emergency pin:", error);
        res.status(500).json({ message: "Failed to create emergency pin" });
      }
    }
  });

  app.patch('/api/emergency-pins/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const pin = await storage.updateEmergencyPinStatus(id, status);
      
      if (pin) {
        broadcast({
          type: 'emergency_pin_updated',
          data: pin
        });
        res.json(pin);
      } else {
        res.status(404).json({ message: "Emergency pin not found" });
      }
    } catch (error) {
      console.error("Error updating emergency pin:", error);
      res.status(500).json({ message: "Failed to update emergency pin" });
    }
  });

  // Emergency Services routes
  app.get('/api/emergency-services', async (req, res) => {
    try {
      const services = await storage.getEmergencyServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching emergency services:", error);
      res.status(500).json({ message: "Failed to fetch emergency services" });
    }
  });

  app.post('/api/emergency-services/call', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEmergencyServiceCallSchema.parse(req.body);
      
      const call = await storage.logEmergencyServiceCall({
        ...validatedData,
        userId,
      });
      
      res.json(call);
    } catch (error) {
      console.error("Error logging emergency service call:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to log emergency service call" });
      }
    }
  });

  app.get('/api/emergency-services/calls', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const calls = await storage.getEmergencyServiceCallsByUser(userId);
      res.json(calls);
    } catch (error) {
      console.error("Error fetching emergency service calls:", error);
      res.status(500).json({ message: "Failed to fetch emergency service calls" });
    }
  });

  // Alert routes
  app.get('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.villageId) {
        return res.json([]);
      }
      
      const alerts = await storage.getAlertsByVillages([user.villageId]);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isVillageAdmin) {
        return res.status(403).json({ message: "Only village admins can send alerts" });
      }
      
      const alertData = insertAlertSchema.parse({ ...req.body, adminId: userId });
      const alert = await storage.createAlert(alertData);
      
      // Get all users in target villages
      const targetUsers = await storage.getUsersByVillages(alert.targetVillages || []);
      
      // Create alert deliveries for each user
      for (const targetUser of targetUsers) {
        await storage.createAlertDelivery({
          alertId: alert.id,
          userId: targetUser.id,
        });
      }
      
      // Broadcast to all connected clients
      broadcast({
        type: 'alert_created',
        data: { alert, targetUsers: targetUsers.map(u => u.id) }
      });
      
      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      } else {
        console.error("Error creating alert:", error);
        res.status(500).json({ message: "Failed to create alert" });
      }
    }
  });

  app.patch('/api/alerts/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.markAlertAsRead(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // User alert deliveries
  app.get('/api/user/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deliveries = await storage.getUserAlertDeliveries(userId);
      res.json(deliveries);
    } catch (error) {
      console.error("Error fetching user alerts:", error);
      res.status(500).json({ message: "Failed to fetch user alerts" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  function broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  return httpServer;
}
