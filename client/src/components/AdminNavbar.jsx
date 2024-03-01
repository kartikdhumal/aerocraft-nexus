import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import logo from '../images/logo3.png';
import axios from 'axios';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { toast } from 'react-toastify';

function AdminNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [modelData, setModelData] = useState([]);
    const navigate = useNavigate();
    let name = '';
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (token && role !== 'user') {
        name = sessionStorage.getItem('name');
    }

    useEffect(() => {
        fetchCount();
        if (token && role == 'user') {
            navigate('/login');
        } else {
            name = sessionStorage.getItem('name');
        }
    }, [token, role, navigate]);

    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        fetchCount();
    }, []);

    const handleNotification = () => {
        navigate('/notifications');
    }

    const fetchCount = async () => {
        try {
            const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/models');
            setModelData(response.data.models);
            const zeroQuantityModels = response.data.models.filter(model => model.quantity == 0);
            setNotificationCount(zeroQuantityModels.length);
        } catch (error) {
            console.error('There was a problem with fetching models :', error);
        }
    };
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('name');
        toast.success('Logged out');
        navigate('/login');
    };

    return (
        <div className="bg-sky-100 h-16 flex items-center print:hidden justify-between py-10 px-4 lg:px-8 relative">
            <div className="lg:flex sm:hidden  items-center lg:w-auto lg:items-start sm:items-center sm:justify-center sm:w-full">
                <img src={logo} alt="Logo" className="h-16 lg:h-20 rounded-2xl mr-4" />
            </div>
            <div className="flex lg:hidden items-center lg:w-auto lg:items-start sm:items-center sm:justify-center vsm:justify-end sm:w-[70%] vsm:w-[50%]">
                <img src={logo} alt="Logo" className="h-20 lg:h-20 rounded-2xl vsm:h-16" />
            </div>
            <div className="flex flex-row sm:w-96">
                <h2 className="text-black lg:text-lg sm:text-md vsm:text-sm lg:my-0 sm:my-1 font-bold">Hey, {name}</h2>
                <div className='lg:block flex'>
                    <NotificationsIcon onClick={handleNotification} className='text-[#FFD700] cursor-pointer shadow-2xl mx-5 my-1 ' />
                    {notificationCount > 0 && (
                        <span className='rounded-lg text-sm bg-red-600 px-[5px] font-bold text-white ml-[-34px]'>{notificationCount}</span>
                    )}
                    <NavLink to={'/adminuserprofile'}><AccountBoxIcon className="text-black" /></NavLink>
                </div>
            </div>

            <div className="hidden lg:flex items-center">
                <ul className="flex space-x-4">
                    <NavLink to={'/admin'} style={({ isActive }) => { return isActive ? { backgroundColor: 'skyblue', color: 'black' } : {} }} className="text-black cursor-pointer transition duration-300 ease-in-out hover:bg-[#87CEEB] hover:text-gray-800 py-2 px-3 rounded-md">Home</NavLink>
                    <NavLink to={'/adduser'} style={({ isActive }) => { return isActive ? { backgroundColor: 'skyblue', color: 'black' } : {} }} className="text-black cursor-pointer transition duration-300 ease-in-out hover:bg-[#87CEEB] hover:text-gray-800 py-2 px-3 rounded-md">User</NavLink>
                    <NavLink to={'/addcat'} style={({ isActive }) => { return isActive ? { backgroundColor: 'skyblue', color: 'black' } : {} }} className="text-black cursor-pointer transition duration-300 ease-in-out hover:bg-[#87CEEB] hover:text-gray-800 py-2 px-3 rounded-md">Category</NavLink>
                    <NavLink to={'/addsubcat'} style={({ isActive }) => { return isActive ? { backgroundColor: 'skyblue', color: 'black' } : {} }} className="text-black cursor-pointer transition duration-300 ease-in-out hover:bg-[#87CEEB] hover:text-gray-800 py-2 px-3 rounded-md">Subcategory</NavLink>
                    <NavLink to={'/addcom'} style={({ isActive }) => { return isActive ? { backgroundColor: 'skyblue', color: 'black' } : {} }} className="text-black cursor-pointer transition duration-300 ease-in-out hover:bg-[#87CEEB] hover:text-gray-800 py-2 px-3 rounded-md">Company</NavLink>
                    <NavLink to={'/addmod'} style={({ isActive }) => { return isActive ? { backgroundColor: 'skyblue', color: 'black' } : {} }} className="text-black cursor-pointer transition duration-300 ease-in-out hover:bg-[#87CEEB] hover:text-gray-800 py-2 px-3 rounded-md">Model</NavLink>
                    <NavLink to={'/orders'} style={({ isActive }) => { return isActive ? { backgroundColor: 'skyblue', color: 'black' } : {} }} className="text-black cursor-pointer transition duration-300 ease-in-out hover:bg-[#87CEEB] hover:text-gray-800 py-2 px-3 rounded-md">Orders</NavLink>
                    <NavLink to={'/reports'} style={({ isActive }) => { return isActive ? { backgroundColor: 'skyblue', color: 'black' } : {} }} className="text-black cursor-pointer transition duration-300 ease-in-out hover:bg-[#87CEEB] hover:text-gray-800 py-2 px-3 rounded-md">Reports</NavLink>
                    <li className="lg:w-auto sm:w-full flex items-center  cursor-pointer text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2" onClick={handleLogout}>Logout</li>
                </ul>
            </div>
            <div className="lg:hidden flex items-center">
                <button onClick={toggleMenu} className="text-black absolute left-4 lg:right-auto lg:absolute">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
            </div>
            {isMenuOpen && (
                <div className="lg:hidden absolute rounded-xl top-16 left-0 bg-sky-100 shadow-lg py-2 px-4 w-52 z-20">
                    <ul className='flex flex-col space-y-2 justify-center items-start'>
                        <NavLink to={'/admin'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center text-sky-100 ml-2">Home</NavLink>
                        <NavLink to={'/adduser'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center text-sky-100 ml-2">User</NavLink>
                        <NavLink to={'/addcat'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center text-sky-100 ml-2">Category</NavLink>
                        <NavLink to={'/addsubcat'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center text-sky-100 ml-2">Subcategory</NavLink>
                        <NavLink to={'/addcom'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center text-sky-100 ml-2">Company</NavLink>
                        <NavLink to={'/addmod'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center text-sky-100 ml-2">Model</NavLink>
                        <NavLink to={'/orders'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center text-sky-100 ml-2">Orders</NavLink>
                        <NavLink to={'/reports'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center text-sky-100 ml-2">Reports</NavLink>
                        <li className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2" onClick={handleLogout}>Logout</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default AdminNavbar;
