const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
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
    default: 'farmer'
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
  farmDetails: {
    size: Number, // in acres/hectares
    crops: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    irrigation: Boolean,
    organic: Boolean
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    branchCode: String
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
farmerSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for full name
farmerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Instance method to check password
farmerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Farmer', farmerSchema);
