import { z } from 'zod';

export const singInSchema = z.object({
    identifier: z
        .string()
        .min(3, { message: 'Identifier must be at least 3 characters long' })
        .max(100, { message: 'Identifier must not exceed 100 characters' })
        .trim(),
    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long' })
        .max(100, { message: 'Password must not exceed 100 characters' })
        .trim()
        .regex(/^[a-zA-Z0-9!@#$%^&*().]+$ /, { message: 'Password can only contain alphanumeric characters and special symbols !@#$%^&*()' }),
    rememberMe: z.boolean().optional()
})