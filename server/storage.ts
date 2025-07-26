import {
  users,
  villages,
  emergencyPins,
  alerts,
  alertDeliveries,
  type User,
  type UpsertUser,
  type Village,
  type InsertVillage,
  type EmergencyPin,
  type InsertEmergencyPin,
  type Alert,
  type InsertAlert,
  type AlertDelivery,
  type InsertAlertDelivery,
} from "@shared/schema";
import { db } from "./db";
import { eq, inArray, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Village operations
  getAllVillages(): Promise<Village[]>;
  getVillage(id: string): Promise<Village | undefined>;
  createVillage(village: InsertVillage): Promise<Village>;

  // Emergency pin operations
  getEmergencyPins(): Promise<EmergencyPin[]>;
  getEmergencyPinsByVillage(villageId: string): Promise<EmergencyPin[]>;
  createEmergencyPin(pin: InsertEmergencyPin): Promise<EmergencyPin>;
  updateEmergencyPinStatus(id: string, status: string): Promise<EmergencyPin | undefined>;

  // Alert operations
  getActiveAlerts(): Promise<Alert[]>;
  getAlertsByVillages(villageIds: string[]): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlertStatus(id: string, status: string): Promise<Alert | undefined>;

  // Alert delivery operations
  createAlertDelivery(delivery: InsertAlertDelivery): Promise<AlertDelivery>;
  getUserAlertDeliveries(userId: string): Promise<AlertDelivery[]>;
  markAlertAsRead(alertId: string, userId: string): Promise<void>;

  // Admin operations
  getUsersByVillages(villageIds: string[]): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Village operations
  async getAllVillages(): Promise<Village[]> {
    return await db.select().from(villages);
  }

  async getVillage(id: string): Promise<Village | undefined> {
    const [village] = await db.select().from(villages).where(eq(villages.id, id));
    return village;
  }

  async createVillage(village: InsertVillage): Promise<Village> {
    const [newVillage] = await db
      .insert(villages)
      .values(village)
      .returning();
    return newVillage;
  }

  // Emergency pin operations
  async getEmergencyPins(): Promise<EmergencyPin[]> {
    return await db
      .select()
      .from(emergencyPins)
      .orderBy(desc(emergencyPins.createdAt));
  }

  async getEmergencyPinsByVillage(villageId: string): Promise<EmergencyPin[]> {
    // This would require joining with users table to filter by village
    return await db
      .select({
        id: emergencyPins.id,
        userId: emergencyPins.userId,
        type: emergencyPins.type,
        latitude: emergencyPins.latitude,
        longitude: emergencyPins.longitude,
        description: emergencyPins.description,
        location: emergencyPins.location,
        status: emergencyPins.status,
        createdAt: emergencyPins.createdAt,
        updatedAt: emergencyPins.updatedAt,
      })
      .from(emergencyPins)
      .innerJoin(users, eq(emergencyPins.userId, users.id))
      .where(eq(users.villageId, villageId))
      .orderBy(desc(emergencyPins.createdAt));
  }

  async createEmergencyPin(pin: InsertEmergencyPin): Promise<EmergencyPin> {
    const [newPin] = await db
      .insert(emergencyPins)
      .values(pin)
      .returning();
    return newPin;
  }

  async updateEmergencyPinStatus(id: string, status: string): Promise<EmergencyPin | undefined> {
    const [updatedPin] = await db
      .update(emergencyPins)
      .set({ status, updatedAt: new Date() })
      .where(eq(emergencyPins.id, id))
      .returning();
    return updatedPin;
  }

  // Alert operations
  async getActiveAlerts(): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.status, "active"))
      .orderBy(desc(alerts.createdAt));
  }

  async getAlertsByVillages(villageIds: string[]): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.status, "active"),
          // Check if any of the target villages match the user's villages
        )
      )
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db
      .insert(alerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async updateAlertStatus(id: string, status: string): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ status, updatedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  // Alert delivery operations
  async createAlertDelivery(delivery: InsertAlertDelivery): Promise<AlertDelivery> {
    const [newDelivery] = await db
      .insert(alertDeliveries)
      .values(delivery)
      .returning();
    return newDelivery;
  }

  async getUserAlertDeliveries(userId: string): Promise<AlertDelivery[]> {
    return await db
      .select()
      .from(alertDeliveries)
      .where(eq(alertDeliveries.userId, userId))
      .orderBy(desc(alertDeliveries.deliveredAt));
  }

  async markAlertAsRead(alertId: string, userId: string): Promise<void> {
    await db
      .update(alertDeliveries)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(alertDeliveries.alertId, alertId),
          eq(alertDeliveries.userId, userId)
        )
      );
  }

  // Admin operations
  async getUsersByVillages(villageIds: string[]): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(inArray(users.villageId, villageIds));
  }
}

export const storage = new DatabaseStorage();
