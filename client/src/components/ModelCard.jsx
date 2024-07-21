import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import HomeNavbar from './HomeNavbar';
import user from '../images/userlogo.png'
import { useCountContext } from '../context/CartContext';
import { Skeleton, Stack } from '@mui/material';
import { toast } from 'react-toastify'

function ModelCard() {
    const { id } = useParams();
    const { add } = useCountContext();
    const [modelData, setModelData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [subcategoryData, setSubcategoryData] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoaded, setisLoaded] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [userData, setUserData] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderDetailsData, setOrderDetails] = useState([]);

    useEffect(() => {
        fetchModelData();
        fetchReviews();
        fetchCompanies();
        fetchCategories();
        findSubcategories();
        fetchOrders();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchModelData = async () => {
        try {
            const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/getmodel/${id}`);
            setModelData(response.data.model);
            setisLoaded(false);
        } catch (error) {
            console.error('Error fetching model data:', error);
            setLoading(false)
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/users');
            setUserData(response.data.users);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/categories');
            setCategories(response.data.categories);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    const findSubcategories = async () => {
        try {
            const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/subcategories');
            setSubcategoryData(response.data.subcategories);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/companies');
            setCompanies(response.data.companies);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/getorders');
            setOrders(response.data.orders);
            setOrderDetails(response.data.orderDetails);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/reviews/${id}`);
            setReviews(response.data.reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setLoading(false);
        }
    };

    const handleDecrease = () => {
        setQuantity(quantity - 1);
        if (quantity < 2) {
            setQuantity(1);
        }
    };

    const handleIncrease = () => {
        setQuantity(quantity + 1);
        if (quantity > 9) {
            toast.warning("You can buy up to a maximum of 10 items");
            setQuantity(10);
        }
    };

    const handleFeedbackChange = (event) => {
        setFeedback(event.target.value);
    };



    const handleSubmitFeedback = async () => {
        if (!sessionStorage.userid) {
            toast.warning('You need to login to give feedback!!');
            return;
        }
        if (!rating || !feedback) {
            toast.warning('Please provide both rating and feedback.');
            return;
        }

        const hasBoughtModel = orders.find(order => {
            const orderDetail = orderDetailsData.find(detail => detail.orderId === order._id && detail.modelId === id);
            return order.userId === sessionStorage.userid && orderDetail;
        });

        if (!hasBoughtModel) {
            toast.error("You have not bought this product. You can't add a review.");
            setRating(0);
            setFeedback('');
            return;
        }

        try {
            const response = await axios.post('https://aerocraftnexusserver.vercel.app/api/addreview', {
                userId: sessionStorage.userid,
                modelId: id,
                rate: rating,
                feedback: feedback
            });
            toast.success(response.data.message);
            setRating(0);
            setFeedback('');
            fetchReviews();
        } catch (error) {
            console.error('Error adding review:', error);
            toast.error('You can give a maximum of one review');
            setRating(0);
            setFeedback('');
            fetchReviews();
        }
    };


    const handleRatingChange = (selectedRating) => {
        if (selectedRating === rating) {
            setRating(0);
        } else {
            setRating(selectedRating);
        }
    };

    const handleDeleteReview = async (id) => {
        try {
            const response = await axios.delete(`https://aerocraftnexusserver.vercel.app/api/deletereviews/${id}`);
            toast.success('Review deleted successfully');
            fetchReviews();
            setReviews(reviews.filter(review => review._id !== id));
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const handleCart = async () => {
        if (!sessionStorage.userid) {
            const cartItem = {
                modelId: id,
                name: modelData.name,
                image: modelData.images[0],
                price: modelData.price,
                quantity: quantity,
            };
            let sessionCart = JSON.parse(sessionStorage.getItem('sessionCart')) || [];
            const existingItemIndex = sessionCart.findIndex(item => item.modelId === id);
            if (existingItemIndex !== -1) {
                toast.error('Model already exists in the cart');
                return;
            }
            sessionCart.push(cartItem);
            sessionStorage.setItem('sessionCart', JSON.stringify(sessionCart));
            add()
            toast.success('Item added to cart');
        }

        else if (modelData.quantity < 1) {
            toast.warning('Out of stock');
            return;
        }
        else if (quantity > modelData.quantity) {
            toast.warning(`Insufficient Quantity Available. We only have ${modelData.quantity} products in stock. Please adjust your quantity accordingly`);
            return;
        }
        else {
            try {
                const myuserId = sessionStorage.userid;
                const response = await axios.post('https://aerocraftnexusserver.vercel.app/api/addtocart', {
                    modelId: id,
                    quantity: quantity,
                    userId: myuserId
                });

                if (response.status === 201) {
                    add()
                    toast.success('Item added to cart successfully');
                } else if (response.status === 400 && response.data.message === 'Already Added to cart') {
                    toast.warning('Model already exists in the cart');
                } else {
                    toast.error('Failed to add item to cart');
                }
            } catch (error) {
                console.error('Error adding item to cart:', error);
                toast.warning('Model already exists in the cart');
            }
        }
    };

    const handleImageChange = (index) => {
        setCurrentImageIndex(index);
    };

    const getUserName = (userId) => {
        const user = userData.find(user => user.id === userId);
        return user ? user.name : 'Unknown';
    };

    const subcategoryToCategoryMap = {};
    subcategoryData.forEach(subcategory => {
        const category = categories.find(category => category.id === subcategory.categoryId);
        if (category) {
            subcategoryToCategoryMap[subcategory._id] = category.name;
        }
    });

    const getTimeAgo = (date) => {
        const currentDate = new Date();
        const previousDate = new Date(date);
        const timeDifference = currentDate - previousDate;
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''} ago`;
        } else if (months > 0) {
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
        }
    };
    return (
        <div className='bg-sky-100'>
            <HomeNavbar />
            <div className="mx-auto px-2 overflow-hidden pt-32 scroll-m-0">
                {!modelData ? (
                    <div className="rounded-lg overflow-hidden lg:flex-row sm:flex-col flex">
                        <div className='lg:w-[50%] sm:w-[100%] px-5'>
                            <Skeleton variant="rectangular" height={384} width={'100%'} />
                            <div className="thumbnail-slider flex flex-row items-center justify-center mt-4">
                                {[...Array(2)].map((_, index) => (
                                    <Skeleton key={index} variant="rectangular" height={48} width={48} className="m-2" />
                                ))}
                            </div>
                        </div>
                        <div className="details lg:w-[60%] sm:w-[100%] px-10">
                            <Skeleton height={40} width={'80%'} className="mb-4" />
                            <Skeleton height={30} width={'40%'} className="mb-4" />
                            <Skeleton height={20} width={'60%'} className="mb-4" />
                            <Skeleton height={60} width={'90%'} className="mb-4" />
                            <Skeleton height={40} width={'60%'} className="mt-4" />
                            <Skeleton height={140} width={500} />
                            <Skeleton height={75} width={100} />
                        </div>
                        <div className='shadow-lg lg:w-[60%] sm:w-[100%] p-12'>
                            <div className='flex justify-center items-center flex-col'>
                            <Skeleton height={40} width={'30%'} className="mb-4" />
                                <div className='flex justify-around items-center'>
                                    <Skeleton height={70} width={50} className='mr-3'/>
                                    <Skeleton height={50} width={30} className='mr-3'/>
                                    <Skeleton height={70} width={50} className='mr-3'/>
                                </div>
                                <Skeleton height={75} width={200} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg overflow-hidden lg:flex-row sm:flex-col flex">
                        <div className='lg:w-[50%] sm:w-[100%] px-5'>
                            <div className="image-slider flex justify-center items-center">
                                <img src={modelData.images[currentImageIndex]} alt="Product" className="w-full h-96" />
                            </div>
                            <div className="thumbnail-slider flex flex-row items-center justify-center mt-4">
                                {modelData.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Thumbnail ${index}`}
                                        className={`w-12 h-12 m-2 cursor-pointer ${index === currentImageIndex ? 'border border-black' : ''}`}
                                        onClick={() => handleImageChange(index)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="details lg:w-[60%] sm:w-[100%] px-10">
                            <h2 className="text-[30px] font-bold mb-2 pt-5">{modelData.name}</h2>
                            <p className="mb-2 font-bold text-2xl">
                                <CurrencyRupeeIcon fontSize="50px" /> {modelData.price}
                            </p>
                            <p className="text-gray-700 uppercase py-5 mb-2">
                                {companies.find(company => company.id === modelData.companyId)?.name || '-'}{' '}
                                {subcategoryToCategoryMap[modelData.subcategoryId] || '-'}{' '}
                                {subcategoryData.find(subcategory => subcategory._id === modelData.subcategoryId)?.name || '-'}
                            </p>
                            <p className="text-gray-600 mb-2 pb-5">{modelData.description}</p>
                            <p>
                                {modelData.quantity > 0 ? (
                                    <button className='bg-green-700 text-white px-4 py-2 font-bold rounded-lg'>In stock</button>
                                ) : (
                                    <button className='bg-red-700 text-white px-4 py-2 font-bold rounded-lg'>Out of stock</button>
                                )}
                            </p>
                        </div>
                        <div className='shadow-lg lg:w-[40%] sm:w-[100%] p-4'>
                            <div className="mt-4 sm:justify-center h-60 sm:items-center sm:flex sm:flex-col">
                                <div className='flex justify-center items-center flex-col'>
                                    <p className='text-xl font-bold text-blue-700'>Price: <CurrencyRupeeIcon fontSize="50px" /> {quantity * modelData.price}</p>
                                    <p>(Inclusive of all taxes)</p>
                                </div>
                                {modelData && modelData.quantity > 0 ? (
                                    <>
                                        <div className='pt-5'>
                                            <button onClick={handleDecrease} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg mr-2">-</button>
                                            <span className="px-4 py-2 font-semibold text-xl text-blue-700">{quantity}</span>
                                            <button onClick={handleIncrease} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg ml-2">+</button>
                                        </div>
                                        <button onClick={handleCart} className="w-auto mt-5 flex justify-center text-md items-center py-2 px-10 gap-x-2 font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">Add to Cart</button>
                                    </>
                                ) : (
                                    <p className="text-red-500">Out of stock</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className='mt-14'>
                    <div className='w-full lg:justify-evenly p-5 border-green-600 flex lg:flex-row sm:flex-col'>
                        <div className="lg:w-[35%] sm:w-full flex bg-gray-100 shadow-md rounded-lg my-3 px-4 py-4 justify-center">
                            <div className="tracking-wide px-4 py-4">
                                <h2 className="text-gray-800 text-lg text-center py-3 font-bold mt-1">
                                    {reviews ? (
                                        reviews.length === 1 ? `${reviews.length} Review` : 'Reviews'
                                    ) : null}
                                </h2>
                                <div className="mx-8 px-8 pb-3">
                                    {[...Array(5)].map((_, index) => {
                                        const ratingCount = reviews.filter(review => review.rate === (index + 1)).length;
                                        const percentage = ratingCount > 0 ? ((ratingCount / reviews.length) * 100).toFixed(0) : 0;

                                        return (
                                            <div key={index} className="flex items-center mt-1">
                                                <div className="text-gray-700 pl-3 w-24 mr-2 text-right">
                                                    <span className="text-sm">{percentage}%</span>
                                                </div>
                                                {[...Array(index + 1)].map((_, starIndex) => (
                                                    <div key={starIndex} className="flex items-center mx-1">
                                                        <StarIcon className="text-yellow-400 cursor-pointer" />
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-[35%] sm:w-full">
                            <div className="review mt-4 rounded-xl bg-gray-100 shadow-md max-w-md mx-auto">
                                <h3 className="text-xl font-semibold mb-4 text-center">Customer Reviews</h3>
                                <div className="rating mb-4 text-center">
                                    {[...Array(5)].map((_, index) => (
                                        <StarIcon
                                            key={index}
                                            className={`cursor-pointer ${index < rating ? 'text-yellow-400' : ''}`}
                                            onClick={() => handleRatingChange(index + 1)}
                                        />
                                    ))}
                                </div>
                                <textarea
                                    placeholder="Write your feedback here..."
                                    value={feedback}
                                    onChange={handleFeedbackChange}
                                    className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring focus:border-blue-500"
                                    style={{ minHeight: '120px' }}
                                ></textarea>
                                <button
                                    onClick={handleSubmitFeedback}
                                    className="w-full my-4 cursor-pointer flex justify-center items-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 rounded-lg text-md px-4 py-2 font-bold text-center"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModelCard;
