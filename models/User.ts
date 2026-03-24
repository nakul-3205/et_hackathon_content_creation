import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
    clerkId: string;
    email: string;
    first_name: string;
    last_name: string;
    image: string;

    }

const UserSchema = new Schema<IUser>({
    clerkId:{ type: String},
    email: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    image: { type: String },
    },{timestamps:true});

    const User = models.User || model<IUser>('User', UserSchema);
    export default User;