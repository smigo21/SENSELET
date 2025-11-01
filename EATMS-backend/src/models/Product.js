const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['grains', 'vegetables', 'fruits', 'nuts', 'dairy', 'meat', 'other'],
    trim: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'ton', 'bag', 'crate', 'bunch', 'piece'],
    default: 'kg'
  },
  qualityStandards: {
    grade: {
      type: String,
      enum: ['premium', 'grade_a', 'grade_b', 'grade_c'],
      default: 'grade_a'
    },
    organic: {
      type: Boolean,
      default: false
    },
    certifications: [{
      type: String,
      trim: true
    }]
  },
  seasonalInfo: {
    isSeasonal: {
      type: Boolean,
      default: true
    },
    harvestMonths: [{
      type: String,
      enum: ['january', 'february', 'march', 'april', 'may', 'june',
             'july', 'august', 'september', 'october', 'november', 'december']
    }],
    peakSeason: {
      startMonth: String,
      endMonth: String
    }
  },
  marketData: {
    averagePrice: {
      type: Number,
      min: 0
    },
    priceRange: {
      min: Number,
      max: Number
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Government',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
productSchema.index({ name: 1, category: 1 });
productSchema.index({ category: 1, isActive: 1 });

// Virtual for formatted price
productSchema.virtual('formattedAveragePrice').get(function() {
  return this.marketData?.averagePrice ? `$${this.marketData.averagePrice.toFixed(2)}` : 'N/A';
});

// Static method to get active products
productSchema.statics.getActiveProducts = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to get products by category
productSchema.statics.getProductsByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Instance method to update market price
productSchema.methods.updateMarketPrice = function(newPrice, newMin, newMax) {
  this.marketData.averagePrice = newPrice;
  this.marketData.priceRange.min = newMin;
  this.marketData.priceRange.max = newMax;
  this.marketData.lastUpdated = new Date();
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
