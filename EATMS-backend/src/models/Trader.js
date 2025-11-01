const mongoose = require('mongoose');

const traderSchema = new mongoose.Schema({
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    default: 'trader'
  },
  businessInfo: {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true
    },
    businessType: {
      type: String,
      enum: ['wholesaler', 'retailer', 'exporter', 'importer'],
      required: true
    },
    licenseNumber: String,
    taxId: String
  },
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    region: String,
    district: String
  },
  specialization: [{
    type: String, // e.g., 'maize', 'rice', 'beans'
    trim: true
  }],
  tradingRadius: {
    type: Number, // in kilometers
    default: 50
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    branchCode: String
  },
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String, // URLs to uploaded documents
    documentType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  preferences: {
    paymentMethods: [{
      type: String,
      enum: ['cash', 'mobile_money', 'bank_transfer']
    }],
    deliveryOptions: [{
      type: String,
      enum: ['pickup', 'delivery']
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
traderSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for full name
traderSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Instance method to check password
traderSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Trader', traderSchema);
