// const consola = require('consola');
const express = require('express');

const { protect, restrictTo } = require('../controllers/ctrlAuth');

const router = express.Router();

const {
  // checkBody,
  // checkId,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
} = require('../controllers/ctrlTour');

// router.param('id', checkId);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
