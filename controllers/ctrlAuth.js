const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

const jwtVerify = promisify(jwt.verify);

exports.protect = catchAsync(async (req, res, next) => {
  const auth = req.headers.authorization;
  let token = '';
  if (auth && auth.startsWith('Bearer')) {
    token = auth.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Log in to get access', 401));
  }

  // Verify token
  const decoded = await jwtVerify(token, process.env.JWT_SECRET);

  // Verify that user still exists
  const loginUser = await User.findById(decoded.id);
  if (!loginUser) {
    return next(
      new AppError('The user this token belonged to does no longer exist', 401)
    );
  }
  if (loginUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password changed. The token has expired', 401));
  }
  // Grant access to protected route
  req.user = loginUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('User not authorized for this action.', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(`Email ${email} is not registered`, 404));
  }
  // Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // email user
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.
  
  This token is valid for 10 mins. If you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message,
    });
    return res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email' });
  } catch (err) {
    consola.error(err);
    user.createPasswordResetToken = undefined;
    user.createPasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // Runs validators
  // Login user
  createSendToken(user, 200, res);
});

// User pwd update
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (
    !user ||
    !(await user.passwordMatch(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Current password mismatch', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // Runs validators
  const savedUser = await await User.findById(req.user.id); // Re-fetch to loose pwd
  createSendToken(savedUser, 200, res);
});

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.passwordMatch(password, user.password))) {
    return next(new AppError('Faulty username and/or password', 401));
  }

  createSendToken(user, 200, res);
});
