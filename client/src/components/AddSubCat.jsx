import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { styled } from '@mui/material/styles';
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
import EditNoteIcon from '@mui/icons-material/EditNote';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

function AddSubCat() {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const handleDeleteSubcategory = async (subcategoryId) => {
    try {
      await axios.delete(`https://aerocraftnexusserver.vercel.app/api/deletesubcategory/${subcategoryId}`);
      alert('Subcategory Deleted');
      fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!name) {
        throw new Error('Subcategory name is required');
      }
      if (!categoryId) {
        throw new Error('Please select a category');
      }

      const response = await axios.post('https://aerocraftnexusserver.vercel.app/api/addsubcategory', { name, categoryId });
      alert(response.data.message);
      setName('');
      setCategoryId('');
      fetchSubcategories();
    } catch (error) {
      alert(error.message);
      setNameError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const findCategoryName = (categoryId) => {
    const category = categories.find((category) => category.id === categoryId);
    return category ? category.name : 'Category Not Found';
  };

  const handleEdit = async (subcatid) => {
    navigate('/editsubcategory', { state: { subcatid } });
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = subcategoryData.filter(
    (subcategory) =>
      subcategory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      findCategoryName(subcategory.categoryId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='bg-sky-100'>
      <AdminNavbar />
      <div className="container mx-auto">
        <div className="flex justify-center pt-5 items-center">
          <form className="p-8 rounded-lg w-96" onSubmit={handleAddSubcategory}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Subcategory Name</label>
              <input
                type="text"
                id="name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${nameError ? 'border-red-500' : 'focus:border-blue-500'}`}
              />
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="category-select" className="block text-gray-700 font-semibold mb-2">Category</label>
              <select
                id="category-select"
                value={categoryId}
                required
                onChange={(e) => setCategoryId(e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 w-full"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center"
            >
              {loading ? 'Adding Subcategory...' : 'Add Subcategory'}
            </button>
          </form>
        </div>
        <div className="flex w-full lg:px-20 justify-center pt-5 items-center">
          <input
            type="text"
            placeholder="Search by category or subcategory"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex justify-center items-center mt-8">
          <TableContainer component={Paper} style={{ width: '90%', borderRadius: '10px' }}>
            <Table aria-label="custom pagination table">
              <TableHead>
                <TableRow className="bg-gray-300">
                  <TableCell align='left'> ID </TableCell>
                  <TableCell align="left">Subcategory</TableCell>
                  <TableCell align="left">Category</TableCell>
                  <TableCell align="left">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : filteredData
                ).map((subcategory, index) => (
                  <StyledTableRow key={index + page * rowsPerPage}>
                    <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                    <TableCell>{subcategory.name}</TableCell>
                    <TableCell>{findCategoryName(subcategory.categoryId)}</TableCell>
                    <TableCell>
                      <EditNoteIcon className='text-sky-700 cursor-pointer' onClick={() => handleEdit(subcategory._id)} />
                      <DeleteIcon
                        className='text-red-700 cursor-pointer'
                        onClick={() => handleDeleteSubcategory(subcategory._id)}
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
                    count={filteredData.length}
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

export default AddSubCat;
