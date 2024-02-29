import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios'
import { toast } from 'react-hot-toast';
import '../input.css'

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleRegister = async (e) => {
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

      await axios.post('https://aerocraftnexusserver.vercel.app/api/register', {
        name,
        email,
        password,
        role
      });
      alert('Registered Successfully');
      setName('');
      setEmail('');
      setPassword('');
      navigate('/');
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert('Network error occurred. Please try again later.');
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
    <div className='w-full h-screen bg-sky-100 flex justify-center items-center'>
      <form className='p-8 rounded-lg shadow-2xl lg:w-96 sm:w-96 vsm:w-[90%]' onSubmit={handleRegister}>
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
          <label htmlFor='password' className='block text-gray-700 font-semibold mb-2'>Password</label>
          <input type='password' id='password' value={password} required onChange={handlePasswordChange} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${passwordError ? 'border-red-500' : 'focus:border-blue-500'}`} />
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>
        <button type='submit' className='lg:w-full sm:w-full cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 my-2 font-bold text-center ' disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className='flex flex-col justify-start'>
          <div>Already have an account? <NavLink to={'/login'} className='text-blue-500'>Login</NavLink></div>
        </div>
      </form>
    </div>
  );
}

export default Register;
