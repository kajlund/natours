const consola = require('consola');

const Tour = require('../models/tour');

// exports.checkId = (req, res, next, val) => {
//   consola.info(`Id param => ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid id',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Please provide name and price',
//     });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY

    // 1a) Filtering
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    const queryObj = { ...req.query };
    excludeFields.forEach((el) => delete queryObj[el]);
    // 1b) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    // Replace all with exast match for one of the following
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // consola.info('Query: ', JSON.parse(queryStr));
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field Limiting (projecting)
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }
    // EXECUTE QUERY
    const tours = await query;
    // SEND RESPONSE
    res.status(200).send({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    throw err;
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour)
      return res.status(404).json({ status: 'fail', message: 'Not found' });
    res.status(200).send({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    throw err;
  }
};

exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
