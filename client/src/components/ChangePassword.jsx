import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from "react-toastify";

function ChangePassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state.email;

  const handleChange = (e) => {
    setPassword(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Password cannot be empty');
    } else if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
    } else {
      setIsLoading(true);
      try {
        const response = await axios.put('https://aerocraftnexusserver.vercel.app/api/updatepassword', {
          email,
          newPassword: password
        });

        if (response.status === 200) {
          toast.success('Password changed successfully');
          navigate('/login');
          setPassword('');
        } else {
          const responseData = response.data;
          if (responseData.error === 'User not found') {
            setError('User not found');
            setPassword('');
          } else {
            setError('Failed to change password');
          }
          setPassword('');
        }
      } catch (error) {
        console.error('Error changing password:', error);
        setError('Failed to change password');
      } finally {
        setIsLoading(false); 
      }
    }
  };

  return (
    <div className='w-full h-screen bg-sky-100 flex p-5 justify-center items-center'>
      <div className='p-8 rounded-lg shadow-lg w-96'>
        <h2 className='text-2xl font-bold mb-4 text-center'>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='email' className='block text-gray-700 font-semibold mb-2'> Email </label>
            <input
              type='text'
              id='email'
              value={email}
              readOnly
              className='w-full px-3 py-2 bg-gray-300 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
            />
            <label htmlFor='password' className='block text-gray-700 font-semibold mb-2'>New Password</label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 ${error ? 'border-red-500' : ''}`}
            />
            {error && <div className='text-red-500 mt-1'>{error}</div>}
          </div>
          <button type='submit' className='w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center'>
            {isLoading ? 'Changing password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
