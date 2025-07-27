import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEmergencyServiceCallSchema, insertEvacuationRouteSchema, insertEvacuationZoneSchema, insertSmsAlertSchema } from "@shared/schema";
import { insertEmergencyPinSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";

// Admin authorization middleware
const isAdmin: typeof isAuthenticated = async (req: any, res, next) => {
  // First check if user is authenticated
  return isAuthenticated(req, res, async () => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isVillageAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Failed to verify admin status" });
    }
  });
};

// System admin authorization middleware
const isSystemAdmin: typeof isAuthenticated = async (req: any, res, next) => {
  return isAuthenticated(req, res, async () => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isSystemAdmin) {
        return res.status(403).json({ message: "System admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Error checking system admin status:", error);
      res.status(500).json({ message: "Failed to verify system admin status" });
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoints for deployment platforms
  // These endpoints MUST respond quickly with 200 status for deployment to work
  app.get('/health', (req, res) => {
    const response = { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      port: process.env.PORT || '5000'
    };
    
    console.log(`[HEALTH CHECK] ${req.method} ${req.path} from ${req.ip || req.get('x-forwarded-for') || 'unknown'}`);
    res.status(200).json(response);
  });

  // Additional health check endpoints commonly used by deployment platforms
  app.get('/api/health', (req, res) => {
    const response = { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      api: true
    };
    
    console.log(`[API HEALTH] ${req.method} ${req.path} from ${req.ip || req.get('x-forwarded-for') || 'unknown'}`);
    res.status(200).json(response);
  });

  app.get('/healthz', (req, res) => {
    console.log(`[HEALTHZ] ${req.method} ${req.path} from ${req.ip || req.get('x-forwarded-for') || 'unknown'}`);
    res.status(200).json({ status: 'healthy' });
  });

  app.get('/ready', (req, res) => {
    console.log(`[READY] ${req.method} ${req.path} from ${req.ip || req.get('x-forwarded-for') || 'unknown'}`);
    res.status(200).json({ status: 'ready' });
  });

  // Root health check for deployment health checks
  app.get('/', (req, res, next) => {
    const userAgent = req.get('user-agent') || '';
    const accept = req.get('accept') || '';
    
    // Log all root requests for debugging deployment issues
    console.log(`[ROOT REQUEST] ${req.method} ${req.path} from ${req.ip || req.get('x-forwarded-for') || 'unknown'}`);
    console.log(`[ROOT REQUEST] User-Agent: ${userAgent}`);
    console.log(`[ROOT REQUEST] Accept: ${accept}`);
    
    // For deployment health checks, respond with 200 for non-browser requests
    // This includes curl, wget, deployment platform health checkers, etc.
    if (!accept.includes('text/html')) {
      const response = { 
        status: 'healthy',
        message: 'Cyprus Emergency Alert System API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      };
      
      console.log(`[ROOT HEALTH] Responding with health check for non-browser request`);
      return res.status(200).json(response);
    }
    
    // For browser requests, continue to serve the app
    console.log(`[ROOT BROWSER] Passing to next middleware for browser request`);
    next();
  });

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

  // Phone verification routes
  app.post('/api/auth/send-verification', isAuthenticated, async (req: any, res) => {
    try {
      const { phone } = req.body;
      const userId = req.user.claims.sub;

      if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ message: "Valid phone number is required" });
      }

      // Generate a 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with verification code
      await storage.updateUserVerification(userId, {
        phone,
        phoneVerificationCode: verificationCode,
        phoneVerificationExpiry: expiryTime,
      });

      // In production, this would send SMS via Twilio/etc
      console.log(`SMS verification code for ${phone}: ${verificationCode}`);
      
      res.json({ 
        message: "Verification code sent",
        // Include code in development for testing
        ...(process.env.NODE_ENV === 'development' && { verificationCode })
      });
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post('/api/auth/verify-phone', isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.claims.sub;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Verification code is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if code matches and hasn't expired
      if (user.phoneVerificationCode !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      if (!user.phoneVerificationExpiry || new Date() > user.phoneVerificationExpiry) {
        return res.status(400).json({ message: "Verification code has expired" });
      }

      // Mark phone as verified
      await storage.verifyUserPhone(userId);

      res.json({ message: "Phone verified successfully" });
    } catch (error) {
      console.error("Error verifying phone:", error);
      res.status(500).json({ message: "Failed to verify phone" });
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

  // Emergency pin operations
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
      
      // Check if user's phone is verified - anti-fraud measure
      const user = await storage.getUser(userId);
      if (!user?.phoneVerified) {
        return res.status(400).json({ message: "Phone verification required before posting emergency alerts" });
      }

      const validatedData = insertEmergencyPinSchema.parse({
        ...req.body,
        userId,
        status: "active"
      });
      
      const pin = await storage.createEmergencyPin(validatedData);
      
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

  app.patch('/api/emergency-pins/:id/status', isAdmin, async (req, res) => {
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

  app.put('/api/emergency-pins/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertEmergencyPinSchema.partial().parse(req.body);
      const pin = await storage.updateEmergencyPin(id, validatedData);
      
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

  app.delete('/api/emergency-pins/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEmergencyPin(id);
      
      if (deleted) {
        broadcast({
          type: 'emergency_pin_deleted',
          data: { id }
        });
        res.json({ message: "Emergency pin deleted successfully" });
      } else {
        res.status(404).json({ message: "Emergency pin not found" });
      }
    } catch (error) {
      console.error("Error deleting emergency pin:", error);
      res.status(500).json({ message: "Failed to delete emergency pin" });
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

  // Evacuation Routes (Admin only)
  app.get('/api/evacuation-routes', isAdmin, async (req, res) => {
    try {
      const routes = await storage.getEvacuationRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Error fetching evacuation routes:", error);
      res.status(500).json({ message: "Failed to fetch evacuation routes" });
    }
  });

  app.post('/api/evacuation-routes', isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEvacuationRouteSchema.parse(req.body);
      
      const route = await storage.createEvacuationRoute({
        ...validatedData,
        createdBy: userId,
      });
      
      res.json(route);
    } catch (error) {
      console.error("Error creating evacuation route:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid route data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create evacuation route" });
      }
    }
  });

  // SMS Alerts (Admin only)
  app.get('/api/sms-alerts', isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let smsAlerts;
      if (user?.isVillageAdmin && user.villageId) {
        // Village admin can only see their own SMS alerts
        smsAlerts = await storage.getSmsAlertsBySender(userId);
      } else {
        // Super admin can see all SMS alerts
        smsAlerts = await storage.getSmsAlerts();
      }
      
      res.json(smsAlerts);
    } catch (error) {
      console.error("Error fetching SMS alerts:", error);
      res.status(500).json({ message: "Failed to fetch SMS alerts" });
    }
  });

  app.post('/api/sms-alerts', isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const validatedData = insertSmsAlertSchema.parse(req.body);
      
      // Validate target villages based on user permissions
      let targetVillages = validatedData.targetVillages || [];
      
      if (user?.isVillageAdmin && user.villageId) {
        // Village admins can only send to their own village
        targetVillages = [user.villageId];
      }
      
      // Get recipient count
      const targetUsers = await storage.getUsersByVillages(targetVillages);
      const recipientCount = targetUsers.length.toString();
      
      const smsAlert = await storage.createSmsAlert({
        ...validatedData,
        senderId: userId,
        targetVillages,
        recipientCount,
        deliveryStatus: "sent", // In real implementation, this would be handled by SMS service
      });
      
      // Broadcast SMS alert notification
      broadcast({
        type: 'sms_alert_sent',
        data: { smsAlert, targetUsers: targetUsers.map(u => u.id) }
      });
      
      res.json(smsAlert);
    } catch (error) {
      console.error("Error sending SMS alert:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid SMS alert data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send SMS alert" });
      }
    }
  });

  // User Management routes (System Admin only)
  app.get('/api/users', isSystemAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isSystemAdmin, async (req, res) => {
    try {
      const userData = req.body;
      
      // Validate required fields
      if (!userData.email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Create user with a generated ID
      const userToCreate = {
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        villageId: userData.villageId || null,
        phoneVerified: userData.phoneVerified || false,
        alertsEnabled: userData.alertsEnabled || false,
        isVillageAdmin: userData.isVillageAdmin || false,
        isSystemAdmin: userData.isSystemAdmin || false,
      };

      const user = await storage.createUser(userToCreate);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/users/bulk-import', isSystemAdmin, async (req, res) => {
    try {
      const { users } = req.body;
      
      if (!Array.isArray(users)) {
        return res.status(400).json({ message: "Users must be an array" });
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        
        try {
          // Validate required fields
          if (!userData.email) {
            errors.push({ row: i + 1, error: "Email is required" });
            continue;
          }

          // Check if user already exists
          const existingUser = await storage.getUserByEmail(userData.email);
          if (existingUser) {
            errors.push({ row: i + 1, error: `User with email ${userData.email} already exists` });
            continue;
          }

          // Create user with a generated ID
          const userToCreate = {
            ...userData,
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            villageId: userData.villageId || null,
            phoneVerified: userData.phoneVerified || false,
            alertsEnabled: userData.alertsEnabled || false,
            isVillageAdmin: userData.isVillageAdmin || false,
            isSystemAdmin: userData.isSystemAdmin || false,
          };

          const user = await storage.createUser(userToCreate);
          results.push(user);
        } catch (error) {
          errors.push({ row: i + 1, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      res.json({
        success: results.length,
        errors: errors.length,
        results,
        errorDetails: errors,
      });
    } catch (error) {
      console.error("Error bulk importing users:", error);
      res.status(500).json({ message: "Failed to import users" });
    }
  });

  app.put('/api/users/:id', isSystemAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Validate required fields
      if (updates.villageId !== undefined && updates.villageId !== null && updates.villageId.trim() === '') {
        updates.villageId = null;
      }

      const user = await storage.updateUser(id, updates);
      
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', isSystemAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
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
