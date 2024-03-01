import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { toast } from 'react-toastify';

function EditModel() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
    subcategoryId: '',
    companyId: '',
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const navigate = useNavigate();

  const location = useLocation();
   const id = location.state ? location.state.modelId || '' : '';


  useEffect(() => {
    fetchModelData();
    fetchCategories();
    fetchCompanies();
    fetchSubcategories();
    findSubcategories();
  }, []);

  const fetchModelData = async () => {
    try {
      const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/getmodel/${id}`);
      const modelData = response.data.model;

      setFormData({
        name: modelData.name,
        description: modelData.description,
        price: modelData.price,
        quantity: modelData.quantity,
        subcategoryId: modelData.subcategoryId,
        companyId: modelData.companyId,
        images: modelData.images,
      });
    } catch (error) {
      console.error('Error fetching model data:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/companies');
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
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
  
  const handleNameChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      name: value,
    }));
  };

  const handleDescriptionChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: value,
    }));
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      price: value,
    }));
  };

  const handleQuantityChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      quantity: value,
    }));
    console.log(formData);
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
    setFormData((prevFormData) => ({
      ...prevFormData,
      subcategoryId: value,
    }));
  };

  const handleCompanyChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      companyId: value,
    }));
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
        images: uploadedImages,
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };
  
  

  const validateForm = () => {
    const { name, description, price, quantity, companyId, subcategoryId } = formData;

    if (!name || !description || !price || !quantity || !companyId || !subcategoryId) {
      toast.warning('All fields are required');
      return false;
    }

    if (description.length < 1) {
      toast.warning('Description should have at least 1 letter');
      return false;
    }

    if (price < 1) {
      toast.warning('Price should be greater than or equal to 1');
      return false;
    }

    if (quantity < 1) {
      toast.warning('Quantity should be greater than or equal to 1');
      return false;
    }

    return true;
  };

  const findSubcategories = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/subcategories');
      setSubcategoryData(response.data.subcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleUpdateModel = async (e) => {
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
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        companyId: formData.companyId,
        images: formData.images,
      };
  
      console.log('Modified FormData:', modifiedFormData);

      const response = await axios.put(`https://aerocraftnexusserver.vercel.app/api/updatemodel/${id}`, modifiedFormData);
      toast.success('Model Updated');
      navigate('/addmod');
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        categoryId: '',
        subcategoryId: '',
        companyId: '',
        images: [],
      });
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update model. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className='bg-sky-100 min-h-screen'>
      <AdminNavbar />
      <div className="container mx-auto">
        <div className="flex justify-center pt-5 items-center">
          <form className="p-8 rounded-lg w-96" onSubmit={handleUpdateModel}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Model Name
              </label>
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
                className="p-2 w-full  text-white rounded-md cursor-pointer"
              />
            </div>

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
                <option disabled selected>
                {formData.subcategoryId ? (
                        subcategoryData.find(subcategory => subcategory._id === formData.subcategoryId) ? (
                          categories.find(category =>
                            category._id ===
                            subcategories.find(subcategory => subcategory._id === formData.subcategoryId)?.categoryId
                          )?.name || 'Select Category'
                        ) : 'Select Category'
                      ) : 'Select Category'}
                </option>
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
                <option disabled selected>
                 {
                   subcategoryData.find(subcategory => subcategory._id === formData.subcategoryId)?.name || 'Select Subcategory'
                 }
                </option>
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
                <option disabled selected>
                {companies.find(company => company.id === formData.companyId)?.name || 'Select Company'}
                </option>
                {companies.map((company) => (
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
              {loading ? 'Updating Model...' : 'Update Model'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditModel;
