const fs = require('fs');

const express = require('express');

const tours = require('./dev-data/data/tours-simple.json');
const { fail } = require('assert');

const app = express();

// Middleware
app.use(express.json());

// Controller functions
const getAllTours = (req, res) => {
  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

const getTourById = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find(t => t.id === id);
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Not found' });

  res.status(200).send({
    status: 'success',
    data: { tour },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    './dev-data/data/tours-simple.json',
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

const updateTour = (req, res) => {
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

const deleteTour = (req, res) => {
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

// Routes
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(deleteTour);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
