const express = require('express');

const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../controllers/ctrlUser');

const {
  signup,
  login,
  forgotPassword,
  protect,
  resetPassword,
  updateMyPassword,
} = require('../controllers/ctrlAuth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updateMyPassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = router;
