import React, { useEffect, useState } from 'react'
import nologo from '../images/nologo.png'
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';

function Footer() {
  const [categoryData, setCategoryData] = useState();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/categories');
      setCategoryData(response.data.categories);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  return (
    <section className="bg-black">
    <div className="max-w-screen-xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
      <div className="flex justify-center mt-8 space-x-6">
        <span className="text-sky-100 hover:text-sky-200">
          <span className="sr-only">Linkedin</span>
          <div className="w-6 h-6">
            <a href="https://kartikdhumal.vercel.app" className='font-bold' target="_blank">
             <LinkedInIcon/>
            </a>
          </div>
        </span>
        <div className="text-sky-100 hover:text-sky-200">
          <span className="sr-only">Instagram</span>
          <div className="w-6 h-6">
            <a href="https://www.instagram.com/kartik_dhumal._/" className='font-bold' target="_blank">
              <InstagramIcon/>
            </a>
          </div>
        </div>
        <span className="text-sky-100 hover:text-sky-200">
          <span className="sr-only">GitHub</span>
          <div className="w-6 h-6">
            <a href="https://github.com/kartikdhumal/kartikdhumal" className='font-bold' target="_blank">
              <GitHubIcon/>
            </a>
          </div>
        </span>
      </div>
      <p className="text-base leading-6 text-center text-sky-100">
        ©2024 Aerocraft Nexus, Inc. All rights reserved.
      </p>
      <p className="text-base text-center text-sky-100">
        Developed by <a href="https://kartikdhumal.vercel.app" className='font-bold' target="_blank">Kartik Dhumal</a>
      </p>
    </div>
  </section>  
  )
}

export default Footer
