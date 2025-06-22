import { z } from 'zod';

export const messageSchema = z.object({
    content: z
        .string()
        .min(10, { message: 'Message must be at least 1 character long' })
        .max(300, { message: 'Message must not exceed 300 characters' })
        .regex(/^[a-zA-Z0-9\s.,!?'"-]+$/, { message: 'Message can only contain alphanumeric characters and punctuation' }),
    timestamp: z.date().optional()
})