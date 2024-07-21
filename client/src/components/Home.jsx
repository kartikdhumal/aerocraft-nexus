import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import HomeNavbar from './HomeNavbar';
import axios from 'axios';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Footer from './Footer'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import sky2 from '../images/blackplane.jpg'
import whiteplane from '../images/ai.png'
import { Skeleton } from '@mui/material';
import './home.css'

function Home() {
  const [categoryData, setCategoryData] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
    fetchSubcategories();
    fetchModels();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (categoryData.length > 0 && subcategoryData.length > 0 && modelData.length > 0 && companyData.length > 0) {
      setLoading(false);
    }
  }, [categoryData, subcategoryData, modelData, companyData]);


  const fetchCategory = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/categories');
      setCategoryData(response.data.categories);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/subcategories');
      setSubcategoryData(response.data.subcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/models');
      setModelData(response.data.models);
    } catch (error) {
      console.error('There was a problem with fetching models :', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/companies');
      setCompanyData(response.data.companies);

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const navigate = useNavigate();

  const handleClick = (categoryName) => {
    navigate(`/modelbycategory/${categoryName}`);
  };

  const fetchRandomImage = (categoryName) => {
    try {
      const category = categoryData.find(category => category.name === categoryName);
      if (!category) {
        console.log('Category not found');
        return '';
      }
      const subcategories = subcategoryData.filter(subcategory => subcategory.categoryId == category.id);
      if (!subcategories || subcategories.length === 0) {
        console.log(`No subcategories found for this category ${category.name}`);
        return '';
      }

      const filteredModels = modelData.filter(model => subcategories.some(subcategory => subcategory._id === model.subcategoryId));
      if (!filteredModels || filteredModels.length === 0) {
        console.log('No models found for this category');
        return '';
      }
      const randomModelIndex = Math.floor(Math.random() * filteredModels.length);
      const randomModel = filteredModels[randomModelIndex];
      if (randomModel.images.length > 0) {
        return randomModel.images[0];
      } else {
        console.log('No images found for the model');
        return '';
      }
    } catch (error) {
      console.error('Error fetching random image:', error);
      return '';
    }
  };

  const fetchByCompany = (companyName) => {
    try {
      const company = companyData.find(company => company.name === companyName);
      if (!company) {
        console.log('Company not found');
        return '';
      }

      const filteredModels = modelData.filter(model => model.companyId === company.id);
      if (!filteredModels || filteredModels.length === 0) {
        console.log('No models found for this company');
        return '';
      }

      const randomModelIndex = Math.floor(Math.random() * filteredModels.length);
      const randomModel = filteredModels[randomModelIndex];
      if (randomModel.images.length > 0) {
        return randomModel.images[0];
      } else {
        console.log('No images found for the random model');
        return '';
      }
    } catch (error) {
      console.error('Error fetching random image:', error);
      return '';
    }
  };

  const filteredCategories = categoryData.filter(category =>
    subcategoryData.some(subcategory =>
      subcategory.categoryId === category.id &&
      modelData.some(model => model.subcategoryId.toString() === subcategory._id.toString())
    )
  );

  const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  const shuffledCompanyData = shuffleArray([...companyData]);
  const shuffledModelData = shuffleArray([...modelData]);

  return (
    <div className='bg-sky-100'>
      <HomeNavbar />
      <div className="relative w-full pt-12">
        <div className="planediv w-full my-2 flex justify-center lg:flex-col sm:flex-col items-center text-[#355a7c] rounded-lg text-md px-4 py-2 font-bold text-center">
          <img src={whiteplane} className='w-96 h-60 mt-5 lg:rotate-0 planeimg' alt="White Plane" />
          <h1 className='lg:p-2 lg:text-[66px] sm:text-[40px] vsm:text-[30px] sm:p-2 text-sky-700 font-bold planetext'>Welcome to, AeroCraft Nexus</h1>
        </div>
      </div>

      {/* Models By Category */}
      <div className='lg:p-5 sm:p-5 vsm:p-0'>
        <div className='text-2xl p-12 w-full text-center'>Models By Category</div>
        <div className="flex flex-wrap p-5 justify-center items-center">
          {loading ? (
            [...Array(5)].map((_, index) => (
              <div key={index} className='w-full sm:w-1/2 lg:w-[18%] px-2 my-2'>
                <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: "10px 10px 0 0" }} />
                <Skeleton variant="text" width="100%" height={50} sx={{ borderRadius: "0 0 10px 10px" }} />
              </div>
            ))
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className='w-full sm:w-1/2 lg:w-[18%] px-2 my-2'>
                <Link to={`/modelbycategory/${category.id}`} className="block">
                  <div className="w-full bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                    <img src={fetchRandomImage(category.name)} className='w-full h-40 object-fill' alt={category.name} />
                    <div className="p-3">
                      <p className="text-md font-semibold text-center">{category.name}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Models By Company */}
      <div className='lg:p-5 sm:p-5 vsm:p-0'>
        <div className='text-2xl p-12 w-full text-center'>Models By Company</div>
        <div className="flex flex-wrap p-5 justify-center items-center">
          {loading ? (
            [...Array(5)].map((_, index) => (
              <div key={index} className='w-full sm:w-1/2 lg:w-[18%] px-2 my-2'>
                <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: "10px 10px 0 0" }} />
                <Skeleton variant="text" width="100%" height={50} sx={{ borderRadius: "0 0 10px 10px" }} />
              </div>
            ))
          ) : (
            shuffledCompanyData
              .filter(company => modelData.some(model => model.companyId === company.id))
              .slice(0, 10)
              .map(company => (
                <div key={company.id} className='w-full sm:w-1/2 lg:w-[18%] px-2 my-2'>
                  <Link to={`/modelbycompany/${company.id}`} className="block">
                    <div className="w-full bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                      <img src={fetchByCompany(company.name)} className='w-full h-40 object-fill' alt={company.name} />
                      <div className="p-3">
                        <p className="text-md font-semibold text-center">{company.name}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
          )}
        </div>
        <div className="flex justify-center items-center">
          <NavLink to="/allmodels" className="text-md font-bold cursor-pointer border underline text-black rounded-xl px-4 py-1 mb-5">View All</NavLink>
        </div>
      </div>

      {/* Featured Models */}
      <div className='lg:p-5 sm:p-5 vsm:p-0'>
        <div className='text-2xl p-12 w-full text-center'>Featured Models</div>
        <div className="flex flex-wrap p-5 justify-center items-center">
          {loading ? (
            [...Array(5)].map((_, index) => (
              <div key={index} className='w-full sm:w-1/2 lg:w-[18%] px-2 my-2'>
                <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: "10px 10px 0 0" }} />
                <Skeleton variant="text" width="100%" height={50} sx={{ borderRadius: "0 0 10px 10px" }} />
              </div>
            ))
          ) : (
            shuffledModelData.slice(0, 10).map((model) => (
              <div key={model._id} className='w-full sm:w-1/2 lg:w-[18%] px-2 my-2'>
                <NavLink to={`/modelcard/${model._id}`} className="block">
                  <img src={model.images[0]} className='w-full h-40 rounded-t-xl object-fill' alt={model.name} />
                  <div className="p-4 bg-gray-100 rounded-b-xl">
                    <p className="text-md font-semibold">
                      {model.name.length > 20 ? `${model.name.substring(0, 20)}...` : model.name}
                    </p>
                    <p className="text-gray-600 mt-2 text-md flex items-center"><CurrencyRupeeIcon />{model.price}</p>
                  </div>
                </NavLink>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center items-center">
          <NavLink to="/allmodels" className="text-md font-bold cursor-pointer border underline text-black rounded-xl px-4 py-1 mb-5">View All</NavLink>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
