import cors from 'cors';
import express from 'express'
import 'dotenv/config'
import cartRoutes from './routers/cart.router.js'
import categoryRoutes from './routers/category.router.js'
import companyRoutes from './routers/company.router.js'
import modelRoutes from './routers/model.router.js'
import OrderRoutes from './routers/order.router.js'
import OrderDetailRoutes from './routers/orderdetails.router.js'
import OrderReturnRoutes from './routers/orderreturn.router.js'
import ReviewsRoutes from './routers/reviews.router.js'
import SubcategoryRoutes from './routers/subcategory.router.js'
import HomeRoutes from './routers/home.router.js'
import UserRoutes from './routers/user.router.js'
import { connectDB } from './db/connect.js'

const app = express();
const PORT = process.env.PORT || 6005;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})

connectDB();

app.use('/', HomeRoutes);
app.use('/api', UserRoutes);
app.use('/api', SubcategoryRoutes);
app.use('/api', ReviewsRoutes);
app.use('/api', OrderReturnRoutes);
app.use('/api', OrderDetailRoutes);
app.use('/api', OrderRoutes);
app.use('/api', modelRoutes);
app.use('/api', companyRoutes);
app.use('/api', categoryRoutes);
app.use('/api', cartRoutes);