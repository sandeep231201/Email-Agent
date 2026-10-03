const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      minlength: 8,
    },
    name: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleAccessToken: String,
    googleRefreshToken: String,
    outlookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    outlookAccessToken: String,
    outlookRefreshToken: String,
    emailProvider: {
      type: String,
      enum: ['none', 'gmail', 'outlook'],
      default: 'none',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    apiUsage: {
      requestCount: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleAccessToken;
  delete obj.googleRefreshToken;
  delete obj.outlookAccessToken;
  delete obj.outlookRefreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
