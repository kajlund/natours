const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const consola = require('consola');
const gravatar = require('gravatar');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, 'A user must have an email address'],
      unique: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'A user must provide a password'],
      minlength: [8, 'A password must be 8 chars or longer'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Password confirmation must be provided'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
    },
    avatar: String,
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

// Filter out inactive users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('avatar')) {
    this.avatar = gravatar.url(this.email, { s: '200', r: 'pg', d: 'mm' });
  }
  next();
});

// Hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Update passwordChangedAt only when changed on existing docs
// This is critical for disabling JWTs with a password change
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date() - 1000; // Subract a sec so that a newly created JWT doesn't fail
  next();
});

userSchema.methods.passwordMatch = async function (pwd1, pwd2) {
  return await bcrypt.compare(pwd1, pwd2);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  consola.info({ token });
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  consola.info(this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins
  return token;
};

module.exports = mongoose.model('User', userSchema);
