import { ObjectId } from 'mongodb';
import client from '../db/connect.js';

export const addModels = async (req,res) => {
    try {
        const db = client.db();
        const { name, description, price, quantity, images, subcategoryId, companyId } = req.body;
        const existingModel = await db.collection('model').findOne({ name: name });
    
        if (!name || !description || !price || !quantity || !images.length) {
          return res.status(400).json({ message: 'All fields are required' });
        }
        if (existingModel) {
          return res.status(400).json({ message: 'Model name already exists' });
        }
        if (/^\d+$/.test(name)) {
          return res.status(400).json({ message: 'Name cannot contain only digits' });
        }
        if (name.length < 2) {
          return res.status(400).json({ message: 'Name must contain at least two characters' });
        }
    
        const newModel = {
          name,
          description,
          price,
          quantity,
          images,
          subcategoryId,
          companyId
        };
        const result = await db.collection('model').insertOne(newModel);
        res.status(201).json({ message: 'Model Added' });
      } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
      }
}

export const updateModelByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const { name, description, price, quantity, images, subcategoryId, companyId } = req.body;
        const existingModel = await db.collection('model').findOne({ name: name, _id: { $ne: new ObjectId(id) } });
    
        if (existingModel) {
          return res.status(400).json({ message: 'Model name already exists' });
        }
        if (!name || !description || !price || !quantity || !images.length || !subcategoryId || !companyId) {
          return res.status(400).json({ message: 'All fields are required' });
        }
    
        const model = await db.collection('model').findOne({ _id: new ObjectId(id) });
        if (!model) {
          return res.status(404).json({ error: 'Model not found' });
        }
        await db.collection('model').findOneAndUpdate(
          { _id: model._id },
          { $set: { name, description, price, quantity, images, subcategoryId, companyId } },
          { new: true }
        );
        return res.status(200).json({ message: 'Model updated successfully' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

export const deleteModelByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const modelData = await db.collection('model').findOneAndDelete({ _id: new ObjectId(id) });
    
        if (modelData) {
          res.json({ message: 'Model deleted successfully' });
        } else {
          res.status(404).json({ message: 'Model not found' });
        }
      } catch (error) {
        res.status(500).json({ message: `Error deleting model in server ${error}` });
      }
}

export const getModels = async (req,res) => {
    try {
        const db = client.db();
        const models = await db.collection('model').find().toArray();
        if (!models || models.length === 0) {
          return res.status(404).json({ error: 'No models found' });
        }
        return res.status(200).json({ models });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

export const getModelByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const modelData = await db.collection('model').findOne({ _id: new ObjectId(id) });
    
        if (modelData) {
          res.json({ model: modelData });
        } else {
          res.status(404).json({ message: `Model with ID: ${id} not found` });
        }
      } catch (error) {
        res.status(500).json({ message: `Error fetching model in server ${error}` });
      }
}

export const getModelsByCategoryName = async (req,res) => {
    try {
        const db = client.db();
        const categoryName = req.params.categoryName;
    
        const category = await db.collection('category').findOne({ name: categoryName });
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
    
        const subcategories = await db.collection('subcategory').find({ categoryId: category._id }).toArray();
        if (!subcategories || subcategories.length === 0) {
          return res.status(404).json({ error: 'No subcategories found for this category' });
        }
    
        const subcategoryIds = subcategories.map(subcategory => subcategory._id);
    
        const models = await db.collection('model').find({ subcategoryId: { $in: subcategoryIds } }).toArray();
        if (!models || models.length === 0) {
          return res.status(404).json({ error: 'No models found for this category' });
        }
    
        return res.status(200).json({ models: models });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}