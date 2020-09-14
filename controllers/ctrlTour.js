const { default: consolaGlobalInstance } = require('consola');
const fs = require('fs');

const tours = require('../dev-data/data/tours-simple.json');

exports.checkId = (req, res, next, val) => {
  consola.info(`Id param => ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid id',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide name and price',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

exports.getTourById = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find(t => t.id === id);
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Not found' });

  res.status(200).send({
    status: 'success',
    data: { tour },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    '../dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find(t => t.id === id);
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated',
    },
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find(t => t.id === id);
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  res.status(200).json({
    status: 'success',
    data: {
      tour: null,
    },
  });
};
