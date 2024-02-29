import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

function EditSubcategory() {
  const location = useLocation();
  const id = location.state ? location.state.id || '' : '';
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchSubcategory();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategory = async () => {
    try {
      const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/getsubcategory/${id}`);
      const subcategory = response.data.subcategory;
      setCategoryId(subcategory.categoryId);
      setName(subcategory.name);
    } catch (error) {
      console.error('Error fetching subcategory:', error);
    }
  };

  const handleUpdateSubcategory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!name) {
        throw new Error('Subcategory name is required');
      }
      if (!categoryId) {
        throw new Error('Please select a category');
      }
  
      const response = await axios.put(`https://aerocraftnexusserver.vercel.app/api/updatesubcategory/${id}`, { name, categoryId });
      alert(response.data.message);
      navigate('/addsubcat');
      setLoading(false);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error === 'Subcategory already exists') {
        alert('Subcategory already exists');
        setNameError(error.response.data.error);
      } else {
        alert(error.message);
        setNameError(error.message);
      }
      setLoading(false);
    }
  };
  

  return (
    <div className='bg-sky-100 min-h-screen'>
      <AdminNavbar />
      <div className="container mx-auto">
        <div className="flex justify-center pt-5 items-center">
          <form className="p-8 rounded-lg w-96" onSubmit={handleUpdateSubcategory}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Subcategory Name</label>
              <input
                type="text"
                id="name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${nameError ? 'border-red-500' : 'focus:border-blue-500'}`}
              />
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="category-select" className="block text-gray-700 font-semibold mb-2">Category</label>
              <select
                id="category-select"
                value={categoryId}
                required
                onChange={(e) => setCategoryId(e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 w-full"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center"
            >
              {loading ? 'Updating Subcategory...' : 'Update Subcategory'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditSubcategory;
