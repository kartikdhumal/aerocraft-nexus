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
import TablePagination from '@mui/material/TablePagination';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminNavbar from './AdminNavbar';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';

function AddUsers() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userdata, setUserData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/users');
      setUserData(response.data.users);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleDeleteUser = async (deleteid) => {
    try {
      await axios.delete(`https://aerocraftnexusserver.vercel.app/api/deleteuser/${deleteid}`);
      toast.success('User Deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUserData = userdata.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('https://aerocraftnexusserver.vercel.app/api/adduser', {
        name,
        email,
        password,
        role
      });
      toast.success('User Added');
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      fetchData();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Network error occurred. Please try again later.');
      }
      if (error.message.includes('Name')) {
        setNameError(error.message);
      } else if (error.message.includes('Email')) {
        setEmailError(error.message);
      } else if (error.message.includes('Password')) {
        setPasswordError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-sky-100'>
      <AdminNavbar />
      <div className="container mx-auto">
        <div className="flex justify-center pt-5 items-center">
          <form className="p-8 rounded-lg w-96" onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
              <input type="text" id="name" value={name} required onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${nameError ? 'border-red-500' : 'focus:border-blue-500'}`} />
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
              <input type="email" id="email" value={email} required onChange={(e) => setEmail(e.target.value)} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${emailError ? 'border-red-500' : 'focus:border-blue-500'}`} />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
              <input type="password" id="password" value={password} required onChange={(e) => setPassword(e.target.value)} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${passwordError ? 'border-red-500' : 'focus:border-blue-500'}`} />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Role</label>
              <select onChange={(e) => setRole(e.target.value)} value={role} required className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${passwordError ? 'border-red-500' : 'focus:border-blue-500'}`}>
                <option value="admin">admin</option>
                <option value="user">user</option>
              </select>
            </div>
            <button type="submit" className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center">
              {loading ? 'Adding user...' : 'Add User'}
            </button>
          </form>
        </div>
        <div className="flex lg:px-20 justify-center items-center mt-8">
          <input
            type="text"
            placeholder="Search by name, email, or role"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex justify-center items-center mt-8">
          <TableContainer component={Paper} style={{ width: '90%', borderRadius: '10px' }}>
            <Table aria-label="custom pagination table">
              <TableHead>
                <TableRow className='bg-gray-300'>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUserData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                  <StyledTableRow key={index + page * rowsPerPage}>
                    <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <DeleteIcon
                        className='text-red-700 cursor-pointer'
                        onClick={() => handleDeleteUser(user.id)}
                      />
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 15, { label: 'All', value: -1 }]}
                    colSpan={5}
                    count={filteredUserData.length}
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

export default AddUsers;
