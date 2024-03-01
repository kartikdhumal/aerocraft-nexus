import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function OTP() {
  const navigate = useNavigate();
  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const input3Ref = useRef(null);
  const input4Ref = useRef(null);
  const location = useLocation();
  const { otp, email } = location.state;
  const [loading, setLoading] = useState(false);

  const handleKeyDown = (e, inputRef) => {
    if (e.key === 'Backspace' && inputRef.current.selectionStart === 0 && inputRef.current.selectionEnd === 0) {
      switch (inputRef) {
        case input2Ref:
          input1Ref.current.focus();
          break;
        case input3Ref:
          input2Ref.current.focus();
          break;
        case input4Ref:
          input3Ref.current.focus();
          break;
        default:
          break;
      }
    }
  };

  const handleChange = (e, inputRef) => {
    const value = e.target.value;
    if (value.length === 1) {
      switch (inputRef) {
        case input1Ref:
          input2Ref.current.focus();
          break;
        case input2Ref:
          input3Ref.current.focus();
          break;
        case input3Ref:
          input4Ref.current.focus();
          break;
        default:
          break;
      }
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const enteredOTP = input1Ref.current.value + input2Ref.current.value + input3Ref.current.value + input4Ref.current.value;
    console.log(enteredOTP);
    console.log(otp);
    try {
      setLoading(true);
      if (enteredOTP == otp) {
        alert('Verification successful');
        navigate('/changepassword', { state: { email } });
        input1Ref.current.value = '';
        input2Ref.current.value = '';
        input3Ref.current.value = '';
        input4Ref.current.value = '';
        input1Ref.current.focus();
      } else {
        alert('Incorrect OTP. Please try again.');
        input1Ref.current.value = '';
        input2Ref.current.value = '';
        input3Ref.current.value = '';
        input4Ref.current.value = '';
        input1Ref.current.focus();
        
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Failed to verify OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full h-screen bg-sky-100 flex justify-center p-5 items-center'>
      <div className='p-8 rounded-lg shadow-lg w-96'>
        <h2 className='text-2xl  font-bold mb-4 text-center'>Enter OTP</h2>
        <div className='flex flex-row justify-between items-center'>
        <div className='flex  justify-between mb-4'>
          <input
            ref={input1Ref}
            type='text'
            maxLength='1'
            onKeyDown={(e) => handleKeyDown(e, input1Ref)}
            onChange={(e) => handleChange(e, input1Ref)}
            className='w-16 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:border-blue-500'
          />
        </div>
        <div className='flex justify-between mb-4'>
          <input
            ref={input2Ref}
            type='text'
            maxLength='1'
            onKeyDown={(e) => handleKeyDown(e, input2Ref)}
            onChange={(e) => handleChange(e, input2Ref)}
            className='w-16 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:border-blue-500'
          />
        </div>
        <div className='flex justify-between mb-4'>
          <input
            ref={input3Ref}
            type='text'
            maxLength='1'
            onKeyDown={(e) => handleKeyDown(e, input3Ref)}
            onChange={(e) => handleChange(e, input3Ref)}
            className='w-16 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:border-blue-500'
          />
        </div>
        <div className='flex justify-between mb-4'>
          <input
            ref={input4Ref}
            type='text'
            maxLength='1'
            onKeyDown={(e) => handleKeyDown(e, input4Ref)}
            onChange={(e) => handleChange(e, input4Ref)}
            className='w-16 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:border-blue-500'
          />
        </div>
        </div>
        <button onClick={handleOTPSubmit} className='w-full mt-5 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center'>
          {loading ? 'Verifying OTP...' : 'Submit OTP'}
        </button>
      </div>
    </div>
  );
}

export default OTP;
