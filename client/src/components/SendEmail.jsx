import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';

function SendEmail() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSendOTP = () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
    } else {
      const otp = Math.floor(1000 + Math.random() * 9000);
      setLoading(true); 

      const templateParams = {
        to_email: email,
        subject: 'Your OTP for resetting password',
        message : otp,
      };

      emailjs.send('service_ekhgoiq', 'template_bei6puv', templateParams,'4bTjCO33g6vqxyOyK')
        .then((response) => {
          console.log('Email sent:', response);
          alert('An OTP has been sent to your email address ' + email);
          navigate('/otp', { state: { otp, email } });
          setEmail('');
        })
        .catch((error) => {
          console.error('Email send error:', error);
          alert('Failed to send OTP. Please try again later.');
          setEmail('');
        })
        .finally(() => {
          setLoading(false); 
        });
    }
  };

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  return (
    <div className='w-full h-screen bg-sky-100 flex justify-center items-center'>
      <div className='p-8 rounded-lg shadow-lg w-96'>
        <p className='text-lg font-bold mb-4 text-center'>Type your email to get OTP</p>
        <div className='mb-4'>
          <label htmlFor='email' className='block text-gray-700 font-semibold mb-2'>Email</label>
          <input type='email' id='email' required value={email} onChange={handleEmailChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500' />
          {error && <p className='text-red-500 mt-1'>{error}</p>}
        </div>
        <button onClick={handleSendOTP} className='w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center'>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </div>
    </div>
  );
}

export default SendEmail;
