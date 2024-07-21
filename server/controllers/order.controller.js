import client from '../db/connect.js';
import { ObjectId } from 'mongodb';
import Razorpay from 'razorpay';
import 'dotenv/config'

const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
});

export const addOrder = async (req, res) => {
    try {
        const { userId, totalAmount, delAddress, paymentType, status, items, response } = req.body;
        const db = client.db();

        if (!userId || !totalAmount || !delAddress || !paymentType || !status || !items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid request data' });
        }
        if (paymentType == 'online') {
            const options = {
                amount: Number(totalAmount * 100),
                currency: "INR",
                receipt: userId
            };

            const razorpayOrder = await new Promise((resolve, reject) => {
                instance.orders.create(options, (error, order) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                    } else {
                        resolve(order);
                    }
                });
            });
        }

        const order = {
            userId,
            totalAmount,
            delAddress,
            paymentType,
            status,
            date: new Date()
        };

        const orderResult = await db.collection('orders').insertOne(order);
        const orderDetails = items.map(item => ({
            modelId: item.modelId,
            price: item.price,
            quantity: item.quantity,
            orderId: orderResult.insertedId
        }));

        await db.collection('orderDetails').insertMany(orderDetails);

        for (const item of items) {
            await db.collection('model').updateOne(
                { _id: new ObjectId(item.modelId) },
                { $inc: { quantity: -item.quantity } }
            );
        }

        await db.collection('cart').deleteMany({ userId, modelId: { $in: items.map(item => item.modelId) } });

        res.status(201).json({ message: 'Order added successfully', orderId: orderResult.insertedId });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function generateReceiptId(userId, paymentType) {
    return `${userId}-${paymentType}-${Date.now()}`;
}

export const getOrders = async (req, res) => {
    try {
        const db = client.db();
        const orders = await db.collection('orders').find().toArray();
        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'No orders found' });
        }
        return res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getOrderByuserID = async (req, res) => {
    try {
        const db = client.db();
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const orders = await db.collection('orders').find({ userId }).toArray();
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for the user' });
        }

        const orderIds = orders.map(order => order._id);
        const orderDetails = await db.collection('orderDetails').find({ orderId: { $in: orderIds } }).toArray();
        if (!orderDetails || orderDetails.length === 0) {
            return res.status(404).json({ message: 'No order details found for the user' });
        }
        res.status(200).json({ orders, orderDetails });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getOrdersAll = async (req, res) => {
    try {
        const db = client.db();
        const orders = await db.collection('orders').find().toArray();
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for the user' });
        }

        const orderIds = orders.map(order => order._id);
        const orderDetails = await db.collection('orderDetails').find({ orderId: { $in: orderIds } }).toArray();
        if (!orderDetails || orderDetails.length === 0) {
            return res.status(404).json({ message: 'No order detail fetched' });
        }
        res.status(200).json({ orders, orderDetails });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateStatusByID = async (req, res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const status = req.body.status;

        const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await db.collection('orders').findOneAndUpdate(
            { _id: order._id },
            { $set: { status: status } },
            { new: true }
        );

        return res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteOrderByID = async (req, res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const orderDetails = await db.collection('orderDetails').find({ orderId: new ObjectId(id) }).toArray();
        if (orderDetails.length == 0) {
            return res.status(404).json({ message: `Order details not found for the given ID ${orderDetails}` });
        }
        let totalQuantity = 0;
        for (const orderDetail of orderDetails) {
            const { modelId, quantity } = orderDetail;
            await db.collection('model').updateMany(
                { _id: new ObjectId(modelId) },
                { $inc: { quantity: quantity } },
                { new: true }
            );
            totalQuantity += quantity;
        }

        await db.collection('orders').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { status: 'cancelled' } }
        );
        // await db.collection('orderDetails').deleteMany({ orderId: id });

        res.json({ message: 'Order deleted successfully', totalQuantity: totalQuantity });
    } catch (error) {
        res.status(500).json({ message: `Error deleting order: ${error.message}` });
    }
}