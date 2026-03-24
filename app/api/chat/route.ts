///api/chat
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import  Chat from '@/models/Chat';
import { gzipSync } from "zlib";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { gunzipSync } from "zlib";


export async function POST(req: NextRequest){
    try {
        const { userId } = await auth();
        if(!userId) return NextResponse.json({ error: "Action not allwoed" }, { status: 400 });
        await connectToDB()
        const compress = (text: string) => gzipSync(text).toString("base64");
        const chatSessionId = uuidv4()
        const body = await req.json();
        const {content,role,chatId } = body;
        console.log(body)
    
        if (!content||!role) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }
        console.log(content,role,chatId)
        const compressedContent=compress(content)
        console.log(compressedContent)
        const newMessage = { role, content: compressedContent };
        if(chatId){
            const updatedChat = await Chat.findOneAndUpdate(
                    {chatId,userId:userId},
                    { $push: { messages: newMessage } },
                    { new: true }
                );
            if(!updatedChat){
                return NextResponse.json({ message: "Chat not updated" }, { status: 404 });
            }
        }else{

        const newchat=new Chat({
            userId:userId,
            chatId:chatSessionId,
            messages:[newMessage]

        })
        console.log(newchat)
        await newchat.save()
        return NextResponse.json({ message: "Chat Stored" ,chatId:chatSessionId}, { status: 201 });

    }

        return NextResponse.json({ message: "Chat Stored" ,chatId}, { status: 201 });
    } catch (error) {
        console.log('Error creating chat',error)
        return  NextResponse.json({ message: "Error creating chat" }, { status: 500 })
    }

}

export async function GET(req: NextRequest){
    try {
        const { userId } = await auth();
            if(!userId) return NextResponse.json({ error: "Action not allwoed" }, { status: 400 });
            await connectToDB()
            const decompress = (text: string) =>
                gunzipSync(Buffer.from(text, "base64")).toString();
            const url = new URL(req.url);
            const chatId = url.searchParams.get("chatId");
            if (!chatId)
                return NextResponse.json({ error: "chatId required" }, { status: 400 });
            const chat = await Chat.findOne({ chatId, userId:userId });
            if (!chat)
                return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    
            const messages = chat.messages.map((m) => ({
                role: m.role,
                content: decompress(m.content),
                createdAt: m.createdAt,
            }));
    
                return NextResponse.json({ chatId: chat.chatId, messages }, { status: 200 });
    } catch (error) {
        console.log('Error fetching chat',error)
        return  NextResponse.json({ message: "Error fetching chat" }, { status: 500 })
    }

}