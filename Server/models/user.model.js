import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"], // extendable for project roles
        default: "user"
    },
    profilePicture: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    mfaEnabled: {
        type: Boolean,
        default: false
    },
    mfaSecret: String // for authenticator apps if you implement MFA
});

export default mongoose.model("User", userSchema);
