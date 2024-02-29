import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminNavbar from './AdminNavbar';
import { Cloudinary } from "@cloudinary/url-gen";
import { styled } from '@mui/material/styles';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

function AddMod() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    images: [],
    subcategoryId: '',
    companyId: '',
  });
  const [loading, setLoading] = useState(false);
  const [modelData, setModelData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const cld = new Cloudinary({ cloud: { cloudName: 'ddhjzsml9' } });


  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchCompanies();
    fetchSubcategories();
    findSubcategories();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/models');
      setModelData(response.data.models);
    } catch (error) {
      console.error('There was a problem with fetching models :', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const findSubcategories = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/subcategories');
      setSubcategoryData(response.data.subcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };
  
  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    try {
      const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/findcatbysub/${categoryId}`);
      setSubcategories(response.data);
    } catch (error) {
      console.error('There was a problem with fetching subcategories:', error);
    }
  };



  const fetchCompanies = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/companies');
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleDeleteModel = async (modelId) => {
    try {
      await axios.delete(`https://aerocraftnexusserver.vercel.app/api/deletemodel/${modelId}`);
      alert('Model Deleted');
      setModelData(prevModelData => prevModelData.filter(model => model._id !== modelId));
      fetchData();
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default');

        const response = await fetch('https://api.cloudinary.com/v1_1/ddhjzsml9/image/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        if (data.secure_url) {
          uploadedImages.push(data.secure_url);
        } else {
          console.error('No secure URL found in the response:', data);
        }
      }
      setFormData((prevFormData) => ({
        ...prevFormData,
        images: [...prevFormData.images, ...uploadedImages],
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const validateForm = () => {
    const { name, description, price, quantity, companyId, subcategoryId } = formData;

    if (!name || !description || !price || !quantity || !companyId || !subcategoryId) {
      alert('All fields are required');
      return false;
    }

    if (description.length < 1) {
      alert('Description should have at least 1 letter');
      return false;
    }

    if (price < 1) {
      alert('Price should be greater than or equal to 1');
      return false;
    }

    if (quantity < 1) {
      alert('Quantity should be greater than or equal to 1');
      return false;
    }

    return true;
  };

  const handleAddModel = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const modifiedFormData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        quantity: formData.quantity,
        images: formData.images,
        subcategoryId: formData.subcategoryId,
        companyId: formData.companyId,
      };

      console.log('Modified FormData:', modifiedFormData);
      const response = await axios.post('https://aerocraftnexusserver.vercel.app/api/addmodel', modifiedFormData);
      alert('Model Added Successfully');
      fetchData();
      setFormData({
        name: '',
        description: '',
        images: [],
        price: '',
        quantity: '',
        subcategoryId: '',
        companyId: '',
      });
      setImages([]);
    } catch (error) {
      console.error('Error adding model:', error);
      alert('Failed to add model. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    console.log('Name:', e.target.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      name: value,
    }));
  };

  const handleDescriptionChange = (e) => {
    const { value } = e.target;
    console.log('Description:', e.target.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    console.log('Category:', value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      categoryId: value,
    }));
    fetchSubcategories(value);
  };


  const handleSubcategoryChange = (e) => {
    const { value } = e.target;
    console.log('Subcategory:', e.target.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      subcategoryId: value,
    }));
  };

  const handleCompanyChange = (e) => {
    const { value } = e.target;
    console.log('Company:', value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      companyId: value,
    }));
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    console.log('Price:', value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      price: parseInt(value),
    }));
  };

  const subcategoryToCategoryMap = {};
  subcategoryData.forEach(subcategory => {
    const category = categories.find(category => category.id === subcategory.categoryId);
    if (category) {
      subcategoryToCategoryMap[subcategory._id] = category.name;
    }
  });

  const handleQuantityChange = (e) => {
    const { value } = e.target;
    console.log('Quantity:', value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      quantity: parseInt(value),
    }));
  };

  const handleEdit = async (modelId) => {
    navigate('/editmodel', { state: { modelId } });
  };

  const handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const filteredModels = modelData.filter(model =>
      model.name.toLowerCase().includes(searchQuery) ||
      model.description.toLowerCase().includes(searchQuery) ||
      (subcategoryToCategoryMap[model.subcategoryId] || '').toLowerCase().includes(searchQuery) ||
      subcategoryData.find(subcategory => subcategory._id === model.subcategoryId)?.name.toLowerCase().includes(searchQuery) ||
      (companies.find(company => company.id === model.companyId)?.name || '').toLowerCase().includes(searchQuery)
    );
  
    if (searchQuery === '') {
      fetchData();
    } else {
      setModelData(filteredModels);
    }
  };

  return (
    <div className='bg-sky-100'>
      <AdminNavbar />
      <div className="container mx-auto">
        <div className="flex justify-center pt-5 items-center">
          <form className="p-8 rounded-lg w-96" onSubmit={handleAddModel}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Model Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold ">Model Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="p-2 w-full text-white rounded-md cursor-pointer"
              />
              <div>
                {formData.images ? formData.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Image ${index}`}
                    className="w-16 h-16 my-4 object-cover border border-gray-300"
                  />
                )) : 'No files'}
              </div>
            </div>
            <div className="mb-4 mt-2">
              <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Category</label>
              <select
                id="category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              >
                <option value="" disabled selected>Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="subcategory" className="block text-gray-700 font-semibold mb-2">Subcategory</label>
              <select
                id="subcategory"
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleSubcategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              >
                <option value="" disabled selected>Select Subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>
                ))}
              </select>

            </div>
            <div className="mb-4">
              <label htmlFor="company" className="block text-gray-700 font-semibold mb-2">Company</label>
              <select
                id="company"
                name="companyId"
                value={formData.companyId}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              >
                <option value="" disabled>Select Company</option>
                {companies.sort((a, b) => a.name.localeCompare(b.name)).map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleDescriptionChange}
                className="w-full px-3 py-2 border resize-none border-gray-300 rounded-md focus:outline-none"
                minLength={1}
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                min={1}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-gray-700 font-semibold mb-2">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleQuantityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                min={1}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center"
            >
              {loading ? 'Adding Model...' : 'Add Model'}
            </button>
          </form>
        </div>
        <div className="flex lg:px-20 justify-center pt-5 items-center">
          <input
            type="text"
            placeholder="Search by name, description, type, company, subcategory, category..."
            onChange={handleSearch}
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none mb-4"
          /></div>
        <div className="flex justify-center items-center mt-8">
          <TableContainer component={Paper} style={{ width: '90%', borderRadius: '10px' }}>
            <Table aria-label="custom pagination table">
              <TableHead>
                <TableRow className="bg-gray-300">
                  <TableCell align='left'> ID </TableCell>
                  <TableCell align="left">Model</TableCell>
                  <TableCell align="left">Images</TableCell>
                  <TableCell align="left">Description</TableCell>
                  <TableCell align="left">Type</TableCell>
                  <TableCell align="left">Company</TableCell>
                  <TableCell align="left">Price</TableCell>
                  <TableCell align="left">Quantity</TableCell>
                  <TableCell align="left">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? modelData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : modelData
                ).map((model, index) => (
                  <StyledTableRow key={index + page * rowsPerPage}>
                  <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                    <TableCell className='w-[10%]'>{model.name}</TableCell>
                    <TableCell>
                      {model.images.map((image, index) => (
                        <img
                          key={index+1}
                          src={image}
                          alt={`Image ${index+1}`}
                          className="w-16 h-16 my-4 object-cover border border-gray-300"
                        />
                      ))}
                    </TableCell>
                    <TableCell className='w-[25%]'>{model.description}</TableCell>
                    <TableCell>
                    {model.subcategoryId ? (
                        subcategoryToCategoryMap[model.subcategoryId] || '-'
                      ) : '-'} {' '}
                      {subcategoryData.find(subcategory => subcategory._id === model.subcategoryId)?.name || 'N/A'}
                    </TableCell>

                    <TableCell>
                      {companies.find(company => company.id === model.companyId)?.name || '-'}
                    </TableCell>
                    <TableCell>{model.price + `/-`}</TableCell>
                    <TableCell>{model.quantity}</TableCell>
                    <TableCell>
                      <EditNoteIcon
                        className='text-sky-700 cursor-pointer'
                        onClick={() => handleEdit(model._id)}
                      />
                      &nbsp;
                      <DeleteIcon
                        className='text-red-700 cursor-pointer'
                        onClick={() => handleDeleteModel(model._id)}
                      />
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[1, 5, 10, 15, { label: 'All', value: -1 }]}
                    colSpan={4}
                    count={modelData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: { 'aria-label': 'rows per page' },
                      native: true,
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
}

export default AddMod;
