import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { isAuthenticated } from "./auth";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register new user (email/password)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        error: "User already exists",
        message: "A user with this email already exists" 
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      });

    res.status(201).json({
      message: "User created successfully",
      user: newUser[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create user",
    });
  }
});

// Get current user
router.get('/user', isAuthenticated, async (req: any, res) => {
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        firstName: users.firstName,
        lastName: users.lastName,
        image: users.image,
        profileImageUrl: users.profileImageUrl,
        phone: users.phone,
        phoneVerified: users.phoneVerified,
        alertsEnabled: users.alertsEnabled,
        villageId: users.villageId,
        address: users.address,
        emergencyContactName: users.emergencyContactName,
        emergencyContactPhone: users.emergencyContactPhone,
        emergencyContactRelationship: users.emergencyContactRelationship,
        emergencyContactSecondary: users.emergencyContactSecondary,
        isVillageAdmin: users.isVillageAdmin,
        isSystemAdmin: users.isSystemAdmin,
      })
      .from(users)
      .where(eq(users.email, req.auth.user.email))
      .limit(1);

    if (!user.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: user[0] });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
});

// Update user profile
router.put('/user', isAuthenticated, async (req: any, res) => {
  try {
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.id;
    delete updateData.email;
    delete updateData.passwordHash;
    delete updateData.isSystemAdmin;

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.email, req.auth.user.email))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        villageId: users.villageId,
        address: users.address,
      });

    if (!updatedUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change password
router.post('/change-password', isAuthenticated, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long",
      });
    }

    // Get current user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, req.auth.user.email))
      .limit(1);

    if (!user.length || !user[0].passwordHash) {
      return res.status(400).json({
        error: "Cannot change password for OAuth users",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user[0].passwordHash
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.email, req.auth.user.email));

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;