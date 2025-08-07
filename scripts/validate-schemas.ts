#!/usr/bin/env bun
// Schema Validation using Zod

import { z } from "zod";

// InternetFriends Schema Definitions
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(["active", "paused", "completed"]),
  owner: UserSchema,
  collaborators: z.array(UserSchema),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const _APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  error: z.string().optional(),
  timestamp: z.date(),
});

async function validateSchemas() {
  console.log("🔍 InternetFriends Schema Validation");
  console.log("=================================== ");
  
  // Test User Schema
  try {
    const _validUser = UserSchema.parse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "user@internetfriends.xyz",
      name: "John Doe",
      avatar: "https://avatar.example.com/user.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ User Schema validation passed");
  } catch (error) {
    console.log("❌ User Schema validation failed: ", error);
  }
  
  // Test Project Schema
  try {
    const _validProject = ProjectSchema.parse({
      id: "456e7890-e89b-12d3-a456-426614174001", 
      name: "InternetFriends Landing Page",
      description: "Next.js landing page for InternetFriends platform",
      status: "active",
      owner: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "owner@internetfriends.xyz", 
        name: "Project Owner",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      collaborators: [],
      tags: ["nextjs", "react", "typescript", "tailwind"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Project Schema validation passed");
  } catch (error) {
    console.log("❌ Project Schema validation failed: ", error);
  }
  
  console.log("🎯 Schema validation complete!");
}

if (import.meta.main) {
  validateSchemas().catch(console.error);
}
