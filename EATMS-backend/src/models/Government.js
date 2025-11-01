const mongoose = require('mongoose');

const governmentSchema = new mongoose.Schema({
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
    default: 'government'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['agriculture', 'trade', 'transport', 'finance', 'statistics']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  clearanceLevel: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced', 'executive'],
    default: 'basic'
  },
  jurisdiction: {
    regions: [{
      type: String,
      trim: true
    }],
    districts: [{
      type: String,
      trim: true
    }]
  },
  permissions: {
    canViewAnalytics: {
      type: Boolean,
      default: true
    },
    canGenerateReports: {
      type: Boolean,
      default: true
    },
    canMonitorPrices: {
      type: Boolean,
      default: true
    },
    canTrackShipments: {
      type: Boolean,
      default: true
    },
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canAccessFinancialData: {
      type: Boolean,
      default: false
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
  lastLogin: {
    type: Date,
    default: null
  },
  activityLog: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
governmentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Instance method to check password
governmentSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to log activity
governmentSchema.methods.logActivity = function(action, details = {}) {
  this.activityLog.push({
    action,
    details,
    timestamp: new Date()
  });

  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }

  return this.save();
};

module.exports = mongoose.model('Government', governmentSchema);
