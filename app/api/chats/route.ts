    // /api/chats
    import { NextRequest, NextResponse } from "next/server";
    import { connectToDB } from "@/lib/connectToDB";
    import Chat from '@/models/Chat';
    import { auth } from "@clerk/nextjs/server";
    import { gunzipSync } from "zlib";


export async function GET(req: NextRequest){
    try {
    const { userId } = await auth();
    if(!userId) return NextResponse.json({ error: "Action not allwoed" }, { status: 400 });

    await connectToDB();

        const chats = await Chat.find({ userId: userId })
                .sort({ 'messages.0.createdAt': -1 }) // Sort by the timestamp of the first message
                .limit(10)
                .select('chatId messages'); // Only fetch the chatId and messages array

        const decompress = (text: string) => gunzipSync(Buffer.from(text, "base64")).toString();


    const chatList = chats.map(chat => {
    const title = chat.messages.length > 0
        ? decompress(chat.messages[0].content).substring(0, 30) + '...'
        : 'New Chat';
        return {
        chatId: chat.chatId,
        title: title
        };
    });

return NextResponse.json(chatList, { status: 200 });
} catch (error) {
console.error('Error fetching chat list:', error);
return NextResponse.json({ message: "Error fetching chat list" }, { status: 500 });
}
    }