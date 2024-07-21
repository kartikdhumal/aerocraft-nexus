import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quantity: {
    type: Number,
    required: true
  }
})


const Cart = mongoose.model('Cart', cartSchema);
export default Cart;