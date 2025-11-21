// Zod validation schemas for Omnivore Vite migration
// Type-safe form validation with comprehensive error messages

import { z } from 'zod'

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords don\'t match',
    path: ['confirmPassword'],
  })

// Article schemas
export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL'),
  content: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
})

// Subscription schemas
export const subscriptionSchema = z.object({
  url: z.string().url('Invalid URL'),
  name: z.string().min(1, 'Name is required'),
})

// Integration schemas
export const integrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['WEBHOOK', 'API_KEY', 'OAUTH']),
  config: z.record(z.any()).optional(),
})

// Settings schemas
export const userSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  theme: z.string().optional(),
  notifications: z.boolean().optional(),
})

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z
    .object({
      state: z.array(z.string()).optional(),
      labels: z.array(z.string()).optional(),
      dateRange: z
        .object({
          start: z.string().optional(),
          end: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
})

// Export types
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ArticleFormData = z.infer<typeof articleSchema>
export type SubscriptionFormData = z.infer<typeof subscriptionSchema>
export type IntegrationFormData = z.infer<typeof integrationSchema>
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>
export type SearchFormData = z.infer<typeof searchSchema>
