import { ObjectId } from 'mongodb';
import client from '../db/connect.js';

export const addSubcategory = async (req, res) => {
    try {
        const db = client.db();
        const { name, categoryId } = req.body;
        const subcat = await db.collection('subcategory').findOne({ name: name });

        if (!name) {
            return res.status(400).json({ message: 'Subcategory name is required' });
        }
        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }
        if (/^\d+$/.test(name)) {
            return res.status(400).json({ message: 'Name cannot contain only digits' });
        }
        if (name.length < 2) {
            return res.status(400).json({ message: 'Name must contain at least two characters' });
        }
        if (subcat) {
            return res.json({ message: 'Subcategory already exists' });
        }

        const newSubcategory = {
            name,
            categoryId
        };
        const result = await db.collection('subcategory').insertOne(newSubcategory);
        res.status(201).json({ message: 'Subcategory Added' });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const UpdateSubcategoryByID = async (req, res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const subcatname = req.body.name;
        const categoryId = req.body.categoryId;

        const existingSubcategory = await db.collection('subcategory').findOne({ name: subcatname });
        if (existingSubcategory && existingSubcategory._id.toString() !== id) {
            return res.status(400).json({ error: 'Subcategory already exists' });
        }

        const subcat = await db.collection('subcategory').findOne({ _id: new ObjectId(id) });
        if (!subcat) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        await db.collection('subcategory').findOneAndUpdate(
            { _id: subcat._id },
            { $set: { name: subcatname, categoryId: categoryId } },
            { new: true }
        );

        return res.status(200).json({ message: 'Subcategory updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


export const deleteSubcategoryByID = async (req, res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const subcatData = await db.collection('subcategory').findOneAndDelete({ _id: new ObjectId(id) });

        if (subcatData) {
            res.json({ message: 'Subcategory deleted successfully' });
        } else {
            res.status(404).json({ message: 'Subcategory not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Error deleting subcategory in server ${error}` });
    }
}

export const getSubcategories = async (req, res) => {
    try {
        const db = client.db();
        const subcategories = await db.collection('subcategory').find().toArray();
        if (!subcategories || subcategories.length === 0) {
            return res.status(404).json({ error: 'No subcategories found' });
        }
        return res.status(200).json({ subcategories: subcategories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getSubcategoryByID = async (req, res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const subcatData = await db.collection('subcategory').findOne({ _id: new ObjectId(id) });

        if (subcatData) {
            res.json({ subcategory: subcatData });
        } else {
            res.status(404).json({ message: `Subcategory with ID: ${id} not found` });
        }
    } catch (error) {
        res.status(500).json({ message: `Error fetching subcategory in server ${error}` });
    }
}

export const findCategoryBySubcategory = async (req,res) => {
    const id = req.params.id;
    const db = client.db();
    try {
      const data = await db.collection('subcategory').find({ categoryId: id }).toArray();
      res.json(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}