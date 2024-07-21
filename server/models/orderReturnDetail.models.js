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


  const OrderReturnDetails = mongoose.model('OrderReturnDetails', orderReturnDetailSchema);
  export default OrderReturnDetails;