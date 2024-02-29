import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function Admin() {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsersData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [bestSellingModel, setBestSellingModel] = useState({});
  const [mostReviewedProduct, setMostReviewedProduct] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);

  useEffect(() => {
    fetchOrders();
    fetchModels();
    fetchReviews();
    fetchUsers();
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      calculateTotalRevenue();
      filterAverageTotalValue();
    }
  }, [orders]);

  const filterAverageTotalValue = () => {
    if (orders.length > 0) {
      const totalSum = orders.reduce((acc, order) => acc + parseFloat(order.totalAmount), 0);
      const averageValue = totalSum / orders.length;
      setAverageOrderValue(averageValue.toFixed(2));
    }
  };



  const fetchOrders = async () => {
    try {
      const ordersResponse = await axios.get('http://localhost:2000/api/getorders');
      setOrders(ordersResponse.data.orders);
      setOrderDetails(ordersResponse.data.orderDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/models');
      setModelData(response.data.models);
    } catch (error) {
      console.error('There was a problem with fetching models:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/users');
      setUsersData(response.data.users.filter(user => user.role !== "admin"));
    } catch (error) {
      console.error('There was a problem with fetching users:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/subcategories');
      setSubcategoryData(response.data.subcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/reviews');
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('There was a problem with fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (orders.length > 0 && orderDetails.length > 0 && modelData.length > 0 && reviews.length > 0) {
      setBestSellingModel(findBestSellingModel());
      setMostReviewedProduct(findMostReviewedProduct());
    }
  }, [orders, orderDetails, modelData, reviews]);

  const findBestSellingModel = () => {
    const modelQuantities = {};
    orderDetails.forEach(detail => {
      const { modelId, quantity } = detail;
      modelQuantities[modelId] = (modelQuantities[modelId] || 0) + quantity;
    });

    const bestSellingModelId = Object.keys(modelQuantities).reduce((a, b) => modelQuantities[a] > modelQuantities[b] ? a : b);
    return modelData.find(model => model._id == bestSellingModelId) || {};
  };

  const findMostReviewedProduct = () => {
    const modelReviews = {};
    reviews.forEach(review => {
      const { modelId } = review;
      modelReviews[modelId] = (modelReviews[modelId] || 0) + 1;
    });

    const mostReviewedModelId = Object.keys(modelReviews).reduce((a, b) => modelReviews[a] > modelReviews[b] ? a : b);
    return modelData.find(model => model._id == mostReviewedModelId) || {};
  };

  const getCategorySubcategory = (subcategoryId) => {
    const subcategory = subcategoryData.find(sub => sub._id == subcategoryId);
    if (subcategory) {
      const category = categories.find(cat => cat.id == subcategory.categoryId);
      if (category) {
        return `${category.name} - ${subcategory.name}`;
      }
    }
    return '-';
  };

  const calculateTotalRevenue = () => {
    const total = orders.reduce((acc, order) => acc + parseFloat(order.totalAmount), 0);
    setTotalRevenue(total);
  };


  return (
    <div className='w-full bg-sky-100 lg:h-screen sm:h-100'>
      <AdminNavbar />
      <div className="flex flex-wrap justify-center gap-8 p-12">
        <div className="flex flex-col items-center justify-center bg-white shadow-2xl rounded-2xl lg:p-12 sm:p-0  w-44 sm:w-full h-60 md:w-96">
          <ListAltIcon />
          <p className="text-[22px] font-bold">Total Orders</p>
          <p className="text-lg text-blue-700 font-bold">{orders.length}</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-white shadow-2xl rounded-2xl lg:p-12 sm:p-0  w-44 sm:w-full h-60 md:w-96">
          <SavingsIcon />
          <p className="text-[22px] font-bold">Total Revenue</p>
          {totalRevenue !== 0 && (
            <p className="text-lg text-blue-700 font-bold">
              <CurrencyRupeeIcon />
              {totalRevenue}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center bg-white shadow-2xl rounded-2xl lg:p-12 sm:p-0 w-44 sm:w-full h-60 md:w-96">
          <ListAltIcon />
          <p className="text-[22px] font-bold">  Average Order Value </p>
          <p className="text-lg text-blue-700 font-bold">
            <CurrencyRupeeIcon />
            {averageOrderValue}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center bg-white shadow-2xl rounded-2xl lg:p-12 sm:p-0 w-44 sm:w-full h-60 md:w-96">
          <AccountCircleIcon />
          <p className="text-[22px] font-bold">Total Users</p>
          <p className="text-lg text-blue-700 font-bold">{users.length}</p>
        </div>

        <div className="flex lg:space-x-8 lg:space-y-0 sm:space-y-5 lg:flex-row sm:flex-col">

          <div className="flex flex-col items-center justify-center bg-white shadow-2xl rounded-2xl lg:p-12 sm:p-0  w-44 sm:w-full h-60 md:w-96">
            <ShoppingCartIcon />
            <p className="text-[22px] w-full flex justify-center items-center font-bold ">Best Selling Model</p>
            <div className="flex flex-row  justify-center items-center space-x-5">
              <img src={bestSellingModel.images ? bestSellingModel.images[0] : ''} alt={bestSellingModel.name} className="w-12 h-12 mt-4 mb-2 lg:ml-0 sm:ml-5 rounded-full" />
              <p className="text-lg text-blue-700 font-bold">{bestSellingModel.name}</p>
            </div>
            <p className="text-md text-gray-600">{getCategorySubcategory(bestSellingModel.subcategoryId)}</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-white shadow-2xl rounded-2xl lg:p-12 sm:p-0  w-44 sm:w-full h-60 md:w-96">
            <ShoppingCartIcon />
            <p className="text-[22px] w-full flex justify-center items-center font-bold ">Most Reviewed Model</p>
            <div className="flex flex-row  justify-center items-center space-x-5">
              <img src={mostReviewedProduct.images ? mostReviewedProduct.images[0] : ''} alt={mostReviewedProduct.name} className="w-12 h-12 mt-4 mb-2 lg:ml-0 sm:ml-5 rounded-full" />
              <p className="text-lg text-blue-700 font-bold">{mostReviewedProduct.name}</p>
            </div>
            <p className="text-md text-gray-600">{getCategorySubcategory(mostReviewedProduct.subcategoryId)}</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Admin;
