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

licenseSchema.pre('save', async function(next) {
  if (this.isModified('domain')) {
    // Valideer domein formaat
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(this.domain)) {
      throw new Error('Ongeldig domein formaat');
    }
  }
  next();
});

export default mongoose.model('License', licenseSchema); 