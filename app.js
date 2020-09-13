const fs = require('fs');

const consola = require('consola');
const express = require('express');
const morgan = require('morgan');

const tours = require('./dev-data/data/tours-simple.json');
const { fail } = require('assert');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  consola.info('Middleware says hi! 👋');
  next();
});

// Route Handlers
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

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

const getUserById = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

// Routes
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  consola.info(`App running on port ${PORT}`);
});
