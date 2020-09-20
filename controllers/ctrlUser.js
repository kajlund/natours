const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

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
