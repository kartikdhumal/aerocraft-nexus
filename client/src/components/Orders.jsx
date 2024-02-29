import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import TablePagination from '@mui/material/TablePagination';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminNavbar from './AdminNavbar';
import { styled } from '@mui/material/styles';
import EditNoteIcon from '@mui/icons-material/EditNote';

function Orders() {
  const [orderData, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderDetails, setOrderDetails] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [orderReturnDetailSchema, setorderReturnDetailSchema] = useState([]);
  const [orderReturn, setorderReturn] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchModels();
    fetchReturnOrderDetail();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/getorders`);
      setOrders(response.data.orders);
      setOrderDetails(response.data.orderDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchReturnOrderDetail = async () => {
    try {
      const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/getreturnorders`);
      setorderReturnDetailSchema(response.data.orderReturnDetails);
      setorderReturn(response.data.orderReturn);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
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

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
    return formattedDate;
  };


  const fetchModels = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/models');
      setModelData(response.data.models);
    } catch (error) {
      console.error('There was a problem with fetching models :', error);
    }
  };

  const mapUserDetails = (userId) => {
    const user = users.find(user => user.id === userId);
    if (user) {
      return `${user.name} - ${user.email}`;
    }
    return 'User Not Found';
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const mapModelDetails = (orderId) => {
    let details;
    const order = orderData.find(order => order._id === orderId);

    if (!order) {
      return 'Order Not Found';
    }

    if (order.status === 'returned') {
      const orderreturns = orderReturn.filter(detail => detail.orderId === orderId);
      if (orderreturns.length === 0) {
        return 'No model details found for returned order';
      }

      details = orderreturns.map(orderReturnItem => {
        const orderretdetails = orderReturnDetailSchema.filter(detail => detail.orderReturnId === orderReturnItem._id);
        if (orderretdetails.length === 0) {
          return 'No model details found per return Id';
        }

        return orderretdetails.map(detail => {
          const model = modelData.find(model => model._id === detail.modelId);
          if (model) {
            return (
              <div key={model.id}>
                <div className='flex space-x-2'>
                  {model.images ? model.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Image ${index}`}
                      className="w-6 h-6 my-4 object-cover border border-gray-300"
                    />
                  )) : 'No files'}
                </div>
                <span>{model.name}</span>
              </div>
            );
          }
          return 'Model Not Found';
        });
      });
    } else {
      const orderDetailsForOrder = orderDetails.filter(detail => detail.orderId === orderId);
      if (orderDetailsForOrder.length === 0) {
        return 'No model details found for order';
      }
      details = orderDetailsForOrder.map(detail => {
        const model = modelData.find(model => model._id === detail.modelId);
        if (model) {
          return (
            <div key={model.id}>
              <div className='flex space-x-2'>
                {model.images ? model.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Image ${index}`}
                    className="w-6 h-6 my-4 object-cover border border-gray-300"
                  />
                )) : 'No files'}
              </div>
              <span>{model.name}</span>
            </div>
          );
        }
        return 'Model Not Found';
      });
    }

    return details;
  };



  const filteredOrderData = orderData.filter((order) => {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    const user = users.find(user => user.id === order.userId);
    const userModelName = user ? user.name.toLowerCase() : '';

    const model = modelData.find(model => model.id === order.modelId);
    const modelModelName = model ? model.name.toLowerCase() : '';

    return (
      order.status.toLowerCase().includes(lowerCaseSearchQuery) ||
      userModelName.includes(lowerCaseSearchQuery) ||
      order.paymentType.toLowerCase().includes(lowerCaseSearchQuery) ||
      order.totalAmount.toLowerCase().includes(lowerCaseSearchQuery) ||
      modelModelName.includes(lowerCaseSearchQuery)
    );
  });

  const sortedOrderData = filteredOrderData.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  const handleStatusChange = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.put(`https://aerocraftnexusserver.vercel.app/api/updatestatus/${orderId}`, { status: newStatus });
      alert('Status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className='bg-sky-100 min-h-screen'>
      <AdminNavbar />
      <div className="container mx-auto">
        <div className="flex lg:px-20 justify-center items-center mt-8">
          <input
            type="text"
            placeholder="Search order detail..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex justify-center items-center mt-8 z-0">
          <TableContainer component={Paper} style={{ width: '90%', borderRadius: '10px' }}>
            <Table aria-label="custom pagination table">
              <TableHead>
                <TableRow className="bg-gray-300">
                  <TableCell align='left'> ID </TableCell>
                  <TableCell align="left">Date</TableCell>
                  <TableCell align="left">User Name-Email</TableCell>
                  <TableCell align="left">Model</TableCell>
                  <TableCell align="left">Total</TableCell>
                  <TableCell align="left">Address</TableCell>
                  <TableCell align="left">Payment</TableCell>
                  <TableCell align="left">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? sortedOrderData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : sortedOrderData
                ).map((order, index) => (
                  <StyledTableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{getTimeAgo(order.date)}</TableCell>
                    <TableCell>{mapUserDetails(order.userId)}</TableCell>
                    <TableCell>
                      {mapModelDetails(order._id)}
                    </TableCell>
                    <TableCell>{order.totalAmount}</TableCell>
                    <TableCell>{order.delAddress}</TableCell>
                    <TableCell>{order.paymentType}</TableCell>
                    <TableCell>
                      <select
                        className="w-auto px-1 py-2 border border-gray-300 rounded-md focus:outline-none"
                        value={order.status}
                        onChange={(event) => handleStatusChange(event, order._id)}
                      >
                        {order.status === 'pending' && (
                          <>
                            <option selected disabled>{order.status}</option>
                            <option value="delivered">Delivered</option>
                          </>
                        )}
                        {order.status === 'returned' && (
                          <>
                            <option selected disabled>{order.status}</option>
                          </>
                        )}
                        {order.status === 'delivered' && (
                          <>
                            <option selected disabled>{order.status}</option>
                            <option value="returned">Returned</option>
                          </>
                        )}
                        {order.status === 'cancelled' && (
                          <>
                            <option selected disabled>{order.status}</option>
                          </>
                        )}
                      </select>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[1, 5, 10, 15, { label: 'All', value: -1 }]}
                    colSpan={4}
                    count={orderData.length}
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

export default Orders;
