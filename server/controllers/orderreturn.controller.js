import { ObjectId } from 'mongodb';
import client from '../db/connect.js';

export const returnOrder = async (req,res) => {
    try {
        const db = client.db();
        const { userId, orderId, totalAmount, modelsInfo, reason } = req.body;
    
        if (!userId || !orderId || !totalAmount || !modelsInfo || !reason) {
          return res.status(400).json({ message: 'All fields are required' });
        }
    
        await db.collection('orders').findOneAndUpdate(
          { _id: new ObjectId(orderId) },
          { $set: { status: 'returned' } },
          { new: true }
        );
    
        const orderReturn = {
          date: new Date(),
          totalAmount,
          orderId
        };
    
        const insertedOrderReturn = await db.collection('OrderReturn').insertOne(orderReturn);
    
        for (const modelInfo of modelsInfo) {
          const { modelId, quantity } = modelInfo;
          const orderDetail = await db.collection('orderDetails').findOne({ modelId });
          if (orderDetail) {
            const orderReturnDetail = {
              orderReturnId: insertedOrderReturn.insertedId,
              modelId,
              quantity,
              reason
            };
            await db.collection('orderReturnDetails').insertOne(orderReturnDetail);
            // await db.collection('orderDetails').deleteOne({ _id: orderDetail._id });
          }
        }
    
        res.status(200).json({ message: 'Order returned successfully! Your refund will be processed soon. ' });
      } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: `Internal server error` });
      }
}

export const getReturnOrders = async (req,res) => {
    try {
        const db = client.db();
        const orderReturn = await db.collection('OrderReturn').find().toArray();
        if (!orderReturn || orderReturn.length === 0) {
          return res.status(404).json({ message: 'No orderReturn' });
        }
        const orderReturnIds = orderReturn.map(order => order._id);
        const orderReturnDetails = await db.collection('orderReturnDetails').find({ orderReturnId: { $in: orderReturnIds } }).toArray();
    
        if (!orderReturnDetails || orderReturnDetails.length == 0) {
          return res.status(404).json({ message: 'No order Return detail fetched' });
        }
        res.status(200).json({ orderReturn, orderReturnDetails });
      } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
      }
}