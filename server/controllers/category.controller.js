import { ObjectId } from 'mongodb';
import client from '../db/connect.js';

export const addCategory = async (req, res) => {
    try {
        const db = client.db();
        const { name } = req.body;
        const cat = await db.collection('category').findOne({ name: name });
        if (!name) {
            return res.status(400).json({ message: 'Category is required' });
        }
        if (/^\d+$/.test(name)) {
            return res.status(400).json({ message: 'Name cannot contain only digits' });
        }
        if (name.length < 2) {
            return res.status(400).json({ message: 'Name must contain at least one letter' });
        }
        if (cat) {
            return res.json({ message: 'Category already exists!' });
        }
        const newcategory = {
            name
        };
        const result = await db.collection('category').insertOne(newcategory);
        res.status(201).json({ message: 'Category Added' });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const updateCategoryByID = async (req, res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const catname = req.body.name;

        const existingCategory = await db.collection('category').findOne({ name: catname, _id: { $ne: new ObjectId(id) } });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category name already exists' });
        }

        const cat = await db.collection('category').findOne({ _id: new ObjectId(id) });
        if (!cat) {
            return res.status(404).json({ error: 'Category not found' });
        }
        await db.collection('category').findOneAndUpdate(
            { _id: cat._id },
            { $set: { name: catname } },
            { new: true }
        );
        return res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteCategoryByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const catData = await db.collection('category').findOneAndDelete({ _id: new ObjectId(id) });
    
        if (catData) {
          res.json({ message: 'category deleted successfully' });
        } else {
          res.status(404).json({ message: 'category not found' });
        }
      } catch (error) {
        res.status(500).json({ message: `Error deleting user in server ${error}` });
      }
}

export const getCategories = async (req,res) => {
    try {
        const db = client.db();
        const categories = await db.collection('category').find().toArray();
        if (!categories || categories.length === 0) {
          return res.status(404).json({ error: 'No categories found' });
        }
        const simplifiedCategories = categories.map(category => ({
          id: category._id,
          name: category.name
        }));
        return res.status(200).json({ categories: simplifiedCategories });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

export const getCategoryByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const catData = await db.collection('category').findOne({ _id: new ObjectId(id) });
    
        if (catData) {
          res.json({ category: catData });
        } else {
          res.status(404).json({ message: `Category with ID: ${id} not found` });
        }
      } catch (error) {
        res.status(500).json({ message: `Error fetching in server ${error}` });
      }
}