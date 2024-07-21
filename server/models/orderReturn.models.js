import mongoose from 'mongoose';

const orderReturnSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders',
    required: true,
  }
})


const OrderReturn = mongoose.model('OrderReturn', orderReturnSchema);
export default OrderReturn;