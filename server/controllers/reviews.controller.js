import { ObjectId } from 'mongodb';
import client from '../db/connect.js';

export const getReviews = async (req,res) => {
    try {
        const db = client.db();
        const reviews = await db.collection('reviews').find().toArray();
        if (!reviews || reviews.length === 0) {
          return res.status(404).json({ error: 'No reviews found' });
        }
        return res.status(200).json({ reviews });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

export const addReview = async (req,res) => {
    try {
        const db = client.db();
        const { userId, modelId, rate, feedback } = req.body;
        const existingReview = await db.collection('reviews').findOne({ modelId: modelId, userId: userId });
    
        if (existingReview) {
          return res.status(400).json({ message: 'Already Reviewd' });
        }
    
        if (!modelId || !feedback || !userId || isNaN(rate)) {
          return res.status(400).json({ message: 'Invalid request data' });
        }
    
        const newReviewItem = {
          userId,
          modelId,
          rate,
          feedback,
          date: new Date()
        };
    
        const result = await db.collection('reviews').insertOne(newReviewItem);
        res.status(201).json({ message: 'review added' });
      } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
      }
}

export const getReviewsByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const revData = await db.collection('reviews').find({ modelId: id }).toArray();
    
        if (revData.length > 0) {
          res.json({ reviews: revData });
        } else {
          res.status(404).json({ message: `No reviews found for model with ID: ${id}` });
        }
      } catch (error) {
        res.status(500).json({ message: `Error fetching reviews from the server: ${error.message}` });
      }
}

export const deleteReviewByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const cartData = await db.collection('reviews').findOneAndDelete({ _id: new ObjectId(id) });
    
        if (cartData) {
          res.json({ message: 'Reviews deleted successfully' });
        } else {
          res.status(404).json({ message: 'Reviw not found' });
        }
      } catch (error) {
        res.status(500).json({ message: `Error deleting reviews in server ${error}` });
      }
}