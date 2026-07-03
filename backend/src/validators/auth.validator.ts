import { z } from 'zod';

export const registerCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name is too short'),
  domain: z.string().optional(),
  adminName: z.string().min(2, 'Admin name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
