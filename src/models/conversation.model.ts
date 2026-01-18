import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageDoc {
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
}

export interface IConversationDoc extends Document {
    title: string;
    messages: IMessageDoc[];
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessageDoc>({
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ConversationSchema = new Schema<IConversationDoc>(
    {
        title: {
            type: String,
            required: true,
            default: 'New Chat',
            trim: true,
            maxlength: 100,
        },
        messages: [MessageSchema],
        userId: {
            type: String,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ConversationSchema.index({ createdAt: -1 });
ConversationSchema.index({ userId: 1, createdAt: -1 });

export const Conversation = mongoose.model<IConversationDoc>('Conversation', ConversationSchema);
