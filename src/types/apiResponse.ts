import { Message } from "@/models/User";

export interface ApiResponse<T> {
    status: number;
    message: string;
    success: boolean;
    isAccepting?: boolean;
    messages?: Array<Message>;
}