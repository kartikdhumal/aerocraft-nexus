const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: false,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    unique: false,
    required: true,
  },
  role: {
    type: String,
    required: true
  }
},
  { timestamps: true }
);

const categorySchema = new mongoose.Schema({
  id: {
    type: String,
    unique: false,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
});

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

const companySchema = new mongoose.Schema({
  id: {
    type: String,
    unique: false,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
});

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

const orderReturnDetailSchema = new mongoose.Schema({
  orderReturnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderReturn',
    required: true,
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model',
    required: true,
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  }
})

const User = mongoose.model("User", userSchema);
const Category = mongoose.model("Category", categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);
const Company = mongoose.model('Company', companySchema);
const Model = mongoose.model('Model', modelSchema);
const Orders = mongoose.model('Orders', orderSchema);
const OrdersDetails = mongoose.model('OrdersDetails', ordersDetailsSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Review = mongoose.model('Review', reviewSchema);
const OrderReturn = mongoose.model('OrderReturn', orderReturnSchema);
const OrderReturnDetails = mongoose.model('OrderReturnDetails', orderReturnDetailSchema);
module.exports = { User, Category, Subcategory, Company, Model, Orders, OrdersDetails, Cart, Review, OrderReturn, OrderReturnDetails };