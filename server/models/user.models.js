import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: false,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        unique: false,
        required: true,
    },
    role: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;