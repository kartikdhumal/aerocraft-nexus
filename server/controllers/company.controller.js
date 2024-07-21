import { ObjectId } from 'mongodb';
import client from '../db/connect.js';

export const addCompany = async (req,res)=>{
    try {
        const db = client.db();
        const { name } = req.body;
        const cat = await db.collection('company').findOne({ name: name });
        if (!name) {
          return res.status(400).json({ message: 'Company Name is required' });
        }
        if (/^\d+$/.test(name)) {
          return res.status(400).json({ message: 'Name cannot contain only digits' });
        }
        if (name.length < 2) {
          return res.status(400).json({ message: 'Name must contain at least one letter' });
        }
        if (cat) {
          return res.json({ message: 'Company Name already exists!' });
        }
        const newcategory = {
          name
        };
        const result = await db.collection('company').insertOne(newcategory);
        res.status(201).json({ message: 'Company Added' });
      } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
      }
}

export const updateCompanyByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const comname = req.body.name;
    
        const existingCompany = await db.collection('company').findOne({ name: comname, _id: { $ne: new ObjectId(id) } });
        if (existingCompany) {
          return res.status(400).json({ error: 'Company name already exists' });
        }
    
        const com = await db.collection('company').findOne({ _id: new ObjectId(id) });
        if (!com) {
          return res.status(404).json({ error: 'Company not found' });
        }
        await db.collection('company').findOneAndUpdate(
          { _id: com._id },
          { $set: { name: comname } },
          { new: true }
        );
        return res.status(200).json({ message: 'Company updated successfully' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

export const deleteCompanyByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const catData = await db.collection('company').findOneAndDelete({ _id: new ObjectId(id) });
    
        if (catData) {
          res.json({ message: 'Company deleted successfully' });
        } else {
          res.status(404).json({ message: 'Company not found' });
        }
      } catch (error) {
        res.status(500).json({ message: `Error deleting company in server ${error}` });
      }
}

export const getCompanies = async (req,res) => {
    try {
        const db = client.db();
        const companies = await db.collection('company').find().toArray();
        if (!companies || companies.length === 0) {
          return res.status(404).json({ error: 'No companies found' });
        }
        const simplfiledCompanies = companies.map(company => ({
          id: company._id,
          name: company.name
        }));
        return res.status(200).json({ companies: simplfiledCompanies });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

export const getCompanyByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const catData = await db.collection('company').findOne({ _id: new ObjectId(id) });
    
        if (catData) {
          res.json({ category: catData });
        } else {
          res.status(404).json({ message: `Company with ID: ${id} not found` });
        }
      } catch (error) {
        res.status(500).json({ message: `Error fetching company in server ${error}` });
      }
}