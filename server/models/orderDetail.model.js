import mongoose from 'mongoose';

const ordersDetailsSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model',
    required: true,
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  ordersId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders',
    required: true,
  }
})


const OrdersDetails = mongoose.model('OrdersDetails', ordersDetailsSchema);
export default OrdersDetails;