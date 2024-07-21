import mongoose from 'mongoose';


const modelSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
  }],

  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
});


const Model = mongoose.model('Model', modelSchema);
export default Model;