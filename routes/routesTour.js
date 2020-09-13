const { default: consolaGlobalInstance } = require('consola');
const console = require('consola');
const express = require('express');

const router = express.Router();

const {
  checkId,
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
} = require('../controllers/ctrlTour');

router.param('id', checkId);

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = router;
