export interface IMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
}

export interface IConversation {
    _id?: string;
    title: string;
    messages: IMessage[];
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IChatRequest {
    message: string;
    conversationId?: string;
}

export interface IChatResponse {
    success: boolean;
    message: string;
    data?: {
        response: string;
        conversationId: string;
    };
    error?: string;
}

export interface IApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
