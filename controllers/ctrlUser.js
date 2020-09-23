const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find({});

  res.status(200).send({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.getUserById = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

// User update of own user data
exports.updateMe = catchAsync(async (req, res, next) => {
  // User cannot post password here
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Use updateMyPassword',
        400
      )
    );
  }
  // Update user document, only updating allowed fields
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// User route to inactivate account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    { new: true, runValidators: true }
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
