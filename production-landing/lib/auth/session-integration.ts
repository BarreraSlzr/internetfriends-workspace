// InternetFriends Authentication System
// Integrates with session project: https://github.com/BarreraSlzr/session

import { z } from "zod";

// User Authentication Schema (compatible with session project)
export const UserAuthSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  displayName: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  
  // Authentication methods
  hasPassword: z.boolean(),
  hasWebAuthn: z.boolean(),
  has2FA: z.boolean(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
});

export type UserAuth = z.infer<typeof UserAuthSchema>;

// Session Management Schema
export const SessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  
  // Security metadata
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  country: z.string().length(2).optional(), // ISO country code
  city: z.string().optional(),
  
  // Session flags
  isActive: z.boolean().default(true),
  revokedAt: z.date().optional(),
  revokeReason: z.enum(["logout", "expired", "security", "admin"]).optional(),
});

export type Session = z.infer<typeof SessionSchema>;

// InternetFriends User Extension
export const InternetFriendsUserSchema = UserAuthSchema.extend({
  // Platform-specific fields
  plan: z.enum(["free", "pro", "enterprise"]).default("free"),
  credits: z.number().min(0).default(0),
  
  // Preferences
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]).default("system"),
    language: z.string().default("en"),
  }).default({}),
  
  // InternetFriends specific data
  projects: z.array(z.string().uuid()).default([]),
  achievements: z.array(z.string()).default([]),
});

export type InternetFriendsUser = z.infer<typeof InternetFriendsUserSchema>;

// Auth Utilities
export const createSessionToken = () => {
  return crypto.randomUUID() + "." + Date.now().toString(36);
};

export const isSessionValid = (session: Session): boolean => {
  return session.isActive && session.expiresAt > new Date() && !session.revokedAt;
};
