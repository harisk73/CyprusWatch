import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  villageId: varchar("village_id"),
  address: text("address"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  emergencyContactRelationship: varchar("emergency_contact_relationship"),
  emergencyContactSecondary: varchar("emergency_contact_secondary"),
  isVillageAdmin: boolean("is_village_admin").default(false),
  notificationPreferences: jsonb("notification_preferences").default({
    emergency: true,
    weather: true,
    roadClosures: true,
    community: false,
    browserNotifications: true,
    smsNotifications: true,
    emailNotifications: false,
    quietHoursFrom: "22:00",
    quietHoursTo: "07:00"
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Villages table
export const villages = pgTable("villages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  district: varchar("district").notNull(),
  boundaries: jsonb("boundaries"), // GeoJSON for village boundaries
  createdAt: timestamp("created_at").defaultNow(),
});

// Emergency pin types enum
export const emergencyTypeEnum = pgEnum("emergency_type", [
  "fire",
  "smoke", 
  "flood",
  "accident",
  "medical",
  "weather",
  "security",
  "other"
]);

// Emergency pins table
export const emergencyPins = pgTable("emergency_pins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: emergencyTypeEnum("type").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  description: text("description"),
  location: varchar("location"),
  status: varchar("status").default("active"), // active, resolved, false_alarm
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alert types enum
export const alertTypeEnum = pgEnum("alert_type", [
  "emergency",
  "warning", 
  "info",
  "weather"
]);

// Alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull(),
  type: alertTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  targetVillages: text("target_villages").array(), // Array of village IDs
  sendSms: boolean("send_sms").default(false),
  status: varchar("status").default("active"), // active, resolved
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alert deliveries table (to track who received what)
export const alertDeliveries = pgTable("alert_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertId: varchar("alert_id").notNull(),
  userId: varchar("user_id").notNull(),
  deliveredAt: timestamp("delivered_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Emergency services table
export const emergencyServices = pgTable("emergency_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // police, fire, ambulance, general
  phone: varchar("phone").notNull(),
  shortCode: varchar("short_code"), // e.g., "112", "199"
  description: text("description"),
  district: varchar("district"), // for district-specific services
  isEmergency: boolean("is_emergency").default(true),
  isPrimary: boolean("is_primary").default(false), // main emergency numbers
  createdAt: timestamp("created_at").defaultNow(),
});

// Emergency service calls log (for tracking emergency calls made through the app)
export const emergencyServiceCalls = pgTable("emergency_service_calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  serviceId: varchar("service_id").notNull(),
  emergencyPinId: varchar("emergency_pin_id"), // if call relates to a reported incident
  callInitiated: timestamp("call_initiated").defaultNow(),
  userLocation: jsonb("user_location"), // lat/lng when call was made
  notes: text("notes"),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  village: one(villages, {
    fields: [users.villageId],
    references: [villages.id],
  }),
  emergencyPins: many(emergencyPins),
  alerts: many(alerts),
  alertDeliveries: many(alertDeliveries),
}));

export const villagesRelations = relations(villages, ({ many }) => ({
  users: many(users),
}));

export const emergencyPinsRelations = relations(emergencyPins, ({ one }) => ({
  user: one(users, {
    fields: [emergencyPins.userId],
    references: [users.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one, many }) => ({
  admin: one(users, {
    fields: [alerts.adminId],
    references: [users.id],
  }),
  deliveries: many(alertDeliveries),
}));

export const alertDeliveriesRelations = relations(alertDeliveries, ({ one }) => ({
  alert: one(alerts, {
    fields: [alertDeliveries.alertId],
    references: [alerts.id],
  }),
  user: one(users, {
    fields: [alertDeliveries.userId],
    references: [users.id],
  }),
}));

export const emergencyServiceCallsRelations = relations(emergencyServiceCalls, ({ one }) => ({
  user: one(users, {
    fields: [emergencyServiceCalls.userId],
    references: [users.id],
  }),
  service: one(emergencyServices, {
    fields: [emergencyServiceCalls.serviceId],
    references: [emergencyServices.id],
  }),
  emergencyPin: one(emergencyPins, {
    fields: [emergencyServiceCalls.emergencyPinId],
    references: [emergencyPins.id],
  }),
}));

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertVillageSchema = createInsertSchema(villages).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyPinSchema = createInsertSchema(emergencyPins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertDeliverySchema = createInsertSchema(alertDeliveries).omit({
  id: true,
  deliveredAt: true,
});

export const insertEmergencyServiceSchema = createInsertSchema(emergencyServices).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyServiceCallSchema = createInsertSchema(emergencyServiceCalls).omit({
  id: true,
  callInitiated: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Village = typeof villages.$inferSelect;
export type InsertVillage = z.infer<typeof insertVillageSchema>;
export type EmergencyPin = typeof emergencyPins.$inferSelect;
export type InsertEmergencyPin = z.infer<typeof insertEmergencyPinSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type AlertDelivery = typeof alertDeliveries.$inferSelect;
export type InsertAlertDelivery = z.infer<typeof insertAlertDeliverySchema>;
export type EmergencyService = typeof emergencyServices.$inferSelect;
export type InsertEmergencyService = z.infer<typeof insertEmergencyServiceSchema>;
export type EmergencyServiceCall = typeof emergencyServiceCalls.$inferSelect;
export type InsertEmergencyServiceCall = z.infer<typeof insertEmergencyServiceCallSchema>;
