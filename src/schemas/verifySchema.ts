import { z } from 'zod';

export const verifySchema = z.object({
    code: z
        .string()
        .length(6, { message: 'Verification code must exactly least 6 characters long' })
        .trim()
        .regex(/^[0-9]+$/, { message: 'Verification code must contain only numbers' })
});