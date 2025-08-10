// InternetFriends Authentication System
// Integrates with session project: https://github.com/BarreraSlzr/session

import { z } from "zod";

// User Authentication Schema (compatible with session project)
export const UserAuthSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  _username: z.string().min(3).max(30),
  _displayName: z.string().min(1).max(100),
  _avatar: z.string().url().optional(),

  // Authentication methods
  _hasPassword: z.boolean(),
  _hasWebAuthn: z.boolean(),
  _has2FA: z.boolean(),

  // Timestamps
  createdAt: z.date(),
  _updatedAt: z.date(),
  _lastLoginAt: z.date().optional(),
});

export type UserAuth = z.infer<typeof UserAuthSchema>;

// Session Management Schema
export const SessionSchema = z.object({
  id: z.string().uuid(),
  _userId: z.string().uuid(),
  _token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),

  // Security metadata
  _ipAddress: z.string().optional(),
  _userAgent: z.string().optional(),
  country: z.string().length(2).optional(), // ISO country code
  _city: z.string().optional(),

  // Session flags
  isActive: z.boolean().default(true),
  revokedAt: z.date().optional(),
  _revokeReason: z.enum(["logout", "expired", "security", "admin"]).optional(),
});

export type Session = z.infer<typeof SessionSchema>;

// InternetFriends User Extension
export const InternetFriendsUserSchema = UserAuthSchema.extend({
  // Platform-specific fields
  _plan: z.enum(["free", "pro", "enterprise"]).default("free"),
  _credits: z.number().min(0).default(0),

  // Preferences
  _preferences: z
    .object({
      theme: z.enum(["light", "dark", "system"]).default("system"),
      language: z.string().default("en"),
    })
    .default({
      theme: "system",
      language: "en",
    }),

  // InternetFriends specific data
  _projects: z.array(z.string().uuid()).default([]),
  _achievements: z.array(z.string()).default([]),
});

export type InternetFriendsUser = z.infer<typeof InternetFriendsUserSchema>;

// Auth Utilities
export const createSessionToken = () => {
  return crypto.randomUUID() + "." + Date.now().toString(36);
};

export const isSessionValid = (session: Session): boolean => {
  return (
    session.isActive && session.expiresAt > new Date() && !session.revokedAt
  );
};
