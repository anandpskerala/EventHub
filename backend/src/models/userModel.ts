import mongoose, { Schema } from "mongoose";
import type { IUser } from "../utils/types/IUser.js";

const schema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        default: null
    },
    googleId: {
        type: String,
        default: null
    },
    authProvider: {
        type: String,
        enum: ["google", "email"],
        required: true
    },
    roles: {
        type: [String],
        enum: ['user', 'organizer', 'admin'],
        default: ['user']
    },
    phoneNumber: {
        type: Number,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


const userModel = mongoose.model<IUser>("User", schema);

export default userModel;