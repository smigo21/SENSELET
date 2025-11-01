const mongoose = require('mongoose');

const transporterSchema = new mongoose.Schema({
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
    default: 'transporter'
  },
  businessInfo: {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true
    },
    licenseNumber: String,
    insurancePolicy: String
  },
  vehicleInfo: [{
    vehicleType: {
      type: String,
      enum: ['truck', 'pickup', 'motorcycle', 'bicycle'],
      required: true
    },
    capacity: {
      weight: Number, // in kg
      volume: Number // in cubic meters
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true
    },
    model: String,
    year: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  operatingAreas: [{
    region: String,
    district: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  }],
  serviceTypes: [{
    type: String,
    enum: ['local_delivery', 'regional_transport', 'international_shipping']
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on_trip'],
    default: 'active'
  },
  currentLocation: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    maxDistance: {
      type: Number, // in km
      default: 500
    },
    preferredCommodities: [{
      type: String,
      trim: true
    }],
    workingHours: {
      start: String, // HH:MM format
      end: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
transporterSchema.index({ 'operatingAreas.coordinates': '2dsphere' });
transporterSchema.index({ 'currentLocation.coordinates': '2dsphere' });

// Virtual for full name
transporterSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for active vehicles count
transporterSchema.virtual('activeVehiclesCount').get(function() {
  return this.vehicleInfo.filter(vehicle => vehicle.isActive).length;
});

// Instance method to check password
transporterSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Transporter', transporterSchema);
