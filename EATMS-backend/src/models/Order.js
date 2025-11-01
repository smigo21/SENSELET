const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'buyerModel'
  },
  buyerModel: {
    type: String,
    required: true,
    enum: ['Trader', 'Government']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Farmer'
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'ton', 'bag', 'crate', 'bunch', 'piece']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    qualityGrade: {
      type: String,
      enum: ['premium', 'grade_a', 'grade_b', 'grade_c'],
      default: 'grade_a'
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled', 'disputed'],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'mobile_money', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  delivery: {
    pickupLocation: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    deliveryLocation: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transporter'
    },
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    trackingNumber: String,
    qrCode: String // URL to QR code for verification
  },
  contractTerms: {
    paymentTerms: {
      type: String,
      enum: ['immediate', 'on_delivery', 'credit_30_days', 'credit_60_days'],
      default: 'on_delivery'
    },
    qualityStandards: String,
    penalties: String,
    disputeResolution: String
  },
  timestamps: {
    orderedAt: {
      type: Date,
      default: Date.now
    },
    confirmedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date
  },
  notes: String,
  ratings: {
    buyerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      ratedAt: Date
    },
    sellerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      ratedAt: Date
    },
    transporterRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      ratedAt: Date
    }
  },
  disputes: [{
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'disputes.raisedByModel'
    },
    raisedByModel: {
      type: String,
      required: true,
      enum: ['Farmer', 'Trader', 'Transporter', 'Government']
    },
    reason: {
      type: String,
      required: true,
      enum: ['quality_issue', 'late_delivery', 'payment_issue', 'quantity_discrepancy', 'other']
    },
    description: String,
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'closed'],
      default: 'open'
    },
    resolution: String,
    raisedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ 'delivery.transporter': 1, status: 1 });
orderSchema.index({ status: 1, 'timestamps.orderedAt': -1 });

// Virtual for order duration
orderSchema.virtual('orderDuration').get(function() {
  if (this.timestamps.deliveredAt && this.timestamps.orderedAt) {
    return Math.ceil((this.timestamps.deliveredAt - this.timestamps.orderedAt) / (1000 * 60 * 60 * 24)); // days
  }
  return null;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${Date.now()}${count + 1}`;
  }
  next();
});

// Instance method to calculate total amount
orderSchema.methods.calculateTotal = function() {
  this.totalAmount = this.products.reduce((total, item) => total + item.totalPrice, 0);
  return this.totalAmount;
};

// Instance method to update status with timestamp
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;

  const timestampField = {
    confirmed: 'confirmedAt',
    in_transit: 'shippedAt',
    delivered: 'deliveredAt',
    cancelled: 'cancelledAt'
  }[newStatus];

  if (timestampField) {
    this.timestamps[timestampField] = new Date();
  }

  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
