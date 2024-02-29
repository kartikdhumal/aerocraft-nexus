import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import axios from 'axios';

function Notifications() {
    const [modelData, setModelData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCount();
    }, []);

    const fetchCount = async () => {
        try {
            const response = await axios.get('http://localhost:2000/api/models');
            const filteredModels = response.data.models.filter(model => model.quantity == 0);
            setModelData(filteredModels);
            setIsLoading(false);
        } catch (error) {
            console.error('There was a problem with fetching models:', error);
        }
    };

    return (
        <div className='bg-sky-100 min-h-screen'>
            <AdminNavbar />
            <div className="w-46 bg-[#1c92d2] left-0 m-5 overflow-y-auto z-10 rounded-xl print:hidden">
                <div className='w-auto'>
                    {isLoading ? (
                       <div className="card rounded-lg px-10 py-10 flex justify-center bg-gray-200 text-gray-700 text-xl items-center font-bold border-2 border-gray-400"> <p>Loading...</p> </div>
                    ) : (
                        modelData.length === 0 ? (
                            <div className="card rounded-lg px-10 py-10 flex justify-center bg-gray-200 text-gray-700 text-xl items-center font-bold border-2 border-gray-400">  <p>No notifications</p> </div>
                        ) : (
                            <div>
                                <p className="card rounded-lg px-10 py-2 flex justify-center bg-red-500 text-sky-100 text-xl items-center font-bold border-2 border-gray-400">Out of stock models </p>
                                {modelData.map((model) => (
                                    model.quantity == 0 && (
                                        <div key={model.id} className="bg-sky-100 border-2 border-black my-4 text-white p-4 mb-4 rounded-lg">
                                            <h3 className="text-lg text-blue-600 font-bold">{model.name}</h3>
                                            <div className="flex flex-wrap mt-2 text-blue-600">
                                                {model.images.map((image, index) => (
                                                    <img key={index} src={image} alt={`Image ${index + 1}`} className="w-20 h-20 mr-2 mb-2" />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default Notifications;
