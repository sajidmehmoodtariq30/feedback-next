import { z } from 'zod';

export const usernameValidation = z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(20, { message: 'Username must not exceed 20 characters' })
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+$/, { message: 'Username must contain only lowercase letters and numbers' });

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z
        .string()
        .email({ message: 'Please enter a valid email address' })
        .trim(),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .max(100, { message: 'Password must not exceed 100 characters' })
        .trim()
});