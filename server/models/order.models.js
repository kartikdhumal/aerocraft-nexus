import mongoose from 'mongoose';


const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  delAddress: {
    type: String,
    required: true
  },
  paymentType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
})

const Orders = mongoose.model('Orders', orderSchema);
export default Orders;