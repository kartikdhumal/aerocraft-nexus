import '../src/input.css'
import Result from './components/Result';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCountContext } from './context/CartContext';
import axios from 'axios';
import { useEffect } from 'react';

function App() {
  const { setCount } = useCountContext()

  useEffect(() => {
    const fetchCartItemCount = async () => {
      try {
        let itemCount = 0;
        const userId = sessionStorage.userid;

        if (userId) {
          const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/carts`);
          if (response.data.cart) {
            const userCartItems = response.data.cart.filter(item => item.userId === userId);
            itemCount = userCartItems.length;
          } else {
            console.error('Error fetching cart items: Response data structure is invalid.');
          }
        } else {
          const sessionCart = JSON.parse(sessionStorage.getItem('sessionCart')) || [];
          itemCount = sessionCart.length;
        }
        setCount(itemCount);
      } catch (error) {
        console.error('Error fetching cart item count:', error);
      }
    };
    fetchCartItemCount();
  }, [])

  return (
    <div>
      <Result />
      <ToastContainer />
    </div>
  );
}

export default App;
