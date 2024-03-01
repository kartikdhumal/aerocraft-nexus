import { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../images/logo3.png';
import userlogo from '../images/userlogo.png';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DnsIcon from '@mui/icons-material/Dns';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useCountContext } from '../context/CartContext';

function HomeNavbar() {
  const { count } = useCountContext()
  const [categories, setCategoryData] = useState([]);
  const [subcategories, setSubcategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [modelData, setModelData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchSubcategories();
    fetchModels();
  }, []);

  useEffect(()=>{
    fetchCartItemCount();
  },[])
  const fetchModels = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/models');
      setModelData(response.data.models);
    } catch (error) {
      console.error('There was a problem with fetching models :', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/categories');
      setCategoryData(response.data.categories);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

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
    } catch (error) {
      console.error('Error fetching cart item count:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/subcategories');
      setSubcategoryData(response.data.subcategories);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleCategoryHover = (category) => {
    setSelectedCategory(category);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('userid');
    sessionStorage.removeItem('token');
    setUserLoggedIn(false);
    alert('Logged out');
    navigate('/login');
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (token && role !== 'admin') {
      setUserLoggedIn(true);
    }
  }, []);



  const handleBox = () => {
    setSearchResults(true);
  }

  const hideSearchResult = () => {
    setTimeout(() => {
      setSearchResults(false);
    }, 1000)
  }
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    if (modelData.length > 0) {
      const filteredResults = modelData.filter((model) =>
        model.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setSearchResults(filteredResults);
      setShowSearchResults(e.target.value.length > 0);
    }
  };


  return (
    <div className="bg-sky-100 text-white px-6 w-full sm:fixed top-0 z-50">
      <div className="flex justify-around items-center">
        <div className="flex items-center space-x-4  lg:w-auto">
          <div className='lg:hidden '> <MenuIcon className="h-6 w-6 fill-current text-black lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)} /></div>
          <img src={logo} alt="Logo" className="lg:h-20 lg:block sm:block sm:h-20 vsm:h-16" />
        </div>
        <div className="flex items-center w-2/3 justify-end space-x-6 relative">
          <input
            type="text"
            placeholder="Search Models..."
            className="bg-white text-black border-2 border-black lg:w-auto sm:w-[70%] vsm:w-2/3 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            onBlur={hideSearchResult}
          />

          {userLoggedIn ? <>
            <NavLink to="/yourorders" className='lg:flex flex-col sm:hidden'>
              <ListAltIcon className="h-8 w-8 cursor-pointer  text-black" />
            </NavLink>
          </> : <></>
          }


          <NavLink to="/addtocart" className='flex flex-col'>
            {
              count > 0 && (
            <span className='rounded-lg flex justify-center items-center text-sm bg-red-600 px-[5px] font-bold text-white'>
              {count}
            </span>
           )}
            <ShoppingCartIcon className="h-8 w-8 cursor-pointer text-black" />
          </NavLink>
          
          {userLoggedIn ? (
            <div
              className="relative lg:block sm:hidden cursor-pointer"
              onMouseEnter={() => setIsProfileHovered(true)}
              onMouseLeave={() => setIsProfileHovered(false)}
            >
              <img src={userlogo} alt="User" className="h-10 w-100 rounded-xl" />
              {isProfileHovered && (
                <div className="absolute border border-black right-0 px-1 w-56 bg-sky-100  py-2 rounded-xl shadow-lg z-50">
                  <div className="flex-shrink-0 w-100 h-24 object-fill w-full flex justify-center items-center">
                    <img src={userlogo} alt="" className="object-cover cursor-auto object-center w-16 h-16 rounded" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-lg flex justify-center items-center font-bold cursor-auto bg-gray-100 text-black rounded-xl px-4 py-1 mb-2" >
                      {
                        sessionStorage.userid ? sessionStorage.name + ' 👏🏻' : 'User'
                      }
                    </h2>
                    <div className="px-1 space-y-1">
                      <span className="flex items-center justify-start">
                        <NavLink to={'/usereditprofile'} className="w-full cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2">Edit Profile</NavLink>
                      </span>
                      <span className="flex items-center justify-start">
                        <span className="lg:w-full sm:w-full cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2" onClick={handleLogout}>Log Out</span>
                      </span>
                    </div>
                  </div>
                </div>

              )}
            </div>
          ) : (
            <div className="space-x-4 lg:flex sm:hidden">
              <NavLink to="/login" className="lg:w-auto sm:w-auto cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2">Login</NavLink>
              <NavLink to="/register" className="lg:w-auto sm:w-auto cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2">Register</NavLink>
            </div>
          )}
        </div>
      </div>

      {showSearchResults && searchResults.length > 0 && (
        <div className="search-results mt-2 p-2 rounded-md">
          {searchResults.map((result) => (
            <NavLink
              to={`/modelcard/${result._id}`}
              key={result._id}
              onChange={handleBox}
              className="block py-1 px-2 text-black hover:bg-blue-700 hover:text-sky-100 font-bold rounded-md shadow-2xl"
            >
              {result.name}
            </NavLink>
          ))}
        </div>

      )}


      <div className={`lg:hidden w-full flex flex-row mt-4 ${isSidebarOpen ? 'block' : 'hidden'}`}>
        {
          userLoggedIn ? (
            <div className='w-full space-y-4 py-5'>
              <div className="flex-shrink-0 w-full h-auto flex-col object-fill flex justify-center items-center">
                {/* <img src={userlogo} alt="" className="object-cover cursor-auto object-center w-10 h-10 rounded" /> */}
                <h2 className="text-xl font-bold cursor-auto bg-gray-100 text-black rounded-xl px-4 py-1" >
                  {
                    sessionStorage.userid ? 'Hey.. ' + sessionStorage.name + ' 👏🏻' : 'User'
                  }
                </h2>
              </div>
              <span className="flex items-center justify-start space-x-2 space-y-1">
                <NavLink to={'/yourorders'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2"> Your Orders  </NavLink>
              </span>
              <span className="flex items-center justify-start cursor-pointer space-x-2 space-y-1">
                <NavLink to={'/usereditprofile'} className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-sky-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2">Edit Profile</NavLink>
              </span>
              <span className="flex items-center justify-start cursor-pointer space-x-2 space-y-1">
                <span className="lg:w-auto sm:w-full cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2" onClick={handleLogout}>Log Out</span>
              </span>
            </div>

          ) : (
            <div className="sm:flex flex-col w-full justify-start space-y-3 py-4">
              <NavLink to="/login" className="lg:w-auto sm:w-auto cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2">Login</NavLink>
              <NavLink to="/register" className="lg:w-auto sm:w-auto cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center ml-2">Register</NavLink>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default HomeNavbar;