import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import HomeNavbar from './HomeNavbar';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import StarIcon from '@mui/icons-material/Star';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';

function ModelByModel() {
    const { id: companyId } = useParams();
    const [subcategoryData, setSubcategoryData] = useState([]);
    const [modelData, setModelData] = useState([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);
    const [selectedReviews, setSelectedReviews] = useState([]);
    const [selectedStars, setSelectedStars] = useState([]);
    const [sortOption, setSortOption] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [companyData, setCompanyData] = useState([]);
    const [selectedCompany, setselectedCompany] = useState([]);

    useEffect(() => {
        fetchSubcategories();
        fetchModels();
        fetchReviews();
        fetchData();
    }, []);

    const [priceRanges, setPriceRanges] = useState([
        { min: 0, max: 2000 },
        { min: 2000, max: 4000 },
        { min: 4000, max: 6000 },
        { min: 6000, max: 8000 },
        { min: 8000, max: 10000 },
        { min: 10000, max: '10000+' }
    ]);

    const fetchData = async () => {
        try {
          const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/companies');
          setCompanyData(response.data.companies);
        } catch (error) {
          console.error('There was a problem with the fetch operation:', error);
        }
      };

    const fetchSubcategories = async () => {
        try {
            const response = await axios.get(`https://aerocraftnexusserver.vercel.app/api/subcategories`);
            setSubcategoryData(response.data.subcategories);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const fetchModels = async () => {
        try {
            const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/models');
            setModelData(response.data.models);
        } catch (error) {
            console.error('There was a problem with fetching models :', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get('https://aerocraftnexusserver.vercel.app/api/reviews');
            const filteredReviews = response.data.reviews;
            setReviews(filteredReviews);
        } catch (error) {
            console.error('There was a problem with fetching models :', error);
        }
    };

    const filteredModels = modelData.filter(model => {
        const subcategoryFilterPassed = selectedSubcategories.length === 0 || selectedSubcategories.includes(model.subcategoryId);
        const priceRangeFilterPassed = !selectedPriceRange || (model.price >= selectedPriceRange.min && model.price <= selectedPriceRange.max);
        const starsFilterPassed = selectedStars.length === 0 || selectedStars.includes(getModelRating(model._id));
        const reviewsFilterPassed = selectedReviews.length === 0 ||
            selectedReviews.some(selectedReview => {
                return reviews.some(review => review.modelId === model._id && review.rate === selectedReview);
            });
        const companyFilterPassed = selectedCompany.length === 0 || selectedCompany.includes(model.companyId);
        return subcategoryFilterPassed && priceRangeFilterPassed && reviewsFilterPassed && starsFilterPassed && companyFilterPassed;
    });


    const handleSubcategorySelect = (subcategoryId) => {
        if (selectedSubcategories.includes(subcategoryId)) {
            setSelectedSubcategories(selectedSubcategories.filter(item => item !== subcategoryId));
        } else {
            setSelectedSubcategories([...selectedSubcategories, subcategoryId]);
        }
    };

    const handleCompanySelect  = (companyId) => {
        if (selectedCompany.includes(companyId)) {
            setselectedCompany(selectedCompany.filter(item => item !== companyId));
        } else {
            setselectedCompany([...selectedCompany, companyId]);
        }
    }

    const handleClearFilters = () => {
        setSelectedSubcategories([]);
        setSelectedPriceRange(null);
        setSelectedReviews([]);
        setSelectedStars([]);
        setselectedCompany([]);
        setSortOption(null);
        document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
            checkbox.checked = false;
        });
        document.querySelectorAll('input[type="radio"]').forEach((radio) => {
            radio.checked = false;
        });
    };

    const handlePriceRangeChange = (range) => {
        setSelectedPriceRange(range);
    };

    const handleReviewSelect = (rating) => {
        if (selectedReviews.includes(rating)) {
            setSelectedReviews(selectedReviews.filter(item => item !== rating));
        } else {
            setSelectedReviews([...selectedReviews, rating]);
        }
    };


    const handleSortChange = (option) => {
        setSortOption(option);
    };

    const sortByPrice = (a, b) => {
        if (sortOption === 'lowToHigh') {
            return a.price - b.price;
        } else if (sortOption === 'highToLow') {
            return b.price - a.price;
        }
        return 0;
    };

    const getModelRating = (modelId) => {
        const modelReviews = reviews.filter(review => review.modelId === modelId);
        if (modelReviews.length > 0) {
            const totalRating = modelReviews.reduce((acc, curr) => acc + curr.rate, 0);
            return totalRating / modelReviews.length;
        }
        return 0;
    };

    const sortedModels = [...filteredModels].sort(sortByPrice);

    return (
        <div className='bg-sky-100 min-h-screen'>
            <HomeNavbar />
            <div className="p-5 relative">
                <div className="lg:hidden">
                    <MenuIcon
                        className="h-6 w-6 fill-current text-[#1c92d2] font-bold my-2 z-50"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-row gap-5">
                    <div className={`lg:flex lg:flex-col sidebar absolute lg:relative ${isSidebarOpen ? 'sm:block' : 'sm:hidden'} rounded-xl border-2 border-black py-5 px-5 sm:px-5 sm:py-2 w-full lg:w-[20%] sm:w-auto bg-gray-100 z-40`}>
                        <h3 className="text-lg flex justify-center items-center lg:flex-row sm:flex-col font-semibold mb-4">Filters
                            <button onClick={handleClearFilters} className="text-sm bg-[#1c92d2] px-1 rounded-xl mx-3 my-2 py-1 text-white focus:outline-none">Clear Filters</button>
                        </h3>
                        <div>
                            <h4 className="text-md font-semibold mb-2">Model By Company</h4>
                            {companyData.map(company => (
                                <div key={company.id}>
                                    <input
                                        type="checkbox"
                                        id={company.id}
                                        value={company.name}
                                        onChange={() => handleCompanySelect(company.id)}
                                    />
                                    <label htmlFor={company.id} className="ml-2">{company.name}</label>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4 className="text-md font-semibold mb-2">Model By Type</h4>
                            {subcategoryData.map(subcategory => (
                                <div key={subcategory._id}>
                                    <input
                                        type="checkbox"
                                        id={subcategory._id}
                                        value={subcategory.name}
                                        onChange={() => handleSubcategorySelect(subcategory._id)}
                                    />
                                    <label htmlFor={subcategory._id} className="ml-2">{subcategory.name}</label>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4 className="text-md font-semibold my-2">Model By Price</h4>
                            {priceRanges.map((range, index) => (
                                <div key={index}>
                                    <input
                                        type="radio"
                                        id={`priceRange${index}`}
                                        checked={selectedPriceRange && selectedPriceRange.min === range.min && selectedPriceRange.max === range.max}
                                        name="priceRange"
                                        value={`${range.min}-${range.max}`}
                                        onChange={() => handlePriceRangeChange(range)}
                                    />
                                    <label htmlFor={`priceRange${index}`} className="ml-2">{`${range.min} - ${range.max}`}</label>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4 className="text-md font-semibold my-2">Sort By Price</h4>
                            <p>
                                <input
                                    type="radio"
                                    id="lowToHigh"
                                    name="priceSort"
                                    value="lowToHigh"
                                    onChange={() => handleSortChange('lowToHigh')}
                                />
                                <label htmlFor="lowToHigh" className="ml-2">Price: Low to High</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    id="highToLow"
                                    name="priceSort"
                                    value="highToLow"
                                    onChange={() => handleSortChange('highToLow')}
                                />
                                <label htmlFor="highToLow" className="ml-2">Price: High to Low</label>
                            </p>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold my-2">Model By Reviews</h4>
                            {[1, 2, 3, 4, 5].map((rating, index) => (
                                <p key={index}>
                                    <input
                                        type="checkbox"
                                        className='mx-1'
                                        id={`checkbox-${rating}`}
                                        value={rating}
                                        onChange={() => handleReviewSelect(rating)}
                                    />
                                    {[...Array(rating)].map((_, starIndex) => (
                                        <StarIcon key={starIndex} className="text-yellow-400 cursor-pointer" />
                                    ))}
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-5 w-auto lg:h-[100%] sm:h-full z-0">
                        {sortedModels.map((model) => (
                            <div key={model._id} className='sm:w-48 vsm:w-36 lg:w-60'>
                                <NavLink to={`/modelcard/${model._id}`} className="block border-2 border-gray-200">
                                    <img src={model.images[0]} className='lg:w-full h-40 object-fill rounded-t-xl sm:w-full' alt="Product" />
                                    <div className="p-4 bg-white rounded-b-xl">
                                        <p className="text-md font-semibold sm:text-sm">
                                            {model.name.length > 20 ? `${model.name.substring(0, 25)}...` : model.name}
                                        </p>
                                        <p className="text-gray-600 mt-2 text-md flex items-center"><CurrencyRupeeIcon />{model.price}</p>
                                    </div>
                                </NavLink>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModelByModel;
