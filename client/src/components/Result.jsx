import React from 'react'
import Pagenotfound from './Pagenotfound'
import { Route, Routes } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import SendEmail from './SendEmail'
import OTP from './OTP'
import ChangePassword from './ChangePassword'
import Home from './Home'
import Admin from './Admin'
import AddUsers from './AddUsers'
import AddCat from './AddCat'
import AddSubCat from './AddSubCat'
import AddCom from './AddCom'
import AddMod from './AddMod'
import Orders from './Orders'
import Reports from './Reports'
import EditCategory from './EditCategory'
import EditSubcategory from './EditSubcategory'
import EditCompany from './EditCompany'
import EditModel from './EditModel'
import Notifications from './Notifications'
import UserEditProfile from './UserEditProfile'
import ModelCard from './ModelCard'
import Cart from './Cart'
import CheckOut from './CheckOut'
import ModelByCategory from './ModelByCategory'
import ModelByCompany from './ModelByCompany'
import ModelByModel from './ModelByModel'
import YourOrders from './YourOrders'
import AdminUserProfile from './AdminUserProfile'
function Result() {
  return (
     <div className='result'>
        <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<SendEmail/>} />
        <Route path="/otp" element={<OTP/>} />
        <Route path="/changepassword" element={<ChangePassword/>} />
        <Route path="/" element={<Home/>} />
        <Route path="/admin" element={<Admin/>} />
        <Route path="/adduser" element={<AddUsers/>} />
        <Route path="/addcat" element={<AddCat/>} />
        <Route path="/addsubcat" element={<AddSubCat/>} />
        <Route path="/addcom" element={<AddCom/>} />
        <Route path="/addmod" element={<AddMod/>} />
        <Route path="/orders" element={<Orders/>} />
        <Route path="/reports" element={<Reports/>} />
        <Route path="/editcategory" element={<EditCategory/>} />
        <Route path="/editsubcategory" element={<EditSubcategory/>} />
        <Route path="/editcompany" element={<EditCompany/>} />
        <Route path="/editmodel" element={<EditModel/>} />
        <Route path="/notifications" element={<Notifications/>} />
        <Route path="/usereditprofile" element={<UserEditProfile/>} />
        <Route path="/addtocart" element={<Cart/>} />
        <Route path="/modelcard/:id" element={<ModelCard/>} />
        <Route path="/checkout" element={<CheckOut/>} />
        <Route path="/modelbycategory/:id" element={<ModelByCategory/>} />
        <Route path="/modelbycompany/:id" element={<ModelByCompany/>} />
        <Route path="/allmodels" element={<ModelByModel/>} />
        <Route path="/yourorders" element={<YourOrders/>} />
        <Route path="/adminuserprofile" element={<AdminUserProfile/>} />
        <Route path="*" element={<Pagenotfound />} />
        </Routes>
     </div>
  )
}

export default Result
