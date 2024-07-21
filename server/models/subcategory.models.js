import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  id: {
    type: String,
    unique: false,
    required: true,
  },
  name: {
    type: String,
    unique: false,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
export default Subcategory;