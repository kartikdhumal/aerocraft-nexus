import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import client from '../db/connect.js';

export const RegisterUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (/^\d+$/.test(name)) {
            return res.status(400).json({ message: 'Name cannot contain only digits' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const db = client.db();
        const existingUser = await db.collection('user').findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User Already Exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role
        };

        const result = await db.collection('user').insertOne(newUser);

        const token = jwt.sign({
            userId: result.insertedId.toString(),
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
        }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User registration successful',
            token,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            userid: result.insertedId.toString()
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = client.db();
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await db.collection('user').findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        const token = jwt.sign({ userId: user._id }, 'aircraftmodel', { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token, email: user.email, name: user.name, role: user.role, userid: user._id });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const updatePassword = async (req, res) => {
    try {
        const db = client.db();
        const { email, newPassword } = req.body;
        const user = await db.collection('user').findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.collection('user').findOneAndUpdate(
            { _id: user._id },
            { $set: { password: hashedPassword } },
            { new: true }
        );
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getUsers = async (req, res) => {
    try {
        const db = client.db();
        const users = await db.collection('user').find().toArray();
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }
        const simplifiedUsers = users.map(user => ({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        }));
        return res.status(200).json({ users: simplifiedUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


export const addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const db = client.db();

        if (/^\d+$/.test(name)) {
            return res.status(400).json({ message: 'Name cannot contain only digits' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const existingUser = await db.collection('user').findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User Already Exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role
        };
        const result = await db.collection('user').insertOne(newUser);
        res.status(201).json({ message: 'User Added successfully' });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getUserByEmail = async (req, res) => {
    try {
        const db = client.db();
        const email = req.params.email;
        const data = await db.collection('user').findOne({ email: email });

        if (data) {
            res.json({ user: data });
        } else {
            res.status(404).json({ message: `User Not Found` });
        }
    } catch (error) {
        res.status(500).json({ message: `Error fetching user in server ${error}` });
    }
}


export const getUserByID = async (req, res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const user = await db.collection('user').findOne({ _id: new ObjectId(id) });

        if (user) {
            res.json({ user: user });
        } else {
            res.status(404).json({ message: `User with ID: ${id} not found` });
        }
    } catch (error) {
        res.status(500).json({ message: `Error fetching in server ${error}` });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const userData = await db.collection('user').findOneAndDelete({ _id: new ObjectId(id) });

        if (userData) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Error deleting user in server ${error}` });
    }
}

export const updateProfileByID = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        if (/^\d+$/.test(name)) {
            return res.status(400).json({ message: 'Name cannot contain only digits' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = {
            name,
            email,
            password: hashedPassword,
            role
        };

        const db = client.db();
        const result = await db.collection('user').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updatedUser }
        );

        if (result.modifiedCount === 1) {
            const token = jwt.sign({ userId }, 'aircraftmodel', { expiresIn: '1h' });
            return res.status(200).json({ message: 'User profile updated successfully', token });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}