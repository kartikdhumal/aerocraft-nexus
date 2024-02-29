import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import HomeNavbar from './HomeNavbar';
import axios from 'axios';
import plane from '../images/plane2.jpg';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Footer from './Footer'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import sky from '../images/sky.jpg'
import sky2 from '../images/sky2.jpg'

function Home() {
  const [categoryData, setCategoryData] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [companyData, setCompanyData] = useState([]);

  useEffect(() => {
    fetchCategory();
    fetchSubcategories();
    fetchModels();
    fetchCompanies();
  }, []);

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
        console.log('No images found for the random model');
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
      <div class="relative bg-sky-300">
        <div class="w-100">
          <img src={sky2} className='w-screen' />
        </div>
      </div>

      <div className='lg:p-5 sm:p-5 vsm:p-0'>
        <div className='text-2xl p-12 w-full text-center'>Models By Category</div>
        <div className="flex flex-row flex-wrap justify-center items-center">
          {filteredCategories
            .filter(category =>
              subcategoryData.some(subcategory => subcategory.categoryId === category.id) &&
              modelData.some(model =>
                subcategoryData.some(subcategory => subcategory._id.toString() === model.subcategoryId.toString())
              )
            )
            .map((category) => (
              <div key={category.id} className='w-full sm:w-40 lg:w-60 p-2'>
                <Link to={`/modelbycategory/${category.id}`} className="block">
                  <div className="w-full bg-white rounded-xl overflow-hidden shadow-lg">
                    <img src={fetchRandomImage(category.name)} className='w-full h-40 object-fill' alt="Random Model" />
                    <div className="p-3">
                      <p className="text-md font-semibold text-center">{category.name}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </div>


      <div className='lg:p-5 sm:p-5 vsm:p-0'>
        <div className='text-2xl p-12 w-full text-center'>Models By Company</div>
        <div className="flex flex-wrap p-5 justify-center items-center">
          {shuffledCompanyData
            .filter(company => modelData.some(model => model.companyId === company.id))
            .slice(0, 10)
            .map(company => (
              <div key={company.id} className='w-full sm:w-1/2 lg:w-[18%] px-2 my-2'>
                <Link to={`/modelbycompany/${company.id}`} className="block">
                  <div className="w-full bg-white rounded-xl overflow-hidden shadow-lg">
                    <img src={fetchByCompany(company.name)} className='w-full h-40 object-fill' alt="Random Model" />
                    <div className="p-3">
                      <p className="text-md font-semibold text-center">
                        {company.name}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
        </div>
        <div className="flex justify-center items-center">
          <NavLink to="/allmodels" className="text-black underline font-bold text-lg pb-5">View All</NavLink>
        </div>
      </div>



      <div className='lg:p-5 sm:p-5 vsm:p-0'>
        <div className='text-2xl p-12 w-full text-center'> Featured Models </div>
        <div className="flex flex-wrap p-5 justify-center items-center">
          {shuffledModelData.slice(0, 10).map((model) => (
            <div key={model._id} className='w-full sm:w-1/2 lg:w-[18%] px-2 my-2'>
              <NavLink to={`/modelcard/${model._id}`} className="block">
                <img src={model.images[0]} className='w-full h-40 rounded-t-xl object-fill' alt="Product" />
                <div className="p-4 bg-white rounded-b-xl">
                  <p className="text-md font-semibold">
                    {model.name.length > 20 ? `${model.name.substring(0, 20)}...` : model.name}
                  </p>
                  <p className="text-gray-600 mt-2 text-md flex items-center"><CurrencyRupeeIcon />{model.price}</p>
                </div>
              </NavLink>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center">
          <NavLink to="/allmodels" className="text-black underline font-bold text-lg pb-5">View All</NavLink>
        </div>
      </div>


      <Footer />
    </div>
  );
}

export default Home;
