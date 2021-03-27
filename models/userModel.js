const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    // Will have different names depending on the website - e.g community would have contributer or moderator
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE & SAVE, whenever we want to update a user,
      // we must also therefore use save
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// Document middleware for presave
// We want to encrypt the data between the receiving of data, and sending it to the db.
// This will handle both creation and updating of password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  // hash / hashing / encrypting password with a coast of 12.
  // costing increases the complex computation for encrypting the password
  // 12 is good for today, in the future it will be higher.
  this.password = await bcrypt.hash(this.password, 12);

  // dont persist into database - only needed during password input
  this.passwordConfirm = undefined;
  next();
});

// We want to set passwordChangedAt after password reset is complete
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  // JWT may take a little bit of time to create the token, so we need to set this back
  // by atleast a second so it wont break the token
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query middleware
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance method
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfterTokenIssued = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Encrypt the resetToken as we want it to be useless if stolen from the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  // 10 minutes till token expires (60 for seconds, 1000 for milliseconds)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
