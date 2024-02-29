import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Count() {
  const [cartItemCount, setCartItemCount] = useState(0);
  const userId = sessionStorage.getItem('userid');

  useEffect(() => {
    const fetchCartItemCount = async () => {
      try {
        if (userId) {
          const response = await axios.get(`http://localhost:2000/api/cartitemcount/${userId}`);
          const { count } = response.data;
          setCartItemCount(count);
          console.log('count count : ' + count);
        } else {
          throw new Error('User ID not found in local storage');
        }
      } catch (error) {
        console.error('Error fetching cart item count:', error.message);
      }
    };

    fetchCartItemCount();
  }, [userId, cartItemCount]); // Include cartItemCount in dependencies

  return (
    <div>
      <p>Count: {cartItemCount}</p>
    </div>
  );
}

export default Count;
