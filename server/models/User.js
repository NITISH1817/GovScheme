import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: [
      'Citizen', 
      'Super Admin', 
      'State Admin', 
      'Ministry Admin', 
      'District Officer', 
      'Data Entry Operator',
      'Nodal Officer'
    ], 
    default: 'Citizen' 
  },
  
  // Detailed Citizen Profile for AI & Eligibility Engine
  profile: {
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Transgender', 'Other'] },
    annualIncome: { type: Number, default: 0 },
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST'] },
    state: { type: String },
    district: { type: String },
    education: { type: String },
    occupation: { type: String },
    disability: { type: Boolean, default: false },
    familySize: { type: Number, default: 1 },
    landOwnership: { type: Number, default: 0 }, // in acres
  },

  isActive: { type: Boolean, default: true },
  
  // OTP Verification
  otpTokens: {
    email: { token: String, expires: Date },
    mobile: { token: String, expires: Date }
  },
  
  // Security & Authentication
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  // Session & Device Tracking
  loginHistory: [{
    ipAddress: { type: String },
    device: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['Success', 'Failed'] }
  }],
  activeSessions: [{
    sessionId: { type: String },
    device: { type: String },
    ipAddress: { type: String },
    lastActive: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
