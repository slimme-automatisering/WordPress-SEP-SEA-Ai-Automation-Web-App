import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
  licenseKey: {
    type: String,
    required: true,
    unique: true
  },
  domain: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('License', licenseSchema); 