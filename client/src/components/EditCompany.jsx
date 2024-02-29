import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

function UpdateCompany() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const companyId = location.state ? location.state.companyId || '' : '';

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get(`http://localhost:2000/api/getcompany/${companyId}`);
        setName(response.data.category.name);
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!name) {
        throw new Error('Company name is required');
      }
      if (/^\d+$/.test(name)) {
        throw new Error('Name cannot contain only digits');
      }
      if (name.length < 2) {
        throw new Error('Name must contain at least two characters');
      }
  
      const response = await axios.put(`http://localhost:2000/api/updatecompany/${companyId}`, { name });
      if (response.data.error && response.data.error.includes('already exists')) {
        throw new Error('Company name already exists');
      }
  
      alert(response.data.message);
      navigate('/addcom');
    } catch (error) {
      if (error.message === 'Company name already exists') {
        alert(error.message);
      } else {
        alert(error.response.data.error);
      }
      setNameError(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className='bg-sky-100 min-h-screen'>
      <AdminNavbar />
      <div className="container mx-auto">
        <div className="flex justify-center pt-5 items-center">
          <form className="p-8 rounded-lg w-96" onSubmit={handleUpdateCompany}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Company Name</label>
              <input type="text" id="name" value={name} required onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${nameError ? 'border-red-500' : 'focus:border-blue-500'}`} />
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>
            <button type="submit" className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center">
              {loading ? 'Updating Company...' : 'Update Company'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateCompany;
