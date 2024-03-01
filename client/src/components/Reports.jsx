import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import DatePicker from 'react-datepicker';
import nologo from '../images/nologo.png'
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import MenuIcon from '@mui/icons-material/Menu';
import { toast } from 'react-toastify';

function Reports() {
  const { id: companyId } = useParams();
  const [reportType, setReportType] = useState('');
  const [users, setUsers] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedStars, setSelectedStars] = useState(0);
  const [reportSelected, setReportSelected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleReportTypeSelect = (type) => {
    setReportType(type);
    setReportType(type);
    setReportSelected(true);
  };

  const handleGenerateSalesReport = async () => {
    if (!startDate || !endDate) {
      toast.warning('Please select start and end dates.');
      return;
    }
    const doc = new jsPDF();
    doc.addImage(nologo, 'PNG', 15, 10, 20, 20);
    doc.text('Sales Report', 90, 20);
    doc.setFontSize(12);
    let yPos = 70;

    try {
      const [userResponse, orderResponse, modelsResponse] = await Promise.all([
        axios.get(`https://aerocraftnexusserver.vercel.app/api/users`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/getorders`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/models`)
      ]);

      const users = userResponse.data.users;
      const allOrders = orderResponse.data.orders;
      const orderDetails = orderResponse.data.orderDetails;
      const orders = allOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
      });

      if (orders.length === 0) {
        doc.text('No orders in this date range', 80, yPos);
        yPos += 10;
      } else {
        const tableData = orders.map((order, index) => {
          const user = users.find(user => user.id === order.userId);
          const orderDetailsForOrder = orderDetails.filter(detail => detail.orderId === order._id);
          const productDetails = [];

          orderDetailsForOrder.forEach(detail => {
            const modelDetail = modelsResponse.data.models.find(model => model._id === detail.modelId);
            productDetails.push({
              name: modelDetail ? modelDetail.name : 'N/A',
              quantity: detail.quantity
            });
          });

          const productInfo = productDetails.map(product => `${product.name} - Qty : ${product.quantity}`).join(', ');

          return [
            index + 1,
            new Date(order.date).toLocaleDateString('en-GB'),
            user ? user.name : 'N/A',
            productInfo,
            order.totalAmount
          ];
        });

        const tableHeaders = ['No.', 'Date', 'Name', 'Products', 'Total'];
        doc.autoTable({
          startY: yPos,
          head: [tableHeaders],
          body: tableData,
          didDrawCell: (data) => {
            if (data.section === 'head') {
              doc.setFillColor(52, 73, 94);
              doc.setTextColor(255);
            } else {
              doc.setFillColor(255, 255, 255);
              doc.setTextColor(0);
            }
          }
        });

        yPos = doc.autoTable.previous.finalY + 10;
        doc.text(`Total Orders: ${orders.length}`, 140, yPos + 10);
      }

      doc.save(`SalesReport.pdf`);
      setStartDate(null);
      setEndDate(null);

    } catch (error) {
      console.error('Error generating SalesReport:', error);
      toast.error('Error in generating SalesReport.');
    }
  };


  const handleGenerateUserReport = async () => {
    const doc = new jsPDF();
    doc.addImage(nologo, 'PNG', 15, 10, 20, 20);
    doc.text('User Report', 90, 20);
    doc.setFontSize(12);
    let yPos = 70;

    try {
      const userResponse = await axios.get(`https://aerocraftnexusserver.vercel.app/api/users`);
      const users = userResponse.data.users.filter(user => user.role !== 'admin');

      const tableHeaders = ['No.', 'Name', 'Email', 'Role'];
      const tableData = users.map((user, index) => [index + 1, user.name, user.email, user.role]);

      doc.autoTable({
        startY: yPos,
        head: [tableHeaders],
        body: tableData,
        didDrawCell: (data) => {
          if (data.section === 'head') {
            doc.setFillColor(52, 73, 94);
            doc.setTextColor(255);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.setTextColor(0);
          }
        }
      });

      yPos = doc.autoTable.previous.finalY + 10;
      doc.text(`Total Users: ${users.length}`, 140, yPos + 10);
      doc.save(`UserReport.pdf`);
    } catch (error) {
      console.error('Error generating UserReport:', error);
      toast.error('Error in generating UserReport.');
    }
  };


  const handleCancelReport = async () => {
    const doc = new jsPDF();
    doc.addImage(nologo, 'PNG', 15, 10, 20, 20);
    doc.text('Cancel Order Report', 90, 20);
    doc.setFontSize(12);
    let yPos = 70;

    try {
      const [userResponse, orderResponse, modelsResponse] = await Promise.all([
        axios.get(`https://aerocraftnexusserver.vercel.app/api/users`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/getorders`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/models`)
      ]);
      const users = userResponse.data.users;
      const orders = orderResponse.data.orders.filter(order => order.status === "cancelled");
      const orderDetails = orderResponse.data.orderDetails;
      const tableData = orders.map((order, index) => {
        const user = users.find(user => user.id === order.userId);
        const orderDetailsForOrder = orderDetails.filter(detail => detail.orderId === order._id);
        const productDetails = [];

        orderDetailsForOrder.forEach(detail => {
          const modelDetail = modelsResponse.data.models.find(model => model._id === detail.modelId);
          productDetails.push({
            name: modelDetail ? modelDetail.name : 'N/A',
            quantity: detail.quantity
          });
        });
        const productInfo = productDetails.map(product => `${product.name} - ${'Qty : ' + product.quantity}`).join(', ');

        return [
          index + 1,
          new Date(order.date).toLocaleDateString('en-GB'),
          user ? user.name : 'N/A',
          productInfo,
          order.totalAmount
        ];
      });
      const tableHeaders = ['No.', 'Date', 'Name', 'Products', 'Total'];
      doc.autoTable({
        startY: yPos,
        head: [tableHeaders],
        body: tableData,
        didDrawCell: (data) => {
          if (data.section === 'head') {
            doc.setFillColor(52, 73, 94);
            doc.setTextColor(255);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.setTextColor(0);
          }
        }
      });
      yPos = doc.autoTable.previous.finalY + 10;
      doc.text(`Total Orders: ${orders.length}`, 140, yPos + 10);
      doc.save(`CancelReport.pdf`);
    } catch (error) {
      console.error('Error generating CancelReport:', error);
      toast.error('Error in generating CancelReport.');
    }
  };


  const handleParticularReviewReport = async () => {
    if (selectedStars === 0) {
      toast.warning('Please select the number of stars.'); 
      return;
    }
  
    const doc = new jsPDF();
    doc.addImage(nologo, 'PNG', 15, 10, 20, 20);
    doc.text('Review Report', 90, 20);
    doc.setFontSize(12);
    let yPos = 70;
  
    try {
      const [userResponse, modelsResponse, reviewsResponse] = await Promise.all([
        axios.get(`https://aerocraftnexusserver.vercel.app/api/users`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/models`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/reviews`)
      ]);
      const users = userResponse.data.users;
      const models = modelsResponse.data.models;
      const reviews = reviewsResponse.data.reviews;
      const filteredReviews = reviews.filter(review => review.rate === selectedStars);
  
      const tableData = filteredReviews.map((review, index) => {
        const user = users.find(user => user.id === review.userId);
        const model = models.find(model => model._id === review.modelId);
        return [
          index + 1,
          user ? user.name : 'N/A',
          model ? model.name : 'N/A',
          review.rate,
          review.feedback
        ];
      });
  
      const tableHeaders = ['No.', 'Name', 'Model', 'Rate', 'Feedback'];
      doc.autoTable({
        startY: yPos,
        head: [tableHeaders],
        body: tableData,
        didDrawCell: (data) => {
          if (data.section === 'head') {
            doc.setFillColor(52, 73, 94);
            doc.setTextColor(255);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.setTextColor(0);
          }
        }
      });
      const percentage = (filteredReviews.length/ reviews.length) * 100;
      yPos = doc.autoTable.previous.finalY + 10;
      doc.text(`Total Reviews: ${filteredReviews.length}`, 140, yPos + 10);
      doc.text(`Percentage of ${selectedStars} Star Reviews: ${percentage.toFixed(2)}%`, 110, yPos + 15);
      doc.save(`${selectedStars} stars Reviews .pdf`);
    } catch (error) {
      console.error('Error generating Review Report:', error);
      toast.error('Error in generating Review Report.');
    }
  };
  

  const handleReviewReport = async () => {
    const doc = new jsPDF();
    doc.addImage(nologo, 'PNG', 15, 10, 20, 20);
    doc.text('Review Report', 90, 20);
    doc.setFontSize(12);
    let yPos = 70;
  
    try {
      const [userResponse, modelsResponse, reviewsResponse] = await Promise.all([
        axios.get(`https://aerocraftnexusserver.vercel.app/api/users`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/models`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/reviews`)
      ]);
      const users = userResponse.data.users;
      const models = modelsResponse.data.models;
      const reviews = reviewsResponse.data.reviews;
      const tableData = reviews.map((review, index) => {
        const user = users.find(user => user.id === review.userId);
        const model = models.find(model => model._id === review.modelId);
        return [
          index + 1,
          user ? user.name : 'N/A',
          model ? model.name : 'N/A',
          review.rate,
          review.feedback
        ];
      });
  
      const tableHeaders = ['No.', 'Name', 'Model', 'Rate', 'Feedback'];
      doc.autoTable({
        startY: yPos,
        head: [tableHeaders],
        body: tableData,
        didDrawCell: (data) => {
          if (data.section === 'head') {
            doc.setFillColor(52, 73, 94);
            doc.setTextColor(255);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.setTextColor(0);
          }
        }
      });
  
      yPos = doc.autoTable.previous.finalY + 10;
      doc.text(`Total Reviews: ${reviews.length}`, 140, yPos + 10);
      doc.save(`ReviewsReport.pdf`);
    } catch (error) {
      console.error('Error generating Review Report:', error);
      toast.error('Error in generating Review Report.');
    }
  };
  

  const handleReturnReport = async () => {
    const doc = new jsPDF();
    doc.addImage(nologo, 'PNG', 15, 10, 20, 20);
    doc.text('Return Order Report', 90, 20);
    doc.setFontSize(12);
    let yPos = 70;
  
    try {
      const [userResponse, orderReturnResponse, ordersResponse, modelsResponse] = await Promise.all([
        axios.get(`https://aerocraftnexusserver.vercel.app/api/users`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/getreturnorders`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/orders`),
        axios.get(`https://aerocraftnexusserver.vercel.app/api/models`)
      ]);
  
      const users = userResponse.data.users;
      const orders = ordersResponse.data.orders;
      const orderReturns = orderReturnResponse.data.orderReturn;
      const orderReturnDetails = orderReturnResponse.data.orderReturnDetails;
      const returnOrderMap = new Map();
  
      orderReturnDetails.forEach(orderReturnDetail => {
        const orderReturn = orderReturns.find(order => order._id === orderReturnDetail.orderReturnId);
        const order = orders.find(order => order._id === orderReturn.orderId);
        const user = users.find(user => user.id === order.userId);
        const model = modelsResponse.data.models.find(model => model._id === orderReturnDetail.modelId);
        const returnOrderKey = orderReturn._id.toString();
  
        if (returnOrderMap.has(returnOrderKey)) {
          returnOrderMap.get(returnOrderKey).products.push({
            name: model ? model.name : 'N/A',
            quantity: orderReturnDetail.quantity,
            reason: orderReturnDetail.reason
          });
        } else {
          returnOrderMap.set(returnOrderKey, {
            date: new Date(orderReturn.date).toLocaleDateString('en-GB'),
            user: user ? user.name : 'N/A',
            products: [{
              name: model ? model.name : 'N/A',
              quantity: orderReturnDetail.quantity,
              reason: orderReturnDetail.reason
            }],
            total: orderReturn.totalAmount
          });
        }
      });
  
      const tableData = [];
      returnOrderMap.forEach((value, key) => {
        const products = value.products.map(product => `${product.name} - Qty: ${product.quantity}`).join('\n');
        const reasons = value.products.map(product => product.reason).join('\n');
        tableData.push([
          tableData.length + 1,
          value.date,
          value.user,
          products,
          reasons, 
          value.total
        ]);
      });
  
      const tableHeaders = ['No.', 'Date', 'Name', 'Model Details', 'Reasons', 'Total'];
      doc.autoTable({
        startY: yPos,
        head: [tableHeaders],
        body: tableData,
        didDrawCell: (data) => {
          if (data.section === 'head') {
            doc.setFillColor(52, 73, 94);
            doc.setTextColor(255);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.setTextColor(0);
          }
        }
      });
  
      yPos = doc.autoTable.previous.finalY + 10;
      doc.text(`Total Orders: ${returnOrderMap.size}`, 140, yPos + 10);
      doc.save(`ReturnReport.pdf`);
    } catch (error) {
      console.error('Error generating ReturnReport:', error);
      toast.error('Error in generating ReturnReport.');
    }
  };
  
  return (
    <div >
      <AdminNavbar />
      <div className="relative p-5 bg-sky-100 h-screen">
        <div className="flex lg:flex-row sm:flex-col gap-5 ">
        <div className="lg:hidden">
                    <MenuIcon
                        className="h-6 w-6 fill-current text-black cursor-pointer font-bold mx-2  z-50"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                </div>
          <div className={`lg:flex lg:flex-col mt-5 sidebar absolute lg:relative ${isSidebarOpen ? 'sm:block' : 'sm:hidden'} rounded-xl py-5 px-5 sm:px-5 sm:py-2 w-full lg:w-[20%] sm:w-auto z-10`}>
            <div className='p-5 bg-sky-100 border-2 border-black rounded-xl space-y-5'>
              <div>
                <input
                  type="radio"
                  id="salesReport"
                  name="reportType"
                  onChange={() => handleReportTypeSelect('sales')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                />
                <label htmlFor="salesReport" className="ml-2 font-semibold text-black ">Sales Report</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="userReport"
                  name="reportType"
                  onChange={() => handleReportTypeSelect('user')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                />
                <label htmlFor="userReport" className="ml-2 font-semibold text-black">User Report</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="returnOrderReport"
                  name="reportType"
                  onChange={() => handleReportTypeSelect('returnOrder')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                />
                <label htmlFor="returnOrderReport" className="ml-2 font-semibold text-black">Return Order Report</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="cancelOrderReport"
                  name="reportType"
                  onChange={() => handleReportTypeSelect('cancelOrder')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                />
                <label htmlFor="cancelOrderReport" className="ml-2 font-semibold text-black">Cancel Order Report</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="reviewOrderReport"
                  name="reportType"
                  onChange={() => handleReportTypeSelect('reviewOrder')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                />
                <label htmlFor="reviewOrderReport" className="ml-2 font-semibold text-black">Review Order Report</label>
              </div>
            </div>
          </div>
          <div className='table mx-6 lg:w-[80%] sm:w-[90%]'>
          {reportSelected ? (
            <> {reportType === 'user' && (
              <div >
                <div className='flex justify-center items-center px-5 py-10'>
                  <button className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center" onClick={handleGenerateUserReport}>Generate Report</button>
                </div>
              </div>
            )}
            {reportType === 'cancelOrder' && (
              <div>
                <div className='flex justify-center py-10 items-center px-5 '>
                  <button className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center" onClick={handleCancelReport}>Generate Report</button>
                </div>
              </div>
            )}
            {reportType === 'returnOrder' && (
              <div>
                <div className='flex justify-center py-10 items-center px-5 '>
                  <button className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center" onClick={handleReturnReport}>Generate Report</button>
                </div>
              </div>
            )}
            {reportType === 'sales' && (
              <div className='flex flex-col py-10 space-y-8 justify-start'>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date('01/01/2020')}
                  maxDate={endDate ? endDate : new Date()}
                  placeholderText="Select start date"
                  className="p-2 w-full border border-gray-300 rounded"
                />
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  placeholderText="Select end date"
                  className="p-2 w-full border border-gray-300 rounded"
                  disabled={!startDate}
                />
                <button className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center" onClick={handleGenerateSalesReport}>Generate Report</button>
              </div>
            )}
            {reportType === 'reviewOrder' && (
              <div className='flex flex-col py-10 justify-center p-7'>
                <div className="flex items-center">
                  <input type="radio" id="oneStar" name="rating" className="w-4 h-4 mx-1" onClick={() => setSelectedStars(1)} />
                  <label htmlFor="oneStar"><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /></label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="twoStar" name="rating" className="w-4 h-4 mx-1" onClick={() => setSelectedStars(2)} />
                  <label htmlFor="twoStar"><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /></label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="threeStar" name="rating" className="w-4 h-4 mx-1" onClick={() => setSelectedStars(3)} />
                  <label htmlFor="threeStar"><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /></label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="fourStar" name="rating" className="w-4 h-4 mx-1" onClick={() => setSelectedStars(4)} />
                  <label htmlFor="fourStar"><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /></label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="fiveStar" name="rating" className="w-4 h-4 mx-1" onClick={() => setSelectedStars(5)} />
                  <label htmlFor="fiveStar"><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /><StarIcon className='text-yellow-400' style={{ fontSize: '30px' }} /></label>
                </div>
                <button className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center" onClick={handleParticularReviewReport}>Generate Report</button>
                <button className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center" onClick={handleReviewReport}>Generate All Reviews report</button>
              </div>
            )}
           </>
           ) : (
            <div className="flex justify-center flex-col items-center h-auto py-28">
              <p className="lg:text-xl sm:text-lg font-semibold text-gray-600">Select report type from dropdown.</p>
              <p className="lg:text-xl sm:text-lg font-semibold text-gray-600">Reports will be shown here.</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
