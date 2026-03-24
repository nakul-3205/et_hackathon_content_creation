import mongoose, { Schema, model, models, Types } from "mongoose";


interface IMessage {
role: "user" | "ai";   // sender
content: string;        // compressed content
createdAt?: Date;
}


export interface IChat {
_id?: Types.ObjectId;
userId: string;           // Clerk user ID
chatId: string;         // unique session ID
messages: IMessage[];   // all messages in one array
createdAt?: Date;
updatedAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
{
    role: { type: String, enum: ["user", "ai"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
},
{ _id: true }
);

const ChatSchema = new Schema<IChat>(
{
    userId: { type: String, ref: "User", required: true },
    chatId: { type: String, required: true, unique: true, index: true }, 
    messages: [MessageSchema], 
},
{ timestamps: true }
);


const Chat = models.Chat || model<IChat>("Chat", ChatSchema);

export default Chat;
