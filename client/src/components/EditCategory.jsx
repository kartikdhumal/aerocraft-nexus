import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminNavbar from './AdminNavbar';
import { styled } from '@mui/material/styles';

function EditCategory() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const catid = location.state ? location.state.catId || '' : '';

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/getcategory/${catid}`);
        setName(response.data.category.name);
      } catch (error) {
        console.error('Error fetching category data:', error);
      }
    };

    fetchCategoryData();
  }, [catid]);

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
        setLoading(true);
        if (!name) {
            throw new Error('Category is required');
        }
        if (/^\d+$/.test(name)) {
            throw new Error('Name cannot contain only digits');
        }
        if (name.length < 2) {
            throw new Error('Name must contain at least two characters');
        }

        const response = await axios.put(`https://aerocraftnexusserver.vercel.app/api/updatecategory/${catid}`, { name });
        
        if (response.data.error && response.data.error.includes('already exists')) {
            throw new Error('Category already exists');
        }
        toast.success(response.data.message);
        navigate('/addcat');
    } catch (error) {
        toast.error(error.response.data.error);
        if (error.message.includes('Category is required')) {
            setNameError(error.message);
        } else {
            setNameError('');
        }
    } finally {
        setLoading(false);
    }
};

  return (
    <div className='bg-sky-100 min-h-screen'>
      <AdminNavbar />
      <div className="container mx-auto">
        <div className="flex justify-center pt-5 items-center">
          <form className="p-8 rounded-lg w-96" onSubmit={handleUpdateCategory}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Category Name</label>
              <input type="text" id="name" value={name} required onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${nameError ? 'border-red-500' : 'focus:border-blue-500'}`} />
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>
            <button type="submit" className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center">
              {loading ? 'Updating Category...' : 'Update Category'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditCategory;
