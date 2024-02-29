import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
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
import EditNoteIcon from '@mui/icons-material/EditNote';

function AddCom() {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/companies');
      setCompanyData(response.data.companies);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await axios.delete(`https://aerocraftnexusserver.vercel.app/api/deletecompany/${companyId}`);
      alert('Company Deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting company:', error);
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

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEdit = async(companyId) => {
    navigate('/editcompany', { state: { companyId } });
  }

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!name) {
        throw new Error('Company name is required');
      }
      if (/^\d+$/.test(name)) {
        throw new Error('Name cannot contain only digits');
      }
      if (name.length < 2) {
        throw new Error('Name must contain at least two characters');
      }
  
      const response = await axios.post('https://aerocraftnexusserver.vercel.app/api/addcompany', { name });
      if (response.data.message === 'Company already exists!') {
        throw new Error('Company already exists');
      }
      alert(response.data.message);
      setName('');
      fetchData();
    } catch (error) {
      if (error.message === 'Company already exists') {
        alert(error.message);
        setName('');
      } else {
        alert('An error occurred while adding the company. Please try again later.');
      }
      setNameError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filtering function to filter rows based on search query
  const filteredCompanyData = companyData.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='bg-sky-100'>
      <AdminNavbar />
      <div className="container mx-auto">
        <div className="flex justify-center pt-5 items-center">
          <form className="p-8 rounded-lg w-96" onSubmit={handleAddCompany}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Company Name</label>
              <input
                type="text"
                id="name"
                value={name}
                required
                onChange={handleNameChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${nameError ? 'border-red-500' : 'focus:border-blue-500'}`}
              />
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>
            <button
              type="submit"
              className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center"
            >
              {loading ? 'Adding company...' : 'Add Company'}
            </button>
          </form>
        </div>
        <div className="flex w-full lg:px-20  justify-center items-center mt-8">
          <input
            type="text"
            placeholder="Search by company name"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex justify-center items-center mt-8">
          <TableContainer component={Paper} style={{ width: '90%', borderRadius: '10px' }}>
            <Table aria-label="custom pagination table">
              <TableHead className='bg-blue-700'>
                <TableRow className='bg-gray-300'> 
                  <TableCell align='left'> ID </TableCell>
                  <TableCell align="left">Company</TableCell>
                  <TableCell align="left">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? filteredCompanyData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : filteredCompanyData
                ).map((company, index) => (
                  <StyledTableRow key={index + page * rowsPerPage}>
                    <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>
                      <EditNoteIcon 
                        className='text-sky-700  cursor-pointer'
                        onClick={() => handleEdit(company.id)}
                      />
                      &nbsp;
                      <DeleteIcon
                        className='text-red-700 cursor-pointer'
                        onClick={() => handleDeleteCompany(company.id)}
                      />
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[1, 5, 10, 15, { label: 'All', value: -1 }]}
                    colSpan={4}
                    count={filteredCompanyData.length}
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

export default AddCom;
