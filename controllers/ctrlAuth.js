const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(user.id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
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

  const token = signToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
