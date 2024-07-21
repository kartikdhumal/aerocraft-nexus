import client from '../db/connect.js';

export const getOrderDetail = async (req,res) => {
    try {
        const db = client.db();
        const orders = await db.collection('orderDetails').find().toArray();
        if (!orders || orders.length === 0) {
          return res.status(404).json({ message: 'No orderDetails found for the user' });
        }
        res.status(200).json({ orderDetails });
      } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
      }
}