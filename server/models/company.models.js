import mongoose from 'mongoose';


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

const Company = mongoose.model('Company', companySchema);
export default Company;