import { z } from 'zod';
import { BLOG_CATEGORIES, COVER_THEMES } from './models/Blog';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(128),
});

export const blogSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(140),
  excerpt: z.string().trim().max(300, 'Excerpt must be 300 characters or fewer').optional(),
  content: z.string().trim().min(50, 'Content must be at least 50 characters').max(50000),
  category: z.enum(BLOG_CATEGORIES).default('Web Development'),
  tags: z.array(z.string().trim().min(1).max(24)).max(8).default([]),
  coverTheme: z.enum(COVER_THEMES).default('violet'),
  published: z.enum(['draft', 'published']).default('published'),
});

export const blogUpdateSchema = z.object({
  title: z.string().trim().min(3).max(140).optional(),
  excerpt: z.string().trim().max(300).optional(),
  content: z.string().trim().min(50).max(50000).optional(),
  category: z.enum(BLOG_CATEGORIES).optional(),
  tags: z.array(z.string().trim().min(1).max(24)).max(8).optional(),
  coverTheme: z.enum(COVER_THEMES).optional(),
  published: z.enum(['draft', 'published']).optional(),
});

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid request';
}
