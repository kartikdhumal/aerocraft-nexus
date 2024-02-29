import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HomeNavbar from './HomeNavbar';
import DeleteIcon from '@mui/icons-material/Delete';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { NavLink, useNavigate } from 'react-router-dom';
import fetchCartItemCount from './HomeNavbar'

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [modelDetails, setModelDetails] = useState({});
  const sessionCart = JSON.parse(sessionStorage.getItem('sessionCart')) || [];
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const userId = sessionStorage.getItem('userid');
      const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/getcart/${userId}`);
      setCartItems(response.data.cartItems);
      fetchModelDetails(response.data.cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const fetchModelDetails = async (cartItems) => {
    try {
      const models = {};
      for (const item of cartItems) {
        const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/getmodel/${item.modelId}`);
        models[item.modelId] = response.data.model;
      }
      setModelDetails(models);
    } catch (error) {
      console.error('Error fetching model details:', error);
    }
  };

  const updateCartItemQuantity = async (cartId, newQuantity) => {
    try {
      await axios.put(`https://aerocraftnexusserver.vercel.app/api/updateCartItemQuantity`, {
        cartId: cartId,
        quantity: newQuantity
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      alert('Error updating quantity');
    }
  };

  const handleDecrease = async (itemId, currentQuantity) => {
    try {
      if (currentQuantity > 1) {
        await updateCartItemQuantity(itemId, currentQuantity - 1);
        fetchCartItems();
      } else {
        console.log('Quantity cannot be decreased further or item not found');
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      alert('Error decreasing quantity');
    }
  };

  const handleIncrease = async (itemId, currentQuantity) => {
    try {
      if (currentQuantity === 10) {
        alert('You can buy upto maximum 10 items');
      }
      else {
        await updateCartItemQuantity(itemId, currentQuantity + 1);
        fetchCartItems();
      }
    } catch (error) {
      console.error('Error increasing quantity:', error);
      alert('Error increasing quantity');
    }
  };

  const handleDeleteCartItem = async (cartId) => {
    try {
      await axios.delete(`https://aerocraftnexusserver.vercel.app/api/deletecart/${cartId}`);
      fetchCartItems();
    } catch (error) {
      console.error('Error deleting cart item:', error);
      alert('Error Deleting Model');
    }
  };

  const handleDecreaseCart = (modelId, currentQuantity) => {
    const updatedCart = sessionCart.map(item => {
      if (item.modelId === modelId) {
        return { ...item, quantity: Math.max(1, currentQuantity - 1) };
      }
      return item;
    });
    sessionStorage.setItem('sessionCart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  const handleIncreaseCart = (modelId, currentQuantity) => {
    const updatedCart = sessionCart.map(item => {
      if (item.modelId === modelId) {
        return { ...item, quantity: Math.min(10, currentQuantity + 1) };
      }
      return item;
    });
    sessionStorage.setItem('sessionCart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  const calculateTotalCart = (item) => {
    const totalPrice = item.quantity * item.price;
    return totalPrice ? totalPrice.toFixed(2) : 0;
  };

  const findGrandTotal = () => {
    let grandTotal = 0;
    sessionCart.forEach(item => {
      grandTotal += parseFloat(calculateTotalCart(item));
    });
    return grandTotal.toFixed(2);
  };

  const handleDeleteSessionCart = (modelId) => {
    const updatedCart = sessionCart.filter(item => item.modelId !== modelId);
    sessionStorage.setItem('sessionCart', JSON.stringify(updatedCart));
    setCartItems(sessionCart.filter(item => item.modelId != modelId));
  };


  const calculateTotalPrice = (item) => {
    const totalPrice = item.quantity * modelDetails[item.modelId]?.price;
    return totalPrice ? totalPrice.toFixed(2) : 0;
  };

  const handleCheckoutSession = () => {
    alert('You have to login to buy product');
  }

  const handleCheckout = () => {
    navigate('/checkout');
  }

  const calculateFinalTotal = () => {
    let finalTotal = 0;
    cartItems.forEach(item => {
      finalTotal += parseFloat(calculateTotalPrice(item));
    });
    return finalTotal.toFixed(2);
  };

  return (
    <div className="bg-sky-100 min-h-screen">
      <HomeNavbar />
      <div className="flex justify-center items-center flex-col mx-auto py-8">
        <h1 className="text-2xl text-center mb-8 font-bold">Your Cart</h1>

        {
          !sessionStorage.userid ? <>
            {
              sessionCart.length === 0 ? (
                <div className="flex flex-row justify-center items-center h-64 shadow-xl">
                  <div className="bg-gray-100 w-96 h-64 rounded-2xl flex justify-center items-center">
                    <p className="text-2xl text-black rounded-2xl font-bold">Your cart is empty</p>
                  </div>
                </div>
              ) : (
                <div className="w-full lg:w-3/4 xl:w-2/3 px-5 py-5 space-y-5 rounded-lg flex flex-col m-4">
                  {sessionCart.map((item) => (
                    <div className='flex flex-col '>
                      <div className="flex lg:flex-col flex-wrap items-center mb-4 bg-gray-100 shadow-md  px-5 py-5 rounded-lg lg:space-x-4">
                        <div key={item.modelId} className='flex flex-row lg:justify-between w-full'>
                          <div className="flex-shrink-0 lg:w-24 sm:w-20">
                            {item.modelId && (
                              <img src={item.image} alt={item.image} className="w-full h-24 object-fill" />
                            )}
                          </div>
                          <div className='w-96 sm:w-full md:w-full flex justify-center  items-center lg:flex-col sm:flex-col'>
                            {item.modelId && (
                              <>
                                <p className="lg:text-lg font-bold mb-1 p-1 sm:text-sm">{item.name}</p>
                                <p className="lg:text-lg font-bold sm:text-sm"><CurrencyRupeeIcon />{item.price}</p>
                              </>
                            )}
                          </div>
                          <div className="lg:flex sm:hidden items-center mt-2 lg:w-3/5">
                            <button onClick={() => handleDecreaseCart(item.modelId, item.quantity)} className="lg:px-4 lg:py-2 sm:px-1 sm:py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg lg:mr-2 sm:mr-0">-</button>
                            <span className="px-4 py-2 font-semibold text-xl text-blue-700">{item.quantity}</span>
                            <button onClick={() => handleIncreaseCart(item.modelId, item.quantity)} className="lg:px-4 lg:py-2 sm:px-1 sm:py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg lg:ml-2 sm:mr-0">+</button>
                          </div>
                          <div className="flex items-center">
                            <p className="lg:text-lg lg:flex sm:hidden sm:text-sm text-green-700 font-bold"><CurrencyRupeeIcon />{calculateTotalCart(item)}</p>
                            <button onClick={() => handleDeleteSessionCart(item.modelId)}>
                              <DeleteIcon className="text-red-600 lg:text-3xl mx-5 sm:text-sm" />
                            </button>
                          </div>
                        </div>
                        <div className=' w-full lg:hidden sm:flex flex justify-between items-center'>
                          <div className="items-center mt-2 lg:hidden sm:flex">
                            <button onClick={() => handleDecreaseCart(item.modelId, item.quantity)} className="lg:px-4 lg:py-2 sm:px-2 sm:py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg lg:mr-2 sm:mr-2">-</button>
                            <span className="px-4 py-2 font-semibold text-xl text-blue-700">{item.quantity}</span>
                            <button onClick={() => handleIncreaseCart(item.modelId, item.quantity)} className="lg:px-4 lg:py-2 sm:px-2 sm:py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg lg:ml-2 sm:mr-2">+</button>
                          </div>
                          <p className="lg:text-lg flex sm:text-sm text-green-700 font-bold"><CurrencyRupeeIcon />{calculateTotalCart(item)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </> : <>
            {
              cartItems.length === 0 ? (
                <div className="flex flex-row justify-center items-center h-64 shadow-xl">
                  <div className="bg-gray-100 w-96 h-64 rounded-2xl flex justify-center items-center">
                    <p className="text-2xl text-black rounded-2xl font-bold">Your cart is empty</p>
                  </div>
                </div>
              ) : (
                <div className="w-full lg:w-3/4 xl:w-2/3 px-5 py-5 space-y-5 rounded-lg flex flex-col m-4">
                  {cartItems.map((item) => (
                    <div className='flex flex-col '>
                      <div className="flex lg:flex-col flex-wrap items-center mb-4 bg-gray-100 shadow-xl  px-5 py-5 rounded-lg lg:space-x-4">
                        <div key={item._id} className='flex flex-row lg:justify-between w-full'>
                          <div className="flex-shrink-0 lg:w-24 sm:w-20">
                            {modelDetails[item.modelId] && (
                              <img src={modelDetails[item.modelId].images[0]} alt={item.name} className="w-full h-24 object-fill" />
                            )}
                          </div>
                          <div className='w-96 sm:w-full md:w-full flex justify-center  items-center lg:flex-col sm:flex-col'>
                            {modelDetails[item.modelId] && (
                              <>
                                <p className="lg:text-lg font-bold mb-1 p-1 sm:text-sm">{modelDetails[item.modelId].name}</p>
                                <p className="lg:text-lg font-bold sm:text-sm"><CurrencyRupeeIcon />{modelDetails[item.modelId].price}</p>
                              </>
                            )}
                          </div>
                          <div className="lg:flex sm:hidden items-center mt-2 lg:w-3/5">
                            <button onClick={() => handleDecrease(item._id, item.quantity)} className="lg:px-4 lg:py-2 sm:px-1 sm:py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg lg:mr-2 sm:mr-0">-</button>
                            <span className="px-4 py-2 font-semibold text-xl text-blue-700">{item.quantity}</span>
                            <button onClick={() => handleIncrease(item._id, item.quantity)} className="lg:px-4 lg:py-2 sm:px-1 sm:py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg lg:ml-2 sm:mr-0">+</button>
                          </div>
                          <div className="flex items-center">
                            <p className="lg:text-lg lg:flex sm:hidden sm:text-sm text-green-700 font-bold"><CurrencyRupeeIcon />{calculateTotalPrice(item)}</p>
                            <button onClick={() => handleDeleteCartItem(item._id)}>
                              <DeleteIcon className="text-red-600 lg:text-3xl mx-5 sm:text-sm" />
                            </button>
                          </div>
                        </div>
                        <div className=' w-full lg:hidden sm:flex flex justify-between items-center'>
                          <div className="items-center mt-2 lg:hidden sm:flex">
                            <button onClick={() => handleDecrease(item._id, item.quantity)} className="lg:px-4 lg:py-2 sm:px-2 sm:py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg lg:mr-2 sm:mr-2">-</button>
                            <span className="px-4 py-2 font-semibold text-xl text-blue-700">{item.quantity}</span>
                            <button onClick={() => handleIncrease(item._id, item.quantity)} className="lg:px-4 lg:py-2 sm:px-2 sm:py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg lg:ml-2 sm:mr-2">+</button>
                          </div>
                          <p className="lg:text-lg flex sm:text-sm text-green-700 font-bold"><CurrencyRupeeIcon />{calculateTotalPrice(item)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </>
        }

        {
          sessionStorage.userid ? <>
            {cartItems.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-2xl font-bold text-blue-700 mb-2 md:mb-0">Final Total: <CurrencyRupeeIcon />{calculateFinalTotal()}</p>
                <NavLink to={'/checkout'} onClick={handleCheckout}>
                  <button className="bg-blue-700 text-white px-4 py-2 rounded-md mt-4">Checkout</button>
                </NavLink>
              </div>
            )}
          </> : <>
            {sessionCart.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-2xl font-bold text-blue-700 mb-2 md:mb-0">Final Total: <CurrencyRupeeIcon />{findGrandTotal()}</p>
                <button onClick={handleCheckoutSession} className="bg-blue-700 text-white px-4 py-2 rounded-md mt-4">Checkout</button>
              </div>
            )}
          </>
        }


      </div>
    </div>
  );
}

export default Cart;
