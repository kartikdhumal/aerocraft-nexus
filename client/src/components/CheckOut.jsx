import React, { useEffect, useState } from 'react';
import HomeNavbar from './HomeNavbar';
import { useNavigate } from 'react-router-dom';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';


function CheckOut() {
  const [cartItems, setCartItems] = useState([]);
  const [modelDetails, setModelDetails] = useState({});
  const [addedAdd, setAddedAdd] = useState(false);
  const [hidefrom, setHideFrom] = useState(true);
  const [addressForm, setAddressForm] = useState({
    state: '',
    city: '',
    area: '',
    street: '',
    pincode: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [confirmOrder, setConfirmOrder] = useState(false);
  const navigate = useNavigate();
  const fullAddress = addressForm.street + ', ' + addressForm.area + ', ' + addressForm.city + ', ' + addressForm.state + ', ' + addressForm.pincode;

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

  const calculateFinalTotal = () => {
    let finalTotal = 0;
    cartItems.forEach(item => {
      finalTotal += parseFloat(calculateTotalPrice(item));
    });
    return finalTotal.toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const setAddress = async (e) => {
    e.preventDefault();

    if (
      !addressForm.state ||
      !addressForm.city ||
      !addressForm.area ||
      !addressForm.street ||
      !addressForm.pincode ||
      addressForm.pincode.length !== 6 ||
      !/^[a-zA-Z]+$/.test(addressForm.state) ||
      !/^[a-zA-Z]+$/.test(addressForm.city)
    ) {
      alert('Please fill out all fields correctly.');
      return;
    }
    else {
      setAddedAdd(true);
      setHideFrom(false);
    }
  }

  const fetchAddress = async () => {
    setHideFrom(true);
    setAddressForm({
      ...addressForm,
      state: addressForm.state,
      city: addressForm.city,
      area: addressForm.area,
      street: addressForm.street,
      pincode: addressForm.pincode
    });
    setAddedAdd(false);
  }

  const calculateTotalPrice = (item) => {
    const totalPrice = item.quantity * modelDetails[item.modelId]?.price;
    return totalPrice ? totalPrice.toFixed(2) : 0;
  };

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (selectedPaymentMethod !== 'CashOnDelivery') {
      const totalAmount = parseFloat(calculateFinalTotal());
      const options = {
        accept_partial: true,
        key:'rzp_test_pVipjgKFxJV8AT',
        amount: totalAmount * 100,
        amount_paid: 0,
        cancelled_at: 1591097270,
        created_at: 1591097057,
        currency: "INR",
        customer: {
          contact: "+919000090000",
          email: sessionStorage.email,
          name: sessionStorage.name
        },
        description: "Payment for models",
        expire_by: 1691097057,
        expired_at: 0,
        first_min_partial_amount: 100,
        id: "rzp_test_pVipjgKFxJV8AT",
        notes: {
          "policy_name": "Jeevan Bima"
        },
        notify: {
          email: true,
          sms: true
        },
        theme: {
          color : "#ebf8ff"
        },
        payments: [],
        reference_id: "TS1989",
        handler:async(response) => {
          try {
            const userId = sessionStorage.getItem('userid');
            const totalAmount = parseInt(calculateFinalTotal());
            const result = await axios.post('https://aerocraftnexusserver.vercel.app/api/addorder', {
              userId,
              totalAmount,
              response,
              delAddress: fullAddress,
              paymentType: selectedPaymentMethod === 'CashOnDelivery' ? 'cod' : 'online',
              status: 'pending',
              items: cartItems.map(item => ({
                modelId: item.modelId,
                price: modelDetails[item.modelId]?.price,
                quantity: item.quantity
              }))
            });
            
            alert(result.data.message);
            console.log(cartItems);
            navigate('/yourorders');
          } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place the order. Please try again later.');
          }
        },
        reminder_enable: true,
        reminders: {
          "status": "failed"
        },
        short_url: "https://rzp.io/i/nxrHnLJ",
        status: "pending",
        updated_at: 1591097270,
        user_id: sessionStorage.userid
      };
     
      var rzp1 = new window.Razorpay(options);
      rzp1.open();
    }
    else{
      try {
        const userId = sessionStorage.getItem('userid');
        const totalAmount = parseInt(calculateFinalTotal());
        const response = await axios.post('https://aerocraftnexusserver.vercel.app/api/addorder', {
          userId,
          totalAmount,
          delAddress: fullAddress,
          paymentType: selectedPaymentMethod === 'CashOnDelivery' ? 'cod' : 'online',
          status: 'pending',
          items: cartItems.map(item => ({
            modelId: item.modelId,
            price: modelDetails[item.modelId]?.price,
            quantity: item.quantity
          }))
        });
        
        alert(response.data.message);
        console.log(cartItems);
        navigate('/yourorders');
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place the order. Please try again later.');
      }
    }
  };

  return (
    <div className='bg-sky-100 lg:h-screen sm:h-full'>
      <HomeNavbar />
      <div className=' flex lg:flex-row sm:flex-col '>
        <div className=' w-full p-5'>
          {cartItems.map((item) => (
            <div className='flex flex-col ' key={item._id}>
              <div className="flex lg:flex-col flex-wrap items-center mb-4 bg-gray-100 shadow-sm  px-5 py-5 rounded-lg lg:space-x-4">
                <div className='flex flex-row lg:justify-between w-full'>
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
                        <p className='lg:text-lg font-bold sm:text-sm'> {'Quantity : ' + item.quantity} </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    <p className="lg:text-lg lg:flex sm:hidden sm:text-sm text-green-700 font-bold"><CurrencyRupeeIcon />{calculateTotalPrice(item)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p className="text-2xl w-full text-right font-bold text-blue-700 mb-2 md:mb-0">Total: <CurrencyRupeeIcon />{calculateFinalTotal()}</p>
        </div>
        <div className='flex flex-col w-full'>
          <div className={` w-full p-10 ${hidefrom ? 'block' : 'hidden'}`}>
            <h2 className="text-xl mb-4">Enter Delivery Address </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={addressForm.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={addressForm.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={addressForm.area}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={addressForm.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={addressForm.pincode}
                  onChange={handleInputChange}
                  pattern="\d{6}"
                  maxLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                onClick={setAddress}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              >
                Add Delivery Address
              </button>
            </form>
          </div>

          {addedAdd && (
            <div className='w-full p-5'>
              <div className=' bg-gray-100  px-2 py-4 rounded-xl overflow-auto'>
                <span className='font-bold text-lg'>Delivery Address : </span>
                <span className='text-lg'>
                  {fullAddress}
                </span>
                <span className='border-2 w-full border-black my-1 mx-2 bg-blue-700 px-2 py-0 shadow-xl rounded-xl text-center text-white text-md cursor-pointer' onClick={fetchAddress}> Edit </span>
              </div>
              <div className='flex justify-center flex-col p-5 mt-3'>
                <p className='font-bold text-lg'> Select Payment Method</p> 
                <div>
                <span className="text-lg text-right font-bold text-blue-700">Pay: <CurrencyRupeeIcon />{calculateFinalTotal()}</span>
                  <div className="flex items-center my-4 ps-4 border border-gray-200 rounded-xl bg-gray-100 dark:border-gray-700">
                    <input
                      checked={selectedPaymentMethod === 'CashOnDelivery'}
                      onChange={() => setSelectedPaymentMethod('CashOnDelivery')}
                      id="bordered-radio-1"
                      type="radio"
                      value=""
                      name="bordered-radio"
                      className="w-4 h-4 text-blue-700  border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="bordered-radio-1" className="w-full py-4 ms-2 text-md text-black  font-bold">Cash On Delivery</label>
                  </div>
                  <div className="flex items-center  my-4 ps-4 border border-gray-200 rounded-xl bg-gray-100 dark:border-gray-700">
                    <input
                      checked={selectedPaymentMethod === 'OnlinePayment'}
                      onChange={() => setSelectedPaymentMethod('OnlinePayment')}
                      id="bordered-radio-2"
                      type="radio"
                      value=""
                      name="bordered-radio"
                      className="w-4 h-4 text-blue-700 bg-[#1c92d2] border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="bordered-radio-2" className="w-full py-4 ms-2 text-md font-bold text-black ">Online Payment</label>
                  </div>

                  <div>
                    {selectedPaymentMethod === 'CashOnDelivery' ? (
                      <button
                        onClick={handlePlaceOrder}
                        className="w-full flex justify-center text-md items-center py-2 px-4 gap-x-2 font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                      >
                        Place Order
                      </button>
                    ) : (
                      <button
                        onClick={handlePlaceOrder}
                        className="w-full flex justify-center text-md items-center py-2 px-4 gap-x-2 font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                      >
                        Make Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckOut;
