import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../input.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false); 
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        if (!email) setEmailError('Email is required');
        if (!password) setPasswordError('Password is required');
        return;
      }

      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters long');
        return;
      }

      setLoggingIn(true);

      const response = await axios.post('https://aerocraftnexusserver.vercel.app/api/login', {
        email,
        password,
      });

      const { data } = response;

      if (data.token) {
        const { token, role , email , name , userid } = data;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('name', name);
        sessionStorage.setItem('userid', userid);
        sessionStorage.setItem('role', role);        
        if (role=="admin") {
          alert('Logged in as admin Successfully');
          navigate('/admin');
        } else {
          alert('Logged in Successfully');
          navigate('/');
        }
      } else if (data.message) {
        alert(data.message);
      }
    } catch (error) {
      alert('User not exists');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className='w-full h-screen bg-sky-100 flex justify-center items-center'>
      <form className='p-8 rounded-lg shadow-2xl w-96' onSubmit={handleLogin}>
        <div className='mb-4'>
          <label htmlFor='email' className='block text-gray-700 font-semibold mb-2'>Email</label>
          <input type='email' id='email' required value={email} onChange={handleEmailChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500' />
          {emailError && <span className='text-red-500'>{emailError}</span>}
        </div>
        <div className='mb-6'>
          <label htmlFor='password' className='block text-gray-700 font-semibold mb-2'>Password</label>
          <input type='password' id='password' required value={password} onChange={handlePasswordChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500' />
          {passwordError && <span className='text-red-500'>{passwordError}</span>}
        </div>
        <button type='submit' disabled={loggingIn} className='w-full my-2 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center'>
          {loggingIn ? 'Logging in...' : 'Login'}
        </button>
        <div className='flex flex-col justify-start'>
          <div><NavLink to={'/forgotpassword'} className='text-sky-600 float-right text-sm'> Forgot Password ? </NavLink></div>
          <div className="relative flex items-center mt-2">
            <div className="border h-0 w-2/4 border-stone-500"></div>
            <div className=" text-stone-500 px-4 text-sm font-normal">OR</div>
            <div className=" border h-0 w-2/4 border-stone-500"></div>
          </div>
          <NavLink to={'/register'} className='lg-full my-2 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center '>Create Account</NavLink>
        </div>
      </form>
    </div>
  );
}

export default Login;
