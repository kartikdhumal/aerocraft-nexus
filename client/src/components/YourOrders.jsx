import React, { useEffect, useState } from 'react';
import HomeNavbar from './HomeNavbar';
import axios from 'axios';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ReceiptIcon from '@mui/icons-material/Receipt';
import jsPDF from 'jspdf';
import nologo from '../images/nologo.png';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

function YourOrders() {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [returnPromptVisible, setReturnPromptVisible] = useState(false);
  const [showReturnOptions, setShowReturnOptions] = useState(false);
  const [orderReturn, setOrderReturnData] = useState([]);
  const [orderReturnDetail, setOrderReturnDetails] = useState([]);
  const [tab, setTab] = useState('orders');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchModels();
    fetchOrderReturn();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:2000/api/orders/${sessionStorage.userid}`);
      setOrders(response.data.orders.filter(order => order.status !== 'returned'));
      setOrderDetails(response.data.orderDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOrderReturn = async () => {
    try {
      const response = await axios.get(`http://localhost:2000/api/getreturnorders`);
      setOrderReturnData(response.data.orderReturn);
      setOrderReturnDetails(response.data.orderReturnDetails);
    } catch (error) {
      console.error('Error fetching order return:', error);
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

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const generateInvoice = async (order) => {
    const doc = new jsPDF();
    doc.addImage(nologo, 'PNG', 10, 10, 40, 40);
    doc.setFontSize(12);
    doc.text('Invoice', 100, 20);
    doc.text(`Date: ${getTimeAgo(order.date)}`, 140, 20);
    let yPos = 70;

    try {
      const userResponse = await axios.get(`http://localhost:2000/api/getuserbyid/${order.userId}`);
      const user = userResponse.data.user;
      doc.text(`Bill to: ${user.name}`, 15, 60);

      const tableHeaders = ['Model Name', 'Quantity', 'Price'];
      const tableData = orderDetails
        .filter((orderDetail) => orderDetail.orderId === order._id)
        .map((orderDetail) => {
          const model = modelData.find((model) => model._id === orderDetail.modelId);
          if (model) {
            return [model.name, orderDetail.quantity, model.price];
          } else {
            return ['Product not found', '', ''];
          }
        });

      doc.autoTable({
        startY: yPos,
        head: [tableHeaders],
        body: tableData,
      });

      yPos = doc.autoTable.previous.finalY + 10;
      doc.text(`Total Amount: ${order.totalAmount}`, 140, yPos + 10);
      doc.save(`Invoice_${order._id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error in generating invoice.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const isConfirmed = window.confirm('Are you sure you want to cancel this order?');

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:2000/api/deleteorder/${orderId}`);
      if (response.status === 200) {
        alert('Order cancelled successfully!');
        fetchOrders();
        fetchModels();
      } else {
        alert('Failed to cancel the order. Please try again later.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('An error occurred while cancelling the order. Please try again later.');
    }
  };


  const handleReturnOrder = () => {
    setShowReturnOptions(true);
  };

  const handleReturnItems = () => {
    if (selectedItems.length === 0) {
      alert('Please select items to return.');
      return;
    }
    setReturnPromptVisible(true);
  };

  const handleReturnConfirmation = async () => {
    if (!returnReason) {
      alert('Please provide a reason for returning items.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:2000/api/returnorder', {
        userId: sessionStorage.userid,
        orderId: selectedItems[0].orderId,
        totalAmount: selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0),
        modelsInfo: selectedItems.map(item => ({ modelId: item.modelId, quantity: item.quantity })),
        reason: returnReason
      });
      alert(response.data.message);
      navigate('/yourorders');
      setReturnReason('');
      setSelectedItems([]);
      setReturnPromptVisible(false);
      setShowReturnOptions(false);
      fetchOrders();
      fetchOrderReturn();
      fetchModels();

    } catch (error) {
      console.error('Error returning items:', error);
      alert('Failed to return items. Please try again later.');
    }
  };

  const handleProductSelection = (orderDetail) => {
    const isSelected = selectedItems.some(item => item._id === orderDetail._id);

    if (isSelected) {
      setSelectedItems(prevItems => prevItems.filter(item => item._id !== orderDetail._id));
    } else {
      setSelectedItems(prevItems => [...prevItems, orderDetail]);
    }
  };

  return (
    <div className='bg-sky-100 min-h-screen'>
      <HomeNavbar />
      <h4 className="text-2xl py-3 font-bold mb-2 text-center">Your Orders </h4>
      <div className="flex justify-center">
        <div className="w-full max-w-screen-lg flex border-2 border-black justify-between">
          <div
            className={`cursor-pointer text-center w-1/2 py-3 ${tab === 'orders' ? 'bg-blue-400' : 'bg-sky-100'
              }`}
            onClick={() => setTab('orders')}
          >
            Your Orders
          </div>
          <div
            className={`cursor-pointer text-center w-1/2 py-3 ${tab === 'returns' ? 'bg-blue-400' : 'bg-sky-100'
              }`}
            onClick={() => setTab('returns')}
          >
            Your Returned Orders
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <div className="w-full max-w-screen-lg">
          {tab === 'orders' && (
            <section className="flex lg:w-full flex-col space-y-4  lg:px-0 sm:px-6 justify-center bg-gradient-to-br from rgba(205, 156, 242, 1) to-pink-500">
              {
                !orders.length == 0 ? (
                   loading ? (
                    <div className="card rounded-lg px-10 py-10 flex justify-center bg-gray-200 text-gray-700 text-xl items-center font-bold border-2 border-black">
                      Loading...
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order._id} className="card rounded-lg border-2 border-black">
                        <div className="card rounded-lg border-2 black">
                          <div className="card-body p-4">
                            <div className="flex justify-between items-center mb-4">
                              <p className="lg:text-lg sm:text-md font-bold text-gray-500 mb-0">{'Order Date : ' + getTimeAgo(order.date)}</p>
                              <div className='cursor-pointer' onClick={() => generateInvoice(order)}>
                                <ReceiptIcon className='text-blue-700 ' />
                                <span className='px-2 text-gray-500 font-bold'>Invoice</span>
                              </div>
                            </div>
                            <div className="card">
                              <div className="card-body space-y-4 ">
                                {orderDetails.map(orderDetail => {
                                  if (orderDetail.orderId === order._id) {
                                    const model = modelData.find(model => model._id === orderDetail.modelId);
                                    if (model) {
                                      return (
                                        <div key={orderDetail._id} className="flex p-3 bg-gray-100 border border-black rounded-xl items-center justify-evenly">
                                          {showReturnOptions && (
                                            order.status == 'delivered' ? <>
                                              <input
                                                type='checkbox'
                                                onChange={() => handleProductSelection(orderDetail)}
                                                checked={selectedItems.some(item => item._id === orderDetail._id)}
                                              />
                                            </> : <></>
                                          )}
                                          <div className="w-1/6">
                                            <img src={model.images[0]} className="w-full h-auto" alt={model.name} />
                                          </div>
                                          <div className="w-1/6 text-center">
                                            <p className="text-gray-500 mb-0 lg:text-lg sm:text-sm">{model.name}</p>
                                          </div>
                                          <div className="w-1/6 text-center">
                                            <p className="text-gray-500 mb-0 lg:text-lg sm:text-sm">{'Qty : ' + orderDetail.quantity}</p>
                                          </div>
                                          <div className="w-1/6 text-center">
                                            <p className="text-gray-500 mb-0 lg:text-lg sm:text-sm"><CurrencyRupeeIcon />{model.price * orderDetail.quantity}</p>
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div key={orderDetail._id} className="flex p-3 border-2 border-gray-600 items-center justify-evenly">
                                          <p className="text-red-500">The product may have been deleted by the user</p>
                                        </div>
                                      );
                                    }
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="rounded-b-lg flex justify-between space-y-4 items-center px-3">
                            <div className="status flex space-x-2">
                              {order.status === 'pending' && (
                                <>
                                  <button className={`lg:w-auto sm:w-auto flex items-center  cursor-pointer text-white bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 rounded-lg lg:text-md sm:text-sm px-4 py-2 font-bold text-center ml-2`}>
                                    {order.status}
                                  </button>
                                  <button onClick={() => handleCancelOrder(order._id)} className={`lg:w-auto sm:w-auto flex items-center  cursor-pointer text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 rounded-lg lg:text-md sm:text-sm px-4 py-2 font-bold text-center ml-2`}>
                                    Cancel Order
                                  </button>
                                </>
                              )}
                              {order.status === 'delivered' && (
                                <>
                                  <button className={`lg:w-auto sm:w-auto flex items-center  cursor-pointer text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 rounded-lg lg:text-md sm:text-sm  px-4 py-2 font-bold text-center ml-2`}>
                                    {order.status}
                                  </button>
                                  {showReturnOptions ? (
                                    <button onClick={handleReturnItems} className={`lg:w-auto sm:w-auto flex items-center  cursor-pointer text-white bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-sky-300 dark:focus:ring-sky-800 rounded-lg lg:text-md sm:text-sm px-4 py-2 font-bold text-center ml-2`}>
                                      Return Items
                                    </button>
                                  ) : (
                                    <button onClick={handleReturnOrder} className={`lg:w-auto sm:w-auto flex items-center  cursor-pointer text-white bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-sky-300 dark:focus:ring-sky-800 rounded-lg lg:text-md sm:text-sm px-4 py-2 font-bold text-center ml-2`}>
                                      Return Order
                                    </button>
                                  )}
                                </>
                              )}
                              {order.status === 'cancelled' && (
                                <button className={`lg:w-auto sm:w-full flex items-center  cursor-pointer text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2`}>
                                  {order.status}
                                </button>
                              )}
                              {order.status === 'returned' && (
                                <button className={`lg:w-auto sm:w-full flex items-center  cursor-pointer text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2`}>
                                  Returned
                                </button>
                              )}
                            </div>
                            <h5 className="lg:text-lg sm:text-md font-bold text-blue-500 mb-0 text-right px-2 pb-2"><CurrencyRupeeIcon />{order.totalAmount} ({order.paymentType})</h5>
                          </div>
                        </div>
                      </div>
                    )
                    )
                  )
                ) : (
                  <div className="card w-full h-28 rounded-lg px-10 py-10 flex justify-center bg-sky-100 text-black text-xl items-center font-bold border-2 border-black">
                  No Orders Found
                </div>
                )
              }
            </section>
          )}

          {tab === 'returns' && (
            <section className="flex lg:w-full flex-col space-y-4 lg:px-0 sm:px-6 justify-center bg-gradient-to-br from rgba(205, 156, 242, 1) to-pink-500">
              {
                !orderReturn.length == 0 ? <>
                  {
                    !loading ? <>
                      {
                        orderReturn.map(orderReturn => (
                          <div key={orderReturn._id} className="card rounded-lg border-2 border-black">
                            <div key={orderReturn._id} className="card rounded-lg border-2 black">
                              <div className="card-body p-4">
                                <div className="flex justify-between items-center mb-4">
                                  <p className="lg:text-lg sm:text-md font-bold text-gray-500 mb-0">{'Order Return Date : ' + getTimeAgo(orderReturn.date)}</p>
                                </div>
                                <div className="card">
                                  <div className="card-body space-y-4 ">
                                    {orderReturnDetail.map(orderReturnDetail => {
                                      if (orderReturnDetail.orderReturnId === orderReturn._id) {
                                        const model = modelData.find(model => model._id === orderReturnDetail.modelId);
                                        if (model) {
                                          return (
                                            <div key={orderReturnDetail._id} className="flex p-3 bg-gray-100 border border-black rounded-xl items-center justify-evenly">
                                              <div className="w-1/6">
                                                <img src={model.images[0]} className="w-full h-auto" alt={model.name} />
                                              </div>
                                              <div className="w-1/6 text-center">
                                                <p className="text-gray-500 mb-0 lg:text-lg sm:text-sm">{model.name}</p>
                                              </div>
                                              <div className="w-1/6 text-center">
                                                <p className="text-gray-500 mb-0 lg:text-lg sm:text-sm">{'Qty : ' + orderReturnDetail.quantity}</p>
                                              </div>
                                              <div className="w-1/6 text-center">
                                                <p className="text-gray-500 mb-0 lg:text-lg sm:text-sm"><CurrencyRupeeIcon />{model.price * orderReturnDetail.quantity}</p>
                                              </div>
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <div key={orderReturnDetail._id} className="flex p-3 border-2 border-gray-600 items-center justify-evenly">
                                              <p className="text-red-500">The product may have been deleted by the user</p>
                                            </div>
                                          );
                                        }
                                      }
                                      return null;
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-b-lg flex justify-between space-y-4 items-center px-3">
                                <div className="status flex space-x-2">
                                  <button className={`lg:w-auto sm:w-full flex items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2`}>
                                    Returned
                                  </button>
                                </div>
                                <h5 className="lg:text-lg sm:text-md font-bold text-blue-500 mb-0 text-right px-2 pb-2"><CurrencyRupeeIcon />{orderReturn.totalAmount}</h5>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </> : ''
                  }
                </> : <>
                  <div className="card w-full h-28 rounded-lg px-10 py-10 flex justify-center bg-sky-100 text-black text-xl items-center font-bold border-2 border-black">
                    No Orders Found
                  </div>
                </>
              }
            </section>
          )}
        </div>
      </div>
      {returnPromptVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-sky-100 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-center">Return Items Reason</h2>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Please provide a reason for returning the items..."
              className="lg:w-96 sm:w-full h-40 rounded-xl resize-none border border-gray-300 p-2 mb-4"
            ></textarea>
            <div className="flex justify-end">
              <button onClick={() => setReturnPromptVisible(false)} className="lg:w-full sm:w-auto cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 rounded-lg text-md px-4 py-2 font-bold text-center mx-2">Cancel</button>
              <button onClick={handleReturnConfirmation} className="lg:w-full sm:w-auto cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-sky-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center mx-2">Confirm Return</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default YourOrders;
