import React, { useEffect, useState } from 'react';
import HomeNavbar from './HomeNavbar';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { toast } from 'react-toastify';

function AdminUserProfile() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    let emailofuser = '';

    const token = sessionStorage.getItem('token');
    const myrole = sessionStorage.getItem('role');

    if (token && myrole !== 'user') {
        emailofuser = sessionStorage.getItem('email');
    }
  
    const [role, setRole] = useState('admin');
    const fetchUserData = async () => {
        try {
            const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/getuser/${emailofuser}`);
            const userData = response.data.user;
            setName(userData.name);
            setEmail(userData.email);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    useEffect(() => {
        fetchUserData();
    }, [emailofuser]);

    const handleNameChange = (e) => {
        setName(e.target.value);
        setNameError('');
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPasswordError('');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            if (!name || !email || !password) {
                throw new Error('Name, email, and password are required');
            }

            if (/^\d+$/.test(name)) {
                throw new Error('Name cannot contain only digits');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            setLoading(true);

            await axios.put(`https://aerocraftnexusserver.vercel.app/api/updateprofile/${sessionStorage.userid}`, {
                name,
                email,
                password,
                role
            });

            toast.success('Profile updated successfully');
            setName('');
            setEmail('');
            setPassword('');
            sessionStorage.removeItem('name');
            navigate('/login');
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.message);
                setPassword('');
            } else {
                toast.error('Network error occurred. Please try again later.');
                setPassword('');
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
            <AdminNavbar/>
            <div className='w-full h-screen flex justify-center items-start p-10'>
                <form className='rounded-lg w-96' onSubmit={handleUpdateProfile}>
                    <div className='mb-4'>
                        <label htmlFor='name' className='block text-gray-700 font-semibold mb-2'>Name</label>
                        <input type='text' id='name' value={name} required onChange={handleNameChange} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${nameError ? 'border-red-500' : 'focus:border-blue-500'}`} />
                        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                    </div>
                    <div className='mb-4'>
                        <label htmlFor='email' className='block text-gray-700 font-semibold mb-2'>Email</label>
                        <input type='email' id='email' value={email} required onChange={handleEmailChange} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${emailError ? 'border-red-500' : 'focus:border-blue-500'}`} />
                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>
                    <div className='mb-6'>
                        <label htmlFor='password' className='block text-gray-700 font-semibold mb-2'>New Password</label>
                        <input type='password' id='password' value={password} required onChange={handlePasswordChange} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${passwordError ? 'border-red-500' : 'focus:border-blue-500'}`} />
                        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                    </div>
                    <button type='submit' className='w-full my-2 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center' disabled={loading}>
                        {loading ? 'Updating profile...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminUserProfile;
