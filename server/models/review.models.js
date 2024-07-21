import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rate: {
    type: Number,
    required: true
  },
  feedback: {
    type: String,
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now
  }
})


const Review = mongoose.model('Review', reviewSchema);
export default Review;