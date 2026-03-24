import { NextResponse } from 'next/server';
// import { headers } from 'next/headers';
import { Webhook } from 'svix';
import User from '@/models/User';
import { connectToDB } from '@/lib/connectToDB';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
const payload = await req.text();

const svix_id = req.headers.get('svix-id')!;
const svix_timestamp = req.headers.get('svix-timestamp')!;
const svix_signature = req.headers.get('svix-signature')!;

const wh = new Webhook(webhookSecret);

let evt: any;
try {
    evt = wh.verify(payload, {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
    });
} catch (err) {
    console.error(' Webhook verification failed:', err);
    return new NextResponse('Webhook Error', { status: 400 });
}

// console.log(' Clerk Webhook Payload:', evt);//dev

const {
    id: clerkId,
    email_addresses,
    first_name,
    last_name,
    image_url,
} = evt.data;

if (!clerkId) {
    
    return new NextResponse('Missing clerkId', { status: 400 });
}

try {
    await connectToDB();

    const userExists = await User.findOne({ clerkId });
    // console.log(clerkId)

    if (!userExists) {
    const newUser = await User.create({
        clerkId:clerkId,
        email: email_addresses?.[0]?.email_address || '',
        first_name: first_name || '',
        last_name: last_name || '',
        image: image_url || '',
    });

    console.log(' New user created:', newUser);//dev
    } else {
    console.log(' User already exists:', userExists);//dev
    }

    return NextResponse.json({ success: true });
} catch (err) {
    console.error(' Database error:', err);//dev
    return new NextResponse('Database Error', { status: 500 });
}
}